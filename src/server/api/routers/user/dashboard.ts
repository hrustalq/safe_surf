import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dashboardDataDto, type DashboardDataDto } from "./dto/dashboard.dto";

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
            isActive: true,
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
        (sub) => sub.status === "ACTIVE" && sub.isActive && sub.endDate > new Date()
      ).length;

      const totalSubscriptions = subscriptions.length;

      // Calculate data usage (mock data for now - in real implementation would come from VPN server)
      const currentPlan = currentSubscription?.plan;
      const maxBandwidth = currentPlan?.maxBandwidth;
      const usedBandwidth = BigInt(Math.floor(Math.random() * Number(maxBandwidth ?? BigInt(0))));
      const usagePercentage = maxBandwidth 
        ? Math.floor((Number(usedBandwidth) / Number(maxBandwidth)) * 100)
        : 0;

      // Calculate days until expiry
      const daysUntilExpiry = currentSubscription 
        ? Math.ceil((currentSubscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Mock connection status (would be real-time from VPN server)
      const connectionStatus = currentSubscription?.isActive ? "connected" : "disconnected";

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
          isActive: currentSubscription.isActive,
          connectionInfo: currentSubscription.connectionInfo,
          maxDevices: currentSubscription.plan.maxDevices,
          protocols: JSON.parse(currentSubscription.plan.protocols) as string[],
        } : null,
        recentActivities,
      };

      return dashboardData;
    }),
}); 