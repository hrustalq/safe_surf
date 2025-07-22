import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dashboardDataDto, type DashboardDataDto } from "./dto/dashboard.dto";
import { getUserClientStats, syncUserTrafficFromXUI, isUserOnline } from "~/lib/3x-ui/user-mapping";

export const dashboardRouter = createTRPCRouter({
  // Get dashboard data for authenticated user
  getData: protectedProcedure
    .output(dashboardDataDto)
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      // Additional safety check
      if (!userId) {
        throw new Error("User ID not found in session");
      }

      // Parallel data fetching for better performance
      const [user, subscriptions, currentSubscription] = await Promise.all([
        // Get user profile
        ctx.db.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        }),

        // Get all user subscriptions for stats
        ctx.db.subscription.findMany({
          where: { userId },
          include: {
            plan: {
              select: {
                name: true,
                nameRu: true,
                maxDevices: true,
                protocols: true,
                maxBandwidth: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),

        // Get current active subscription
        ctx.db.subscription.findFirst({
          where: {
            userId,
            status: "ACTIVE",
            endDate: {
              gte: new Date(),
            },
          },
          include: {
            plan: {
              select: {
                name: true,
                nameRu: true,
                maxDevices: true,
                protocols: true,
                maxBandwidth: true,
              },
            },
          },
          orderBy: { endDate: "desc" },
        }),
      ]);

      if (!user) {
        throw new Error("User not found");
      }

      // Calculate stats
      const activeSubscriptions = subscriptions.filter(
        (sub) => sub.status === "ACTIVE" && sub.endDate > new Date()
      ).length;

      const totalSubscriptions = subscriptions.length;

      // Get real data usage from 3x-ui
      let usedBandwidth = BigInt(0);
      let usagePercentage = 0;
      const currentPlan = currentSubscription?.plan;
      const maxBandwidth = currentSubscription?.trafficLimit ?? currentPlan?.maxBandwidth;

      if (currentSubscription) {
        try {
          // Try to get fresh stats from 3x-ui
          const userStats = await getUserClientStats(userId);
          if (userStats) {
            usedBandwidth = BigInt(userStats.totalTraffic);
            
            // Update database with fresh stats (async, don't wait)
            syncUserTrafficFromXUI(userId).catch(error => 
              console.warn("Failed to sync traffic data:", error)
            );
          } else {
            // Fallback to database stored values
            usedBandwidth = currentSubscription.trafficUsed;
          }
        } catch (error) {
          console.warn("Failed to get real-time stats, using database values:", error);
          usedBandwidth = currentSubscription.trafficUsed;
        }

        // Calculate usage percentage
        usagePercentage = maxBandwidth 
          ? Math.min(100, Math.floor((Number(usedBandwidth) / Number(maxBandwidth)) * 100))
          : 0;
      }

      // Calculate days until expiry
      const daysUntilExpiry = currentSubscription 
        ? Math.ceil((currentSubscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Get real connection status from 3x-ui
      let connectionStatus: "connected" | "disconnected" | "connecting" = "disconnected";
      
      if (currentSubscription?.status === "ACTIVE") {
        try {
          const onlineStatus = await isUserOnline(userId);
          connectionStatus = onlineStatus.isOnline ? "connected" : "disconnected";
        } catch (error) {
          console.warn("Failed to check user online status:", error);
          // Fallback to assume connected if subscription is active
          connectionStatus = "disconnected";
        }
      }

      // Generate recent activities (mock data)
      const recentActivities = [
        {
          id: "1",
          type: "connection" as const,
          description: "Подключение к серверу в Нидерландах",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
          id: "2", 
          type: "subscription" as const,
          description: currentSubscription ? `Активировано: ${currentSubscription.plan.nameRu}` : "Подписка отсутствует",
          timestamp: currentSubscription?.startDate ?? new Date(),
        },
        {
          id: "3",
          type: "connection" as const,
          description: "Отключение от VPN",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        },
      ];

      // Build response
      const dashboardData: DashboardDataDto = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email!,
          image: user.image,
          createdAt: user.createdAt,
        },
        stats: {
          activeSubscriptions,
          totalSubscriptions,
          dataUsage: {
            used: usedBandwidth,
            limit: maxBandwidth ?? null,
            percentage: usagePercentage,
          },
          daysUntilExpiry,
          connectionStatus,
        },
        currentSubscription: currentSubscription ? {
          id: currentSubscription.id,
          planName: currentSubscription.plan.name,
          planNameRu: currentSubscription.plan.nameRu,
          status: currentSubscription.status,
          startDate: currentSubscription.startDate,
          endDate: currentSubscription.endDate,
          isActive: currentSubscription.status === "ACTIVE",
          connectionInfo: currentSubscription.connectionInfo,
          maxDevices: currentSubscription.plan.maxDevices,
          protocols: JSON.parse(currentSubscription.plan.protocols) as string[],
        } : null,
        recentActivities,
      };

      return dashboardData;
    }),

  // Sync user traffic from 3x-ui
  syncTraffic: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      if (!userId) {
        throw new Error("User ID not found in session");
      }

      try {
        const success = await syncUserTrafficFromXUI(userId);
        
        if (success) {
          return {
            success: true,
            message: "Traffic data synchronized successfully",
          };
        } else {
          return {
            success: false,
            message: "Failed to sync traffic data - no active subscription or 3x-ui client found",
          };
        }
      } catch (error) {
        console.error("Error syncing user traffic:", error);
        throw new Error(
          error instanceof Error 
            ? error.message 
            : "Failed to sync traffic data"
        );
      }
    }),

  // Check real-time connection status
  getConnectionStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      if (!userId) {
        throw new Error("User ID not found in session");
      }

      try {
        const onlineStatus = await isUserOnline(userId);
        
        return {
          isOnline: onlineStatus.isOnline,
          onlineClients: onlineStatus.onlineClients.length,
          totalClients: onlineStatus.totalClients,
          connectionStatus: onlineStatus.isOnline ? "connected" : "disconnected" as const,
        };
      } catch (error) {
        console.error("Error checking connection status:", error);
        return {
          isOnline: false,
          onlineClients: 0,
          totalClients: 0,
          connectionStatus: "disconnected" as const,
        };
      }
    }),
}); 