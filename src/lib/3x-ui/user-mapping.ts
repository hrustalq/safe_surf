import { createThreeXUIClient } from "./index";
import type { Client, ClientStats } from "./schemas";
import { extractOriginalEmail, hasInboundPrefix } from "../subscription-utils";
import { db } from "~/server/db";
import { env } from "~/env";

/**
 * Interface for mapping 3x-ui clients to our database users
 */
export interface UserClientMapping {
  userId: string;
  subscriptionId: string;
  userEmail: string;
  clientId: string;
  inboundMappings: {
    inboundId: number;
    uniqueEmail: string;
    stats?: ClientStats;
  }[];
}

/**
 * Get all user-client mappings from 3x-ui inbounds
 * This helps correlate our database users with their 3x-ui clients across all inbounds
 */
export async function getUserClientMappings(): Promise<UserClientMapping[]> {
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
    console.warn("3x-ui panel not configured");
    return [];
  }

  const client = createThreeXUIClient({
    baseUrl: panelConfig.baseUrl,
    username: panelConfig.username,
    password: panelConfig.password,
  });

  try {
    // Get all subscriptions with 3x-ui client info
    const subscriptions = await db.subscription.findMany({
      where: {
        xUIClientId: { not: null },
        xUIClientEmail: { not: null },
        status: "ACTIVE",
      },
      include: {
        user: true,
      },
    });

    // Get all inbounds from 3x-ui
    const inbounds = await client.getInbounds();
    const activeInbounds = inbounds.filter(inbound => 
      inbound.enable && (inbound.protocol === "vless" || inbound.protocol === "vmess")
    );

    const mappings: UserClientMapping[] = [];

    for (const subscription of subscriptions) {
      if (!subscription.xUIClientId || !subscription.xUIClientEmail) continue;

      const userMapping: UserClientMapping = {
        userId: subscription.userId,
        subscriptionId: subscription.id,
        userEmail: subscription.user.email!,
        clientId: subscription.xUIClientId,
        inboundMappings: [],
      };

      // Find all inbounds where this client exists
      for (const inbound of activeInbounds) {
        const clientInInbound = inbound.settings.clients.find(c => c.id === subscription.xUIClientId);
        if (clientInInbound) {
          // Try to get client stats
          let stats: ClientStats | undefined;
          try {
            const clientStats = await client.getClientStats(clientInInbound.email ?? "");
            if (clientStats) {
              stats = clientStats;
            }
          } catch (statsError) {
            console.warn(`Failed to get stats for client ${clientInInbound.email}:`, statsError);
          }

          userMapping.inboundMappings.push({
            inboundId: inbound.id ?? 0,
            uniqueEmail: clientInInbound.email ?? "",
            stats,
          });
        }
      }

      if (userMapping.inboundMappings.length > 0) {
        mappings.push(userMapping);
      }
    }

    return mappings;
  } catch (error) {
    console.error("Error getting user-client mappings:", error);
    return [];
  }
}

/**
 * Get client stats for a specific user across all their inbounds
 */
export async function getUserClientStats(userId: string): Promise<{
  totalUp: number;
  totalDown: number;
  totalTraffic: number;
  inboundStats: Array<{
    inboundId: number;
    up: number;
    down: number;
    total: number;
    expiryTime: number;
    enable: boolean;
  }>;
} | null> {
  const mappings = await getUserClientMappings();
  const userMapping = mappings.find(m => m.userId === userId);

  if (!userMapping) {
    return null;
  }

  let totalUp = 0;
  let totalDown = 0;
  let totalTraffic = 0;

  const inboundStats = userMapping.inboundMappings.map(mapping => {
    const stats = mapping.stats;
    const up = stats?.up ?? 0;
    const down = stats?.down ?? 0;
    const total = stats?.total ?? 0;

    totalUp += up;
    totalDown += down;
    totalTraffic += total;

    return {
      inboundId: mapping.inboundId,
      up,
      down,
      total,
      expiryTime: stats?.expiryTime ?? 0,
      enable: stats?.enable ?? false,
    };
  });

  return {
    totalUp,
    totalDown,
    totalTraffic,
    inboundStats,
  };
}

/**
 * Sync user traffic from 3x-ui to our database
 */
export async function syncUserTrafficFromXUI(userId: string): Promise<boolean> {
  try {
    const stats = await getUserClientStats(userId);
    if (!stats) {
      console.warn(`No stats found for user ${userId}`);
      return false;
    }

    // Update subscription with latest traffic data
    const subscription = await db.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
    });

    if (!subscription) {
      console.warn(`No active subscription found for user ${userId}`);
      return false;
    }

    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        trafficUsed: BigInt(stats.totalTraffic),
        trafficUp: BigInt(stats.totalUp),
        trafficDown: BigInt(stats.totalDown),
        lastTrafficSync: new Date(),
      },
    });

    console.log(`Synced traffic for user ${userId}: ${stats.totalTraffic} bytes total`);
    return true;
  } catch (error) {
    console.error(`Error syncing traffic for user ${userId}:`, error);
    return false;
  }
}

/**
 * Find all clients in 3x-ui that match our user's original email
 * This is helpful for migration or finding orphaned clients
 */
export async function findClientsByOriginalEmail(originalEmail: string): Promise<{
  inboundId: number;
  client: Client;
  uniqueEmail: string;
}[]> {
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
    return [];
  }

  const client = createThreeXUIClient({
    baseUrl: panelConfig.baseUrl,
    username: panelConfig.username,
    password: panelConfig.password,
  });

  try {
    const inbounds = await client.getInbounds();
    const activeInbounds = inbounds.filter(inbound => 
      inbound.enable && (inbound.protocol === "vless" || inbound.protocol === "vmess")
    );

    const matches: {
      inboundId: number;
      client: Client;
      uniqueEmail: string;
    }[] = [];

    for (const inbound of activeInbounds) {
      for (const inboundClient of inbound.settings.clients) {
        const clientEmail = inboundClient.email ?? "";
        
        // Check if this client's email matches our original email
        if (hasInboundPrefix(clientEmail)) {
          const extracted = extractOriginalEmail(clientEmail);
          if (extracted === originalEmail) {
            matches.push({
              inboundId: inbound.id ?? 0,
              client: inboundClient,
              uniqueEmail: clientEmail,
            });
          }
        } else if (clientEmail === originalEmail) {
          // Direct match (old format without prefix)
          matches.push({
            inboundId: inbound.id ?? 0,
            client: inboundClient,
            uniqueEmail: clientEmail,
          });
        }
      }
    }

    return matches;
  } catch (error) {
    console.error("Error finding clients by original email:", error);
    return [];
  }
}

/**
 * Check if user is currently online (connected to VPN)
 */
export async function isUserOnline(userId: string): Promise<{
  isOnline: boolean;
  onlineClients: string[];
  totalClients: number;
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
  } else if (env.THREEXUI_BASE_URL && env.THREEXUI_USERNAME && env.THREEXUI_PASSWORD) {
    panelConfig = {
      baseUrl: env.THREEXUI_BASE_URL,
      username: env.THREEXUI_USERNAME,
      password: env.THREEXUI_PASSWORD,
    };
  }

  if (!panelConfig) {
    return {
      isOnline: false,
      onlineClients: [],
      totalClients: 0,
    };
  }

  try {
    const mappings = await getUserClientMappings();
    const userMapping = mappings.find(m => m.userId === userId);

    if (!userMapping) {
      return {
        isOnline: false,
        onlineClients: [],
        totalClients: 0,
      };
    }

    const client = createThreeXUIClient({
      baseUrl: panelConfig.baseUrl,
      username: panelConfig.username,
      password: panelConfig.password,
    });

    // Get online clients from 3x-ui
    const onlineClients = await client.getOnlineClients();
    
    // Check if any of user's emails are in the online list
    const userOnlineClients: string[] = [];
    
    if (Array.isArray(onlineClients)) {
      for (const mapping of userMapping.inboundMappings) {
        // Handle both string array and object array formats
        const isOnline = onlineClients.some(client => {
          if (typeof client === 'string') {
            return client === mapping.uniqueEmail;
          } else {
            return client.email === mapping.uniqueEmail;
          }
        });
        
        if (isOnline) {
          userOnlineClients.push(mapping.uniqueEmail);
        }
      }
    }

    return {
      isOnline: userOnlineClients.length > 0,
      onlineClients: userOnlineClients,
      totalClients: userMapping.inboundMappings.length,
    };
  } catch (error) {
    console.error(`Error checking online status for user ${userId}:`, error);
    return {
      isOnline: false,
      onlineClients: [],
      totalClients: 0,
    };
  }
}

/**
 * Reset client traffic across all inbounds for a user
 */
export async function resetUserTrafficInXUI(userId: string): Promise<boolean> {
  const mappings = await getUserClientMappings();
  const userMapping = mappings.find(m => m.userId === userId);

  if (!userMapping) {
    console.warn(`No mapping found for user ${userId}`);
    return false;
  }

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
    return false;
  }

  const client = createThreeXUIClient({
    baseUrl: panelConfig.baseUrl,
    username: panelConfig.username,
    password: panelConfig.password,
  });

  try {
    let successCount = 0;
    
    for (const mapping of userMapping.inboundMappings) {
      try {
        const success = await client.resetClientStats(mapping.inboundId, mapping.uniqueEmail);
        if (success) {
          successCount++;
          console.log(`Reset traffic for ${mapping.uniqueEmail} in inbound ${mapping.inboundId}`);
        }
      } catch (error) {
        console.error(`Failed to reset traffic for ${mapping.uniqueEmail}:`, error);
      }
    }

    // Also reset in our database
    if (successCount > 0) {
      await db.subscription.updateMany({
        where: { userId, status: "ACTIVE" },
        data: {
          trafficUsed: 0,
          trafficUp: 0,
          trafficDown: 0,
          lastTrafficSync: new Date(),
        },
      });
    }

    console.log(`Reset traffic for ${successCount}/${userMapping.inboundMappings.length} client instances`);
    return successCount > 0;
  } catch (error) {
    console.error(`Error resetting user traffic for ${userId}:`, error);
    return false;
  }
}