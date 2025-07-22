import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";

export const systemRouter = createTRPCRouter({
  getOverview: adminProcedure
    .query(async ({ ctx }) => {
      // Get server stats
      const totalServers = await ctx.db.xUIServer.count();
      const activeServers = await ctx.db.xUIServer.count({
        where: { isActive: true },
      });

      // Mock system health data - in production this would come from monitoring tools
      const systemHealth = activeServers > 0 ? "healthy" : "warning";
      
      // Mock system metrics - in production these would be real system metrics
      const memoryUsage = Math.floor(Math.random() * 30) + 40; // 40-70%
      const cpuUsage = Math.floor(Math.random() * 20) + 10; // 10-30%
      
      // Mock uptime - in production this would be real uptime
      const uptimeHours = Math.floor(Math.random() * 100) + 100;
      const uptimeDays = Math.floor(uptimeHours / 24);
      const remainingHours = uptimeHours % 24;
      const uptime = `${uptimeDays}д ${remainingHours}ч`;

      return {
        systemHealth,
        totalServers,
        activeServers,
        memoryUsage,
        cpuUsage,
        uptime,
        databaseStatus: "connected", // In production, check actual DB connection
        lastBackup: new Date().toISOString(), // Mock data
      };
    }),
}); 