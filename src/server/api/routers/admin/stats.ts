import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";

export const statsRouter = createTRPCRouter({
  getTotalUsers: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.user.count();
    }),

  getActiveSubscriptions: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.subscription.count({
        where: {
          status: "ACTIVE",
          isActive: true,
          endDate: {
            gte: new Date(),
          },
        },
      });
    }),

  getTotalRevenue: adminProcedure
    .query(async ({ ctx }) => {
      // Get all active subscriptions with their plan pricing
      const subscriptions = await ctx.db.subscription.findMany({
        where: {
          status: "ACTIVE",
        },
        include: {
          plan: true,
        },
      });

      // Calculate total monthly revenue from active subscriptions
      const totalRevenue = subscriptions.reduce((sum, sub) => {
        return sum + Number(sub.plan.price);
      }, 0);

      return totalRevenue;
    }),

  getActiveServers: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.xUIServer.count({
        where: {
          isActive: true,
        },
      });
    }),
}); 