import { createThreeXUIClient } from "./3x-ui";
import { generateUUID } from "./3x-ui/utils";
import { generateUniqueInboundEmail } from "./subscription-utils";
import { db } from "~/server/db";
import { env } from "~/env";

export interface SubscriptionLimits {
  limitIp: number;
  totalGB: number;
  expiryTime: number;
}

/**
 * Add user to all active inbounds when they get a new subscription
 */
export async function addUserToAllInbounds(
  subscriptionId: string,
  clientId: string,
  clientEmail: string,
  limits: SubscriptionLimits
): Promise<{
  success: boolean;
  addedCount: number;
  totalInbounds: number;
  errors: string[];
}> {
  // Try to get active panel from database first
  const activePanel = await db.xUIPanel.findFirst({
    where: { isActive: true },
  });

  // Fallback to environment variables if no database panel is configured
  let panelConfig: { baseUrl: string; username: string; password: string } | null = null;
  
  if (activePanel) {
    panelConfig = {
      baseUrl: activePanel.apiUrl,
      username: activePanel.username,
      password: activePanel.password,
    };
    console.log(`Using panel from database: ${activePanel.name} (${activePanel.host})`);
  } else if (env.THREEXUI_BASE_URL && env.THREEXUI_USERNAME && env.THREEXUI_PASSWORD) {
    panelConfig = {
      baseUrl: env.THREEXUI_BASE_URL,
      username: env.THREEXUI_USERNAME,
      password: env.THREEXUI_PASSWORD,
    };
    console.log("Using panel from environment variables");
  }

  if (!panelConfig) {
    console.warn("3x-ui panel not configured (neither in database nor environment variables)");
    return {
      success: false,
      addedCount: 0,
      totalInbounds: 0,
      errors: ["3x-ui panel not configured. Please add a panel via admin interface or set environment variables."],
    };
  }

  const client = createThreeXUIClient({
    baseUrl: panelConfig.baseUrl,
    username: panelConfig.username,
    password: panelConfig.password,
    debug: true,
  });

  try {
    console.log(`Adding user to all inbounds - subscription: ${subscriptionId}, client: ${clientId}, email: ${clientEmail}`);

    // Test connection first
    const connected = await client.testConnection();
    if (!connected) {
      throw new Error("Cannot connect to 3x-ui panel");
    }

    // Get all active inbounds
    const inbounds = await client.getInbounds();
    const activeInbounds = inbounds.filter(inbound => 
      inbound.enable && (inbound.protocol === "vless" || inbound.protocol === "vmess")
    );

    console.log(`Found ${activeInbounds.length} active inbounds`);

    if (activeInbounds.length === 0) {
      throw new Error("No active VLESS/VMESS inbounds found");
    }

    let addedCount = 0;
    const errors: string[] = [];

    // Add client to each active inbound
    for (const inbound of activeInbounds) {
      try {
        // Create unique email for this inbound
        const uniqueEmail = generateUniqueInboundEmail(inbound.id, clientEmail);

        const clientData = {
          id: clientId,
          email: uniqueEmail,
          limitIp: limits.limitIp,
          totalGB: limits.totalGB,
          expiryTime: limits.expiryTime,
          enable: true,
          tgId: "",
          subId: subscriptionId,
          reset: 0,
          flow: inbound.protocol === "vless" ? "xtls-rprx-vision" : "",
          comment: "Safe Surf User",
        };

        console.log(`Adding client to inbound ${inbound.id} (${inbound.remark}) with email: ${uniqueEmail}`);

        const success = await client.addClient(inbound.id ?? 0, clientData);
        
        if (success) {
          addedCount++;
          console.log(`✓ Successfully added client to inbound ${inbound.id}`);
        } else {
          const errorMsg = `Failed to add client to inbound ${inbound.id} (${inbound.remark})`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      } catch (error) {
        const errorMsg = `Error adding client to inbound ${inbound.id}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    const result = {
      success: addedCount > 0,
      addedCount,
      totalInbounds: activeInbounds.length,
      errors,
    };

    console.log(`Add user result:`, result);

    return result;
  } catch (error) {
    console.error("Error in addUserToAllInbounds:", error);
    throw error;
  }
}

/**
 * Update user limits across all inbounds
 */
export async function updateUserLimitsInAllInbounds(
  subscriptionId: string,
  clientId: string,
  clientEmail: string,
  newLimits: SubscriptionLimits
): Promise<{
  success: boolean;
  updatedCount: number;
  totalClients: number;
  errors: string[];
}> {
  // Try to get active panel from database first
  const activePanel = await db.xUIPanel.findFirst({
    where: { isActive: true },
  });

  // Fallback to environment variables if no database panel is configured
  let panelConfig: { baseUrl: string; username: string; password: string } | null = null;
  
  if (activePanel) {
    panelConfig = {
      baseUrl: activePanel.apiUrl,
      username: activePanel.username,
      password: activePanel.password,
    };
    console.log(`Using panel from database: ${activePanel.name} (${activePanel.host})`);
  } else if (env.THREEXUI_BASE_URL && env.THREEXUI_USERNAME && env.THREEXUI_PASSWORD) {
    panelConfig = {
      baseUrl: env.THREEXUI_BASE_URL,
      username: env.THREEXUI_USERNAME,
      password: env.THREEXUI_PASSWORD,
    };
    console.log("Using panel from environment variables");
  }

  if (!panelConfig) {
    console.warn("3x-ui panel not configured (neither in database nor environment variables)");
    return {
      success: false,
      updatedCount: 0,
      totalClients: 0,
      errors: ["3x-ui panel not configured. Please add a panel via admin interface or set environment variables."],
    };
  }

  const client = createThreeXUIClient({
    baseUrl: panelConfig.baseUrl,
    username: panelConfig.username,
    password: panelConfig.password,
    debug: true,
  });

  try {
    console.log(`Updating user limits - subscription: ${subscriptionId}, client: ${clientId}`);

    // Test connection first
    const connected = await client.testConnection();
    if (!connected) {
      throw new Error("Cannot connect to 3x-ui panel");
    }

    // Get all inbounds and find where this client exists
    const inbounds = await client.getInbounds();
    const activeInbounds = inbounds.filter(inbound => 
      inbound.enable && (inbound.protocol === "vless" || inbound.protocol === "vmess")
    );

    let updatedCount = 0;
    let totalClients = 0;
    const errors: string[] = [];

    for (const inbound of activeInbounds) {
      // Check if client exists in this inbound
      const clientInInbound = inbound.settings.clients.find(c => c.id === clientId);
      
      if (clientInInbound) {
        totalClients++;
        try {
          const success = await client.updateClient(inbound.id ?? 0, clientId, {
            limitIp: newLimits.limitIp,
            totalGB: newLimits.totalGB,
            expiryTime: newLimits.expiryTime,
          });
          
          if (success) {
            updatedCount++;
            console.log(`✓ Updated client limits in inbound ${inbound.id}`);
          } else {
            const errorMsg = `Failed to update client in inbound ${inbound.id}`;
            console.error(errorMsg);
            errors.push(errorMsg);
          }
        } catch (error) {
          const errorMsg = `Error updating client in inbound ${inbound.id}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }
    }

    const result = {
      success: updatedCount > 0,
      updatedCount,
      totalClients,
      errors,
    };

    console.log(`Update limits result:`, result);

    return result;
  } catch (error) {
    console.error("Error in updateUserLimitsInAllInbounds:", error);
    throw error;
  }
}

/**
 * Handle subscription creation - add user to all inbounds
 */
export async function handleSubscriptionCreation(subscriptionId: string): Promise<void> {
  try {
    console.log(`Handling subscription creation: ${subscriptionId}`);

    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: true,
        plan: true,
      },
    });

    if (!subscription) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }

    if (!subscription.user.email) {
      throw new Error(`User email not found for subscription ${subscriptionId}`);
    }

    // Generate client ID if not exists
    let clientId = subscription.xUIClientId;
    clientId ??= generateUUID();

    // Calculate limits based on plan
    const limits: SubscriptionLimits = {
      limitIp: subscription.plan.maxDevices, // Use plan's max devices
      totalGB: subscription.plan.maxBandwidth ? Number(subscription.plan.maxBandwidth) / (1024 * 1024 * 1024) : 0, // Convert bytes to GB, 0 = unlimited
      expiryTime: subscription.endDate.getTime(),
    };

    // Add user to all inbounds
    const result = await addUserToAllInbounds(
      subscriptionId,
      clientId,
      subscription.user.email,
      limits
    );

    if (result.success) {
      // Update subscription with client info
      await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          xUIClientId: clientId,
          xUIClientEmail: subscription.user.email,
        },
      });

      console.log(`✓ Successfully added user to ${result.addedCount}/${result.totalInbounds} inbounds`);
    } else {
      throw new Error(`Failed to add user to any inbound. Errors: ${result.errors.join(', ')}`);
    }
  } catch (error) {
    console.error(`Error handling subscription creation:`, error);
    throw error;
  }
}

/**
 * Handle subscription update - update user limits
 */
export async function handleSubscriptionUpdate(subscriptionId: string): Promise<void> {
  try {
    console.log(`Handling subscription update: ${subscriptionId}`);

    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: true,
        plan: true,
      },
    });

    if (!subscription) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }

    if (!subscription.xUIClientId) {
      // If no client ID, treat as new subscription
      return await handleSubscriptionCreation(subscriptionId);
    }

    if (!subscription.user.email) {
      throw new Error(`User email not found for subscription ${subscriptionId}`);
    }

    // Calculate new limits based on updated plan
    const newLimits: SubscriptionLimits = {
      limitIp: subscription.plan.maxDevices, // Use plan's max devices
      totalGB: subscription.plan.maxBandwidth ? Number(subscription.plan.maxBandwidth) / (1024 * 1024 * 1024) : 0, // Convert bytes to GB, 0 = unlimited
      expiryTime: subscription.endDate.getTime(),
    };

    // Update user limits in all inbounds
    const result = await updateUserLimitsInAllInbounds(
      subscriptionId,
      subscription.xUIClientId,
      subscription.user.email,
      newLimits
    );

    if (result.success) {
      console.log(`✓ Successfully updated limits for ${result.updatedCount}/${result.totalClients} client instances`);
    } else if (result.totalClients === 0) {
      // No clients found, add user to inbounds
      console.log("No clients found, adding user to inbounds...");
      await handleSubscriptionCreation(subscriptionId);
    } else {
      console.warn(`Some updates failed. Updated: ${result.updatedCount}/${result.totalClients}. Errors: ${result.errors.join(', ')}`);
    }
  } catch (error) {
    console.error(`Error handling subscription update:`, error);
    throw error;
  }
}

/**
 * Test connection and inbound access
 */
export async function testSubscriptionSetup(): Promise<{
  success: boolean;
  message: string;
  inboundsCount: number;
}> {
  try {
    // Try to get active panel from database first
    const activePanel = await db.xUIPanel.findFirst({
      where: { isActive: true },
    });

    // Fallback to environment variables if no database panel is configured
    let panelConfig: { baseUrl: string; username: string; password: string } | null = null;
    
    if (activePanel) {
      panelConfig = {
        baseUrl: activePanel.apiUrl,
        username: activePanel.username,
        password: activePanel.password,
      };
    } else if (env.THREEXUI_BASE_URL && env.THREEXUI_USERNAME && env.THREEXUI_PASSWORD) {
      panelConfig = {
        baseUrl: env.THREEXUI_BASE_URL,
        username: env.THREEXUI_USERNAME,
        password: env.THREEXUI_PASSWORD,
      };
    }

    if (!panelConfig) {
      return {
        success: false,
        message: "3x-ui panel not configured. Please add a panel via admin interface or set environment variables.",
        inboundsCount: 0,
      };
    }

    const client = createThreeXUIClient({
      baseUrl: panelConfig.baseUrl,
      username: panelConfig.username,
      password: panelConfig.password,
      debug: true,
    });

    const connected = await client.testConnection();
    if (!connected) {
      return {
        success: false,
        message: "Cannot connect to 3x-ui panel",
        inboundsCount: 0,
      };
    }

    const inbounds = await client.getInbounds();
    const activeInbounds = inbounds.filter(inbound => 
      inbound.enable && (inbound.protocol === "vless" || inbound.protocol === "vmess")
    );

    return {
      success: true,
      message: `Connected successfully. Found ${activeInbounds.length} active inbounds.`,
      inboundsCount: activeInbounds.length,
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection test failed: ${error instanceof Error ? error.message : String(error)}`,
      inboundsCount: 0,
    };
  }
}