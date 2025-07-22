import { generateUUID, generateClientUrl } from "./3x-ui/utils";
import { createThreeXUIClient } from "./3x-ui";
import type { ThreeXUIClient } from "./3x-ui/client";
import type { Inbound } from "./3x-ui/schemas";
import { db } from "~/server/db";
import QRCode from "qrcode";
import { env } from "~/env";

export interface ConfigUrl {
  protocol: string;
  url: string;
  name: string;
}

export interface QRCodeData {
  protocol: string;
  qrCode: string; // Base64 encoded PNG
}

export interface ServerDetails {
  host: string;
  port: number;
  protocol: string;
  inboundId: number;
  serverId?: string;
}

/**
 * Generate unique email for 3x-ui inbound
 * 
 * 3x-ui has a known bug where using the same email address across multiple inbounds
 * causes conflicts and can lead to client creation failures or unexpected behavior.
 * 
 * This function creates a unique email by prefixing the original email with the inbound ID.
 * 
 * @param inboundId - The 3x-ui inbound ID (will use 0 if undefined)
 * @param originalEmail - The user's original email address
 * @returns Unique email in format: "{inboundId}-{cleanedEmail}"
 * 
 * @example
 * generateUniqueInboundEmail(123, "user@example.com") // returns "123-user@example.com"
 * generateUniqueInboundEmail(456, "test+special@domain.co") // returns "456-test+special@domain.co"
 */
export function generateUniqueInboundEmail(inboundId: number | undefined, originalEmail: string): string {
  const cleanId = inboundId ?? 0;
  // Clean email but preserve @ symbol and common email characters
  const cleanEmail = originalEmail.replace(/[^a-zA-Z0-9@._+-]/g, '');
  return `${cleanId}-${cleanEmail}`;
}

/**
 * Extract original email from unique inbound email
 * 
 * @param uniqueEmail - Email in format "{inboundId}-{originalEmail}"
 * @returns Original email address or the unique email if format doesn't match
 * 
 * @example
 * extractOriginalEmail("123-user@example.com") // returns "user@example.com"
 * extractOriginalEmail("user@example.com") // returns "user@example.com" (no prefix)
 */
export function extractOriginalEmail(uniqueEmail: string): string {
  const regex = /^\d+-(.+)$/;
  const match = regex.exec(uniqueEmail);
  return match?.[1] ?? uniqueEmail;
}

/**
 * Extract inbound ID from unique inbound email
 * 
 * @param uniqueEmail - Email in format "{inboundId}-{originalEmail}"
 * @returns Inbound ID or null if format doesn't match
 * 
 * @example
 * extractInboundIdFromEmail("123-user@example.com") // returns 123
 * extractInboundIdFromEmail("user@example.com") // returns null
 */
export function extractInboundIdFromEmail(uniqueEmail: string): number | null {
  const regex = /^(\d+)-.+$/;
  const match = regex.exec(uniqueEmail);
  return match?.[1] ? parseInt(match[1], 10) : null;
}

/**
 * Check if email has inbound prefix
 * 
 * @param email - Email address to check
 * @returns True if email has inbound prefix format
 */
export function hasInboundPrefix(email: string): boolean {
  return /^\d+-.+$/.test(email);
}

/**
 * Generate QR code from config URL
 */
export async function generateQRCode(configUrl: string): Promise<string> {
  try {
    // Validate URL format before generating QR
    if (!configUrl || typeof configUrl !== 'string') {
      throw new Error('Invalid config URL provided');
    }
    
    // Check for supported protocols
    const supportedProtocols = ['vmess://', 'vless://', 'trojan://', 'ss://'];
    const hasValidProtocol = supportedProtocols.some(protocol => configUrl.startsWith(protocol));
    
    if (!hasValidProtocol) {
      throw new Error(`Unsupported protocol in URL: ${configUrl.split('://')[0]}`);
    }
    
    return await QRCode.toDataURL(configUrl, {
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256,
      errorCorrectionLevel: 'M', // Better error correction for long URLs
    });
  } catch (error) {
    console.error('Error generating QR code for URL:', configUrl, error);
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create trial subscription for new user
 */
export async function createTrialSubscription(userId: string): Promise<{
  subscription: {
    id: string;
    userId: string;
    planId: string;
    status: string;
    startDate: Date;
    endDate: Date;
  };
  configUrls: ConfigUrl[];
  qrCodes: QRCodeData[];
}> {
  try {
    // Get trial plan
    const trialPlan = await db.vpnPlan.findFirst({
      where: {
        name: "Trial",
        isActive: true,
      },
    });

    if (!trialPlan) {
      throw new Error("Trial plan not found");
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Generate client ID and email for 3x-ui
    const clientId = generateUUID();
    const clientEmail = `${user.email}`;

    // Calculate end date (7 days from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    // Create subscription
    const subscription = await db.subscription.create({
      data: {
        userId,
        planId: trialPlan.id,
        status: "ACTIVE",
        endDate,
        xUIClientId: clientId,
        xUIClientEmail: clientEmail,
        trafficLimit: trialPlan.maxBandwidth,
      },
    });

    // Initialize config arrays
    const configUrls: ConfigUrl[] = [];
    const qrCodes: QRCodeData[] = [];

    // Use the comprehensive subscription management system
    try {
      console.log(`Creating trial subscription for user ${userId}, subscription ${subscription.id}`);
      
      // Import and use the subscription management function
      const { handleSubscriptionCreation } = await import('./subscription-management');
      await handleSubscriptionCreation(subscription.id);
      
      // Generate configs after successful 3x-ui integration
      const configs = await generateSubscriptionConfigs(subscription.id);
      configUrls.push(...configs.configUrls);
      qrCodes.push(...configs.qrCodes);
      
      console.log(`Successfully set up trial subscription with ${configs.configUrls.length} config URLs`);
    } catch (xuiError) {
      console.error("Failed to set up trial in 3x-ui:", xuiError);
      // Don't fail the whole signup process, just log the error
      // The subscription is still created and can be synced later
      console.warn(`Trial subscription ${subscription.id} created but 3x-ui setup failed. User can retry from onboarding.`);
    }

    // Update subscription with config data
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        configUrls: JSON.stringify(configUrls),
        qrCodes: JSON.stringify(qrCodes),
      },
    });

    return {
      subscription,
      configUrls,
      qrCodes,
    };
  } catch (error) {
    console.error("Error creating trial subscription:", error);
    throw error;
  }
}

/**
 * Add client to specific 3x-ui inbounds
 * 
 * Note: 3x-ui has a bug where duplicate email addresses across inbounds cause conflicts.
 * We solve this by prefixing each email with the inbound ID to ensure uniqueness.
 */
async function addClientTo3XUIInbounds(
  client: ThreeXUIClient, 
  clientId: string, 
  clientEmail: string, 
  subscriptionId: string,
  inbounds: Inbound[]
): Promise<void> {
  if (inbounds.length === 0) {
    throw new Error("No inbounds provided to add client to");
  }

  // Add client to each inbound
  const promises = inbounds.map(async (inbound) => {
    try {
      // Create unique email for each inbound to prevent 3x-ui email collisions
      const uniqueEmail = generateUniqueInboundEmail(inbound.id, clientEmail);
      
      const clientData = {
        id: clientId,
        email: uniqueEmail,
        limitIp: 2, // Trial/default limit
        totalGB: 5, // 5GB limit
        expiryTime: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
        enable: true,
        tgId: "",
        subId: subscriptionId,
        reset: 0,
        flow: inbound.protocol === "vless" ? "xtls-rprx-vision" : "",
        comment: "Safe Surf User",
      };
      
      console.log(`Adding client with unique email: ${uniqueEmail} to inbound ${inbound.id}`);

      const success = await client.addClient(inbound.id ?? 0, clientData);
      if (success) {
        console.log(`Added client to inbound ${inbound.id} (${inbound.remark})`);
        return { inboundId: inbound.id ?? 0, success: true };
      } else {
        console.error(`Failed to add client to inbound ${inbound.id}`);
        return { inboundId: inbound.id ?? 0, success: false };
      }
    } catch (error) {
      console.error(`Error adding client to inbound ${inbound.id}:`, error);
      return { inboundId: inbound.id ?? 0, success: false };
    }
  });

  const results = await Promise.all(promises);
  const successCount = results.filter(r => r.success).length;
  
  if (successCount === 0) {
    throw new Error("Failed to add client to any inbound");
  }

  console.log(`Successfully added client to ${successCount}/${results.length} inbounds`);
}


/**
 * Generate subscription config URLs and QR codes
 */
export async function generateSubscriptionConfigs(subscriptionId: string): Promise<{
  configUrls: ConfigUrl[];
  qrCodes: QRCodeData[];
  serverDetails: ServerDetails[];
}> {
  // Try to get active panel from database first
  const activePanel = await db.xUIPanel.findFirst({
    where: { isActive: true },
  });

  // Fallback to environment variables if no database panel is configured
  let panelConfig: { baseUrl: string; username: string; password: string; host: string } | null = null;
  
  if (activePanel) {
    panelConfig = {
      baseUrl: activePanel.apiUrl,
      username: activePanel.username,
      password: activePanel.password,
      host: activePanel.host,
    };
  } else if (env.THREEXUI_BASE_URL && env.THREEXUI_USERNAME && env.THREEXUI_PASSWORD) {
    const serverUrl = new URL(env.THREEXUI_BASE_URL);
    panelConfig = {
      baseUrl: env.THREEXUI_BASE_URL,
      username: env.THREEXUI_USERNAME,
      password: env.THREEXUI_PASSWORD,
      host: serverUrl.hostname,
    };
  }

  if (!panelConfig) {
    return { configUrls: [], qrCodes: [], serverDetails: [] };
  }

  const subscription = await db.subscription.findUnique({
    where: { id: subscriptionId },
    include: { user: true },
  });

  if (!subscription || !subscription.xUIClientId || !subscription.xUIClientEmail) {
    throw new Error("Subscription or client info not found");
  }

  const client = createThreeXUIClient({
    baseUrl: panelConfig.baseUrl,
    username: panelConfig.username,
    password: panelConfig.password,
  });

  try {
    // Get parsed inbounds from API (already parsed by the client)
    const inbounds = await client.getInbounds();
    console.log(`Found ${inbounds.length} total inbounds for subscription ${subscriptionId}`);
    
    // Filter active inbounds (vless/vmess only)
    const eligibleInbounds = inbounds.filter(inbound => 
      inbound.enable && (inbound.protocol === "vless" || inbound.protocol === "vmess")
    );
    console.log(`Found ${eligibleInbounds.length} active VLESS/VMESS inbounds`);
    
    // Debug: Log inbound details
    eligibleInbounds.forEach(inbound => {
      const clientCount = inbound.settings.clients.length;
      const hasOurClient = inbound.settings.clients.some(c => c.id === subscription.xUIClientId);
      console.log(`Inbound ${inbound.id} (${inbound.remark}): ${clientCount} clients, has our client: ${hasOurClient}`);
      
      // Log client IDs for debugging
      if (clientCount > 0) {
        const clientIds = inbound.settings.clients.map(c => c.id).slice(0, 3); // Show first 3
        console.log(`  Client IDs (first 3): ${clientIds.join(', ')}${clientCount > 3 ? '...' : ''}`);
      }
    });
    
    console.log(`Looking for client ID: ${subscription.xUIClientId}`);
    
    // Filter inbounds that have our client
    let activeInbounds = eligibleInbounds.filter(inbound => 
      inbound.settings.clients.some(c => c.id === subscription.xUIClientId)
    );
    
    console.log(`Found ${activeInbounds.length} inbounds containing our client`);

    // If no inbounds have our client, try to add it to all eligible inbounds
    if (activeInbounds.length === 0 && eligibleInbounds.length > 0) {
      console.log(`Client not found in any inbounds. Attempting to add to ${eligibleInbounds.length} eligible inbounds...`);
      
      try {
        await addClientTo3XUIInbounds(
          client, 
          subscription.xUIClientId, 
          subscription.xUIClientEmail, 
          subscriptionId,
          eligibleInbounds
        );
        
        // Refetch inbounds after adding client
        const updatedInbounds = await client.getInbounds();
        const updatedActiveInbounds = updatedInbounds
          .filter(inbound => inbound.enable && (inbound.protocol === "vless" || inbound.protocol === "vmess"))
          .filter(inbound => inbound.settings.clients.some(c => c.id === subscription.xUIClientId));
        
        console.log(`After adding client, found ${updatedActiveInbounds.length} inbounds containing our client`);
        
        // Use updated inbounds for config generation
        activeInbounds = updatedActiveInbounds;
      } catch (addError) {
        console.error("Failed to add client to inbounds:", addError);
        // Continue with empty activeInbounds array
      }
    }

    const configUrls: ConfigUrl[] = [];
    const qrCodes: QRCodeData[] = [];
    const serverDetails: ServerDetails[] = [];

    // Extract server host from panel config
    const serverHost = panelConfig.host;

    for (const inbound of activeInbounds) {
      // First, try to find client by subscription's stored UUID
      let clientInInbound = inbound.settings.clients.find(c => c.id === subscription.xUIClientId);
      
      // If not found, try to find by email (in case UUID doesn't match)
      if (!clientInInbound && subscription.xUIClientEmail) {
        const expectedEmail = generateUniqueInboundEmail(inbound.id, subscription.xUIClientEmail);
        clientInInbound = inbound.settings.clients.find(c => c.email === expectedEmail);
        
        if (clientInInbound) {
          console.log(`Found client by email ${expectedEmail}, UUID mismatch: stored=${subscription.xUIClientId}, actual=${clientInInbound.id}`);
          // Update subscription with the correct UUID from 3x-ui
          await db.subscription.update({
            where: { id: subscription.id },
            data: { xUIClientId: clientInInbound.id },
          });
        }
      }
      
      if (!clientInInbound) {
        console.warn(`Client not found in inbound ${inbound.id} for subscription ${subscription.id}`);
        continue;
      }

      // Use the ACTUAL client UUID from the inbound, not our stored one
      // Map client data and stream settings properly
      const clientConfig = {
        id: clientInInbound.id,
        flow: clientInInbound.flow ?? "",
        encryption: "none",
        streamSettings: inbound.streamSettings,
        // Add legacy support for older parsing
        network: inbound.streamSettings?.network,
        security: inbound.streamSettings?.security,
        alterId: 0, // Default alterId for VMess
      };

      try {
        // Create a clean remark similar to 3x-ui panel format - keep it simple
        const cleanRemark = `${inbound.remark}-${inbound.id}-${subscription.xUIClientEmail}`;
        
        const configUrl = generateClientUrl(
          inbound.protocol,
          clientConfig,
          serverHost,
          inbound.port,
          cleanRemark
        );
        
        console.log(`Generated ${inbound.protocol.toUpperCase()} config URL for inbound ${inbound.id}`);

        configUrls.push({
          protocol: inbound.protocol.toUpperCase(),
          url: configUrl,
          name: inbound.remark,
        });

        // Generate QR code
        const qrCode = await generateQRCode(configUrl);
        qrCodes.push({
          protocol: inbound.protocol.toUpperCase(),
          qrCode,
        });

        serverDetails.push({
          host: serverHost,
          port: inbound.port,
          protocol: inbound.protocol,
          inboundId: inbound.id ?? 0,
        });
      } catch (urlError) {
        console.error(`Failed to generate config URL for inbound ${inbound.id}:`, urlError);
        // Continue with next inbound instead of failing completely
      }
    }

    return { configUrls, qrCodes, serverDetails };
  } catch (error) {
    console.error("Error generating configs:", error);
    throw error;
  }
}

/**
 * Update user's 3x-ui client ID
 */
export async function updateUserXUIClientId(userId: string, clientId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { xUIClientId: clientId },
  });
} 