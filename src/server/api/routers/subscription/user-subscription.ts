import { protectedProcedure } from "../../trpc";
import { generateSubscriptionConfigs } from "~/lib/subscription-utils";
import { handleSubscriptionUpdate } from "~/lib/subscription-management";

export const getUserSubscription = protectedProcedure.query(async ({ ctx }) => {
  const subscription = await ctx.db.subscription.findFirst({
    where: {
      userId: ctx.session.user.id,
      status: "ACTIVE",
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!subscription) {
    return null;
  }

  return {
    ...subscription,
    plan: {
      ...subscription.plan,
      features: JSON.parse(subscription.plan.features) as string[],
      featuresRu: JSON.parse(subscription.plan.featuresRu) as string[],
      protocols: JSON.parse(subscription.plan.protocols) as string[],
      price: Number(subscription.plan.price),
    },
  };
});

export const getSubscriptionUrl = protectedProcedure.query(async ({ ctx }) => {
  const subscription = await ctx.db.subscription.findFirst({
    where: {
      userId: ctx.session.user.id,
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!subscription) {
    return null;
  }

  // Check if subscription has a UUID, if not, generate one
  let subscriptionUuid = subscription.uuid;
  if (!subscriptionUuid) {
    // Generate UUID for old subscriptions that don't have one
    // Use crypto.randomUUID() if available, otherwise use a simple random string
    subscriptionUuid = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Update subscription with new UUID
    await ctx.db.subscription.update({
      where: { id: subscription.id },
      data: { uuid: subscriptionUuid },
    });
  }

  // Get the base URL from the environment
  // In production, NEXTAUTH_URL should be set to your actual domain
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://safesurf.tech';
  const subscriptionUrl = `${baseUrl}/api/sub/${subscriptionUuid}`;

  return {
    subscriptionUrl,
    uuid: subscriptionUuid,
    instructions: {
      ru: "Скопируйте эту ссылку в ваше VPN приложение для автоматического получения всех конфигураций",
      en: "Copy this link to your VPN application to automatically receive all configurations"
    }
  };
});

export const getFullSubscriptionData = protectedProcedure.query(async ({ ctx }) => {
  // Get user's active subscription
  const subscription = await ctx.db.subscription.findFirst({
    where: {
      userId: ctx.session.user.id,
      status: "ACTIVE",
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!subscription) {
    return {
      subscription: null,
      configUrls: [],
      qrCodes: [],
      message: "No active subscription found",
    };
  }

  // Parse existing config URLs and QR codes from database
  let configUrls: Array<{protocol: string; url: string; name: string}> = [];
  let qrCodes: Array<{protocol: string; qrCode: string}> = [];
  let serverDetails: Array<{host: string; port: number; protocol: string; inboundId: number}> = [];

  try {
    if (subscription.configUrls) {
      configUrls = JSON.parse(subscription.configUrls) as Array<{protocol: string; url: string; name: string}>;
    }
    if (subscription.qrCodes) {
      qrCodes = JSON.parse(subscription.qrCodes) as Array<{protocol: string; qrCode: string}>;
    }
    if (subscription.serverInfo) {
      serverDetails = JSON.parse(subscription.serverInfo) as Array<{host: string; port: number; protocol: string; inboundId: number}>;
    }
  } catch (parseError) {
    console.error("Error parsing stored configs:", parseError);
    // Reset arrays if parsing fails
    configUrls = [];
    qrCodes = [];
    serverDetails = [];
  }

  // Try to generate fresh configs if:
  // 1. No configs stored
  // 2. Client ID exists but no configs
  // 3. Configs stored but no server details (old format)
  const shouldGenerateConfigs = subscription.xUIClientId && (
    configUrls.length === 0 || 
    qrCodes.length === 0 || 
    serverDetails.length === 0
  );

  if (shouldGenerateConfigs) {
    try {
      console.log(`Generating fresh configs for subscription ${subscription.id}`);
      
      // First, ensure user is properly set up in all inbounds
      try {
        console.log(`Ensuring user is properly set up in 3x-ui for subscription ${subscription.id}`);
        await handleSubscriptionUpdate(subscription.id);
        console.log(`Successfully synchronized user in 3x-ui for subscription ${subscription.id}`);
      } catch (syncError) {
        console.warn(`Error synchronizing user in 3x-ui (continuing with config generation):`, syncError);
      }
      
      const freshConfigs = await generateSubscriptionConfigs(subscription.id);
      
      if (freshConfigs.configUrls.length > 0) {
        configUrls = freshConfigs.configUrls;
        qrCodes = freshConfigs.qrCodes;
        serverDetails = freshConfigs.serverDetails;

        // Update the subscription with fresh configs
        await ctx.db.subscription.update({
          where: { id: subscription.id },
          data: {
            configUrls: JSON.stringify(configUrls),
            qrCodes: JSON.stringify(qrCodes),
            serverInfo: JSON.stringify(serverDetails),
          },
        });
        
        console.log(`Successfully generated ${configUrls.length} configs for subscription ${subscription.id}`);
      } else {
        console.warn(`No configs generated for subscription ${subscription.id} - client may not exist in any inbounds`);
      }
    } catch (configError) {
      console.error(`Error generating configs for subscription ${subscription.id}:`, configError);
      // Don't fail the request, continue with existing configs (if any)
    }
  }

  // Calculate days remaining
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // Calculate usage percentage
  const usagePercentage = subscription.trafficLimit 
    ? Math.min(100, (Number(subscription.trafficUsed) / Number(subscription.trafficLimit)) * 100)
    : 0;

  return {
    subscription: {
      id: subscription.id,
      uuid: subscription.uuid, // Add UUID for subscription URL
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      isActive: subscription.status === "ACTIVE",
      daysRemaining,
      plan: {
        name: subscription.plan.name,
        nameRu: subscription.plan.nameRu,
        description: subscription.plan.description,
        descriptionRu: subscription.plan.descriptionRu,
        maxDevices: subscription.plan.maxDevices,
        durationDays: subscription.plan.durationDays,
        features: JSON.parse(subscription.plan.features) as string[],
        featuresRu: JSON.parse(subscription.plan.featuresRu) as string[],
        protocols: JSON.parse(subscription.plan.protocols) as string[],
      },
      traffic: {
        used: subscription.trafficUsed,
        limit: subscription.trafficLimit,
        usagePercentage: Math.round(usagePercentage * 100) / 100,
        usedGB: Number(subscription.trafficUsed) / (1024 * 1024 * 1024),
        limitGB: subscription.trafficLimit ? Number(subscription.trafficLimit) / (1024 * 1024 * 1024) : null,
      },
    },
    configUrls,
    qrCodes,
  };
});

/**
 * Force refresh VPN configuration URLs and QR codes
 */
export const refreshSubscriptionConfigs = protectedProcedure.mutation(async ({ ctx }) => {
  // Get user's active subscription
  const subscription = await ctx.db.subscription.findFirst({
    where: {
      userId: ctx.session.user.id,
      status: "ACTIVE",
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!subscription) {
    throw new Error("No active subscription found");
  }

  if (!subscription.xUIClientId) {
    throw new Error("Subscription not linked to 3x-ui client");
  }

  try {
    console.log(`Force refreshing configs for subscription ${subscription.id}`);
    
    // First, ensure user is properly set up in all inbounds
    try {
      console.log(`Ensuring user is properly set up in 3x-ui for subscription ${subscription.id}`);
      await handleSubscriptionUpdate(subscription.id);
      console.log(`Successfully synchronized user in 3x-ui for subscription ${subscription.id}`);
    } catch (syncError) {
      console.warn(`Error synchronizing user in 3x-ui (continuing with config generation):`, syncError);
    }
    
    const freshConfigs = await generateSubscriptionConfigs(subscription.id);
    
    if (freshConfigs.configUrls.length === 0) {
      throw new Error("No configurations could be generated. This may happen if:\\n\\n1. Your account is not properly linked to the VPN server\\n2. The VPN server is temporarily unavailable\\n3. Your subscription needs to be re-synchronized\\n\\nPlease contact support if this issue persists.");
    }

    // Update the subscription with fresh configs
    await ctx.db.subscription.update({
      where: { id: subscription.id },
      data: {
        configUrls: JSON.stringify(freshConfigs.configUrls),
        qrCodes: JSON.stringify(freshConfigs.qrCodes),
        serverInfo: JSON.stringify(freshConfigs.serverDetails),
      },
    });
    
    console.log(`Successfully refreshed ${freshConfigs.configUrls.length} configs for subscription ${subscription.id}`);

    return {
      success: true,
      message: `Successfully generated ${freshConfigs.configUrls.length} configuration(s)`,
      configCount: freshConfigs.configUrls.length,
    };
  } catch (error) {
    console.error(`Error refreshing configs for subscription ${subscription.id}:`, error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Failed to refresh configurations. Please try again later."
    );
  }
}); 