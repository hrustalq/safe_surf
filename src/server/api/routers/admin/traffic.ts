import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const trafficRouter = createTRPCRouter({
  // Sync traffic data from all 3X-UI panels
  syncAllTraffic: adminProcedure
    .mutation(async ({ ctx }) => {
      try {
        const panels = await ctx.db.xUIPanel.findMany({
          where: { isActive: true },
        });

        let totalSynced = 0;
        const results = [];

        for (const panel of panels) {
          try {
            const { ThreeXUIPanelClient } = await import("~/lib/3x-ui/panel-client");
            const client = new ThreeXUIPanelClient({
              baseUrl: panel.apiUrl,
              username: panel.username,
              password: panel.password,
              debug: false,
              timeout: 10000,
              maxRetries: 1,
            });

            // Get all inbounds and their client stats
            const inbounds = await client.getInbounds();
            
            for (const inbound of inbounds) {
              for (const clientStat of inbound.clientStats || []) {
                if (!clientStat.email) continue;

                // Find subscription by client email
                const subscription = await ctx.db.subscription.findFirst({
                  where: {
                    xUIClientEmail: clientStat.email,
                    isActive: true,
                  },
                });

                if (subscription) {
                  // Update subscription traffic data
                  await ctx.db.subscription.update({
                    where: { id: subscription.id },
                    data: {
                      trafficUp: BigInt(clientStat.up),
                      trafficDown: BigInt(clientStat.down),
                      trafficUsed: BigInt(clientStat.up + clientStat.down),
                      lastTrafficSync: new Date(),
                    },
                  });

                  // Create traffic history entry
                  await ctx.db.clientTraffic.create({
                    data: {
                      subscriptionId: subscription.id,
                      xUIInboundId: String(inbound.id),
                      xUIClientEmail: clientStat.email,
                      trafficUp: BigInt(clientStat.up),
                      trafficDown: BigInt(clientStat.down),
                      trafficTotal: BigInt(clientStat.total || clientStat.up + clientStat.down),
                      resetCount: clientStat.reset,
                    },
                  });

                  totalSynced++;
                }
              }
            }

            results.push({
              panel: panel.name,
              success: true,
              inboundsCount: inbounds.length,
            });

          } catch (error) {
            console.error(`Failed to sync traffic for panel ${panel.name}:`, error);
            results.push({
              panel: panel.name,
              success: false,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        return {
          success: true,
          totalSynced,
          results,
        };

      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync traffic data",
        });
      }
    }),

  // Sync traffic for a specific panel
  syncPanelTraffic: adminProcedure
    .input(z.object({ panelId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const panel = await ctx.db.xUIPanel.findUnique({
        where: { id: input.panelId },
      });

      if (!panel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Panel not found",
        });
      }

      try {
        const { ThreeXUIPanelClient } = await import("~/lib/3x-ui/panel-client");
        const client = new ThreeXUIPanelClient({
          baseUrl: panel.apiUrl,
          username: panel.username,
          password: panel.password,
          debug: false,
          timeout: 10000,
          maxRetries: 1,
        });

        const inbounds = await client.getInbounds();
        let syncedCount = 0;

        for (const inbound of inbounds) {
          for (const clientStat of inbound.clientStats || []) {
            if (!clientStat.email) continue;

            const subscription = await ctx.db.subscription.findFirst({
              where: {
                xUIClientEmail: clientStat.email,
                isActive: true,
              },
            });

            if (subscription) {
              await ctx.db.subscription.update({
                where: { id: subscription.id },
                data: {
                  trafficUp: BigInt(clientStat.up),
                  trafficDown: BigInt(clientStat.down),
                  trafficUsed: BigInt(clientStat.up + clientStat.down),
                  lastTrafficSync: new Date(),
                },
              });

              await ctx.db.clientTraffic.create({
                data: {
                  subscriptionId: subscription.id,
                  xUIInboundId: String(inbound.id),
                  xUIClientEmail: clientStat.email,
                  trafficUp: BigInt(clientStat.up),
                  trafficDown: BigInt(clientStat.down),
                  trafficTotal: BigInt(clientStat.total || clientStat.up + clientStat.down),
                  resetCount: clientStat.reset,
                },
              });

              syncedCount++;
            }
          }
        }

        return {
          success: true,
          syncedCount,
          inboundsCount: inbounds.length,
        };

      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync panel traffic data",
        });
      }
    }),

  // Get traffic statistics
  getTrafficStats: adminProcedure
    .query(async ({ ctx }) => {
      const [
        totalSubscriptions,
        activeSubscriptions,
        totalTraffic,
        recentTraffic,
      ] = await Promise.all([
        ctx.db.subscription.count(),
        ctx.db.subscription.count({
          where: { isActive: true },
        }),
        ctx.db.subscription.aggregate({
          _sum: {
            trafficUsed: true,
            trafficUp: true,
            trafficDown: true,
          },
        }),
        ctx.db.clientTraffic.aggregate({
          where: {
            recordedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
          _sum: {
            trafficTotal: true,
            trafficUp: true,
            trafficDown: true,
          },
        }),
      ]);

      return {
        totalSubscriptions,
        activeSubscriptions,
        totalTraffic: {
          used: totalTraffic._sum.trafficUsed?.toString() ?? "0",
          up: totalTraffic._sum.trafficUp?.toString() ?? "0",
          down: totalTraffic._sum.trafficDown?.toString() ?? "0",
        },
        last24Hours: {
          total: recentTraffic._sum.trafficTotal?.toString() ?? "0",
          up: recentTraffic._sum.trafficUp?.toString() ?? "0",
          down: recentTraffic._sum.trafficDown?.toString() ?? "0",
        },
      };
    }),

  // Get traffic history for a subscription
  getSubscriptionTraffic: adminProcedure
    .input(z.object({ 
      subscriptionId: z.string().cuid(),
      days: z.number().int().min(1).max(365).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { id: input.subscriptionId },
        include: {
          user: { select: { email: true, name: true } },
          plan: { select: { name: true } },
        },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      const startDate = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

      const trafficHistory = await ctx.db.clientTraffic.findMany({
        where: {
          subscriptionId: input.subscriptionId,
          recordedAt: { gte: startDate },
        },
        orderBy: { recordedAt: "desc" },
        take: 1000, // Limit to prevent too much data
      });

      return {
        subscription: {
          id: subscription.id,
          user: subscription.user,
          plan: subscription.plan,
          currentTraffic: {
            used: subscription.trafficUsed.toString(),
            up: subscription.trafficUp.toString(),
            down: subscription.trafficDown.toString(),
            limit: subscription.trafficLimit?.toString(),
          },
          lastSync: subscription.lastTrafficSync,
        },
        history: trafficHistory.map(entry => ({
          id: entry.id,
          trafficUp: entry.trafficUp.toString(),
          trafficDown: entry.trafficDown.toString(),
          trafficTotal: entry.trafficTotal.toString(),
          resetCount: entry.resetCount,
          recordedAt: entry.recordedAt,
        })),
      };
    }),

  // Get top traffic users
  getTopTrafficUsers: adminProcedure
    .input(z.object({ 
      limit: z.number().int().min(1).max(100).default(10),
      period: z.enum(["24h", "7d", "30d"]).default("7d"),
    }))
    .query(async ({ ctx, input }) => {
      const periodHours = {
        "24h": 24,
        "7d": 24 * 7,
        "30d": 24 * 30,
      }[input.period];

      const startDate = new Date(Date.now() - periodHours * 60 * 60 * 1000);

      const topUsers = await ctx.db.subscription.findMany({
        where: {
          lastTrafficSync: { gte: startDate },
          isActive: true,
        },
        include: {
          user: { select: { email: true, name: true } },
          plan: { select: { name: true } },
        },
        orderBy: { trafficUsed: "desc" },
        take: input.limit,
      });

      return topUsers.map(sub => ({
        subscription: {
          id: sub.id,
          user: sub.user,
          plan: sub.plan,
          xUIClientEmail: sub.xUIClientEmail,
        },
        traffic: {
          used: sub.trafficUsed.toString(),
          up: sub.trafficUp.toString(),
          down: sub.trafficDown.toString(),
          limit: sub.trafficLimit?.toString(),
        },
        lastSync: sub.lastTrafficSync,
      }));
    }),
}); 