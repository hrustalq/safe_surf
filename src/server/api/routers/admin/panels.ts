import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import {
  createPanelDto,
  updatePanelDto,
  panelDto,
  type PanelDto,
} from "./dto/servers.dto";
import { z } from "zod";

export const panelsRouter = createTRPCRouter({
  // Get all panels
  getAll: adminProcedure
    .query(async ({ ctx }) => {
      const panels = await ctx.db.xUIPanel.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      return panels.map(panel => ({
        id: panel.id,
        name: panel.name,
        host: panel.host,
        port: panel.port,
        username: panel.username,
        password: panel.password,
        apiUrl: panel.apiUrl,
        isActive: panel.isActive,
        createdAt: panel.createdAt,
        updatedAt: panel.updatedAt,
      }));
    }),

  // Get panel by ID
  getById: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .output(panelDto)
    .query(async ({ ctx, input }) => {
      const panel = await ctx.db.xUIPanel.findUnique({
        where: { id: input.id },
      });

      if (!panel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Панель 3X-UI не найдена",
        });
      }

      const transformedPanel: PanelDto = {
        id: panel.id,
        name: panel.name,
        host: panel.host,
        port: panel.port,
        username: panel.username,
        password: panel.password,
        apiUrl: panel.apiUrl,
        isActive: panel.isActive,
        createdAt: panel.createdAt,
        updatedAt: panel.updatedAt,
      };

      return transformedPanel;
    }),

  // Create new panel
  create: adminProcedure
    .input(createPanelDto)
    .output(panelDto)
    .mutation(async ({ ctx, input }) => {
      // Check if panel with same host:port already exists
      const existingPanel = await ctx.db.xUIPanel.findFirst({
        where: {
          host: input.host,
          port: input.port ?? 54321,
        },
      });

      if (existingPanel) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Панель с таким адресом и портом уже существует",
        });
      }

      const panel = await ctx.db.xUIPanel.create({
        data: {
          name: input.name,
          host: input.host,
          port: input.port ?? 54321,
          username: input.username,
          password: input.password,
          apiUrl: input.apiUrl,
          isActive: input.isActive ?? true,
        },
      });

      const transformedPanel: PanelDto = {
        id: panel.id,
        name: panel.name,
        host: panel.host,
        port: panel.port,
        username: panel.username,
        password: panel.password,
        apiUrl: panel.apiUrl,
        isActive: panel.isActive,
        createdAt: panel.createdAt,
        updatedAt: panel.updatedAt,
      };

      return transformedPanel;
    }),

  // Update existing panel
  update: adminProcedure
    .input(updatePanelDto)
    .output(panelDto)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Check if panel exists
      const existingPanel = await ctx.db.xUIPanel.findUnique({
        where: { id },
      });

      if (!existingPanel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Панель 3X-UI не найдена",
        });
      }

      // Check for host:port conflict if host or port is being updated
      if (input.host || input.port) {
        const conflictingPanel = await ctx.db.xUIPanel.findFirst({
          where: {
            host: input.host ?? existingPanel.host,
            port: input.port ?? existingPanel.port,
            id: { not: id },
          },
        });

        if (conflictingPanel) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Панель с таким адресом и портом уже существует",
          });
        }
      }

      const updatedPanel = await ctx.db.xUIPanel.update({
        where: { id },
        data: updateData,
      });

      const transformedPanel: PanelDto = {
        id: updatedPanel.id,
        name: updatedPanel.name,
        host: updatedPanel.host,
        port: updatedPanel.port,
        username: updatedPanel.username,
        password: updatedPanel.password,
        apiUrl: updatedPanel.apiUrl,
        isActive: updatedPanel.isActive,
        createdAt: updatedPanel.createdAt,
        updatedAt: updatedPanel.updatedAt,
      };

      return transformedPanel;
    }),

  // Delete panel
  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if panel exists
      const existingPanel = await ctx.db.xUIPanel.findUnique({
        where: { id: input.id },
      });

      if (!existingPanel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Панель 3X-UI не найдена",
        });
      }

      // TODO: Check if panel is being used by active outbounds
      // For now, we'll allow deletion but in production you might want to prevent this

      await ctx.db.xUIPanel.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle panel status (active/inactive)
  toggleStatus: adminProcedure
    .input(z.object({
      id: z.string().cuid(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const panel = await ctx.db.xUIPanel.findUnique({
        where: { id: input.id },
      });

      if (!panel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Панель 3X-UI не найдена",
        });
      }

      const updatedPanel = await ctx.db.xUIPanel.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });

      return {
        id: updatedPanel.id,
        isActive: updatedPanel.isActive,
      };
    }),

  // Test panel connection
  testConnection: adminProcedure
    .input(z.object({
      id: z.string().cuid().optional(),
      host: z.string().optional(),
      port: z.number().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      apiUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      let connectionData;

      if (input.id) {
        // Test existing panel
        const panel = await ctx.db.xUIPanel.findUnique({
          where: { id: input.id },
        });

        if (!panel) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Панель 3X-UI не найдена",
          });
        }

        connectionData = {
          host: panel.host,
          port: panel.port,
          username: panel.username,
          password: panel.password,
          apiUrl: panel.apiUrl,
        };
      } else {
        // Test provided connection data
        if (!input.host || !input.username || !input.password || !input.apiUrl) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Недостаточно данных для проверки соединения",
          });
        }

        connectionData = {
          host: input.host,
          port: input.port ?? 54321,
          username: input.username,
          password: input.password,
          apiUrl: input.apiUrl,
        };
      }

      try {
        // TODO: Implement actual 3X-UI API connection test
        // For now, we'll simulate the connection test
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock connection test result
        const isReachable = Math.random() > 0.2; // 80% success rate for demo
        
        if (!isReachable) {
          throw new Error("Connection timeout");
        }

        return {
          success: true,
          message: "Соединение с панелью установлено успешно",
          details: {
            host: connectionData.host,
            port: connectionData.port,
            responseTime: Math.floor(Math.random() * 500) + 100, // Mock response time
          },
        };
      } catch (error) {
        return {
          success: false,
          message: "Не удается подключиться к панели 3X-UI",
          error: error instanceof Error ? error.message : "Unknown error",
          details: {
            host: connectionData.host,
            port: connectionData.port,
          },
        };
      }
    }),

  // Get panel statistics
  getStats: adminProcedure
    .query(async ({ ctx }) => {
      const [totalPanels, activePanels] = await Promise.all([
        ctx.db.xUIPanel.count(),
        ctx.db.xUIPanel.count({
          where: { isActive: true },
        }),
      ]);

      return {
        totalPanels,
        activePanels,
        inactivePanels: totalPanels - activePanels,
      };
    }),

  // Get detailed panel information for slug page
  getDetailedInfo: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      // Get panel from database
      const panel = await ctx.db.xUIPanel.findUnique({
        where: { id: input.id },
      });

      if (!panel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Панель 3X-UI не найдена",
        });
      }

      try {
        // Initialize 3X-UI client
        const { ThreeXUIPanelClient } = await import("~/lib/3x-ui/panel-client");
        const client = new ThreeXUIPanelClient({
          baseUrl: panel.apiUrl,
          username: panel.username,
          password: panel.password,
          debug: true, // Enable debug logging for troubleshooting
          timeout: 8000, // Reduce timeout
          maxRetries: 1, // Reduce retries to fail faster
        });

        // Get comprehensive panel information
        const [panelInfo, serverLogs] = await Promise.allSettled([
          client.getPanelInfo(),
          client.getServerLogs().catch(() => "Не удалось получить логи сервера"),
        ]);

        const panelInfoResult = panelInfo.status === 'fulfilled' ? panelInfo.value : null;
        const serverLogsResult = serverLogs.status === 'fulfilled' ? serverLogs.value : "Не удалось получить логи сервера";

        // Get inbounds with detailed information
        const inbounds = panelInfoResult?.connectionStatus 
          ? await client.getInbounds().catch(() => [])
          : [];

        return {
          panel: {
            id: panel.id,
            name: panel.name,
            host: panel.host,
            port: panel.port,
            username: panel.username,
            apiUrl: panel.apiUrl,
            isActive: panel.isActive,
            createdAt: panel.createdAt,
            updatedAt: panel.updatedAt,
          },
          panelInfo: panelInfoResult,
          inbounds,
          serverLogs: serverLogsResult,
          connectionStatus: panelInfoResult?.connectionStatus ?? false,
        };
      } catch (error) {
        // Return panel info with connection failed status
        return {
          panel: {
            id: panel.id,
            name: panel.name,
            host: panel.host,
            port: panel.port,
            username: panel.username,
            apiUrl: panel.apiUrl,
            isActive: panel.isActive,
            createdAt: panel.createdAt,
            updatedAt: panel.updatedAt,
          },
          panelInfo: null,
          inbounds: [],
          serverLogs: `Ошибка подключения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
          connectionStatus: false,
        };
      }
    }),

  // Get panel clients (users)
  getPanelClients: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const panel = await ctx.db.xUIPanel.findUnique({
        where: { id: input.id },
      });

      if (!panel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Панель 3X-UI не найдена",
        });
      }

      try {
        const { ThreeXUIPanelClient } = await import("~/lib/3x-ui/panel-client");
        const client = new ThreeXUIPanelClient({
          baseUrl: panel.apiUrl,
          username: panel.username,
          password: panel.password,
          debug: true,
          timeout: 8000,
          maxRetries: 1,
        });

        const [allClients, onlineClients] = await Promise.all([
          client.getAllClients().catch(() => []),
          client.getOnlineClients().catch(() => []),
        ]);

        // Get usage statistics for each client and find matching subscriptions
        const clientsWithUsage = await Promise.all(
          allClients.map(async ({ inbound, client: clientInfo }) => {
            try {
              const usage = await client.getClientUsage(clientInfo.email ?? "");
              
              // Find matching subscription in database for traffic data
              const subscription = await ctx.db.subscription.findFirst({
                where: {
                  xUIClientEmail: clientInfo.email,
                  isActive: true,
                },
                include: {
                  user: { select: { email: true, name: true } },
                  plan: { select: { name: true, maxBandwidth: true } },
                },
              });

              // Get client stats from inbound for real-time traffic
              const clientStat = inbound.clientStats?.find(stat => stat.email === clientInfo.email);
              
              return {
                inbound,
                client: clientInfo,
                usage: usage.usage,
                stats: usage.stats,
                subscription,
                traffic: clientStat ? {
                  up: clientStat.up,
                  down: clientStat.down,
                  total: clientStat.up + clientStat.down,
                  upGB: Number((clientStat.up / (1024 * 1024 * 1024)).toFixed(2)),
                  downGB: Number((clientStat.down / (1024 * 1024 * 1024)).toFixed(2)),
                  totalGB: Number(((clientStat.up + clientStat.down) / (1024 * 1024 * 1024)).toFixed(2)),
                  limitGB: subscription?.plan.maxBandwidth 
                    ? Number((Number(subscription.plan.maxBandwidth) / (1024 * 1024 * 1024)).toFixed(2))
                    : null,
                  usagePercent: subscription?.plan.maxBandwidth 
                    ? Math.round(((clientStat.up + clientStat.down) / Number(subscription.plan.maxBandwidth)) * 100)
                    : null,
                  resetCount: clientStat.reset,
                } : null,
                isOnline: onlineClients.some(onlineClient => 
                  typeof onlineClient === 'string' 
                    ? onlineClient === clientInfo.email 
                    : onlineClient.email === clientInfo.email
                ),
              };
            } catch {
              return {
                inbound,
                client: clientInfo,
                usage: null,
                stats: null,
                subscription: null,
                traffic: null,
                isOnline: false,
              };
            }
          })
        );

        return clientsWithUsage;
      } catch (error) {
        console.error("Error fetching panel clients:", error);
        return [];
      }
    }),

  // Get panel inbounds with detailed statistics
  getPanelInbounds: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const panel = await ctx.db.xUIPanel.findUnique({
        where: { id: input.id },
      });

      if (!panel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Панель 3X-UI не найдена",
        });
      }

      try {
        const { ThreeXUIPanelClient } = await import("~/lib/3x-ui/panel-client");
        const client = new ThreeXUIPanelClient({
          baseUrl: panel.apiUrl,
          username: panel.username,
          password: panel.password,
          debug: true,
          timeout: 8000,
          maxRetries: 1,
        });

        const inbounds = await client.getInbounds();
        
        // Get detailed information for each inbound
        const detailedInbounds = await Promise.all(
          inbounds.map(async (inbound) => {
            const clientsCount = inbound.settings.clients.length;
            const activeClientsCount = inbound.settings.clients.filter(c => c.enable).length;
            
            return {
              ...inbound,
              meta: {
                clientsCount,
                activeClientsCount,
                trafficGB: {
                  up: Number(((inbound.up || 0) / (1024 * 1024 * 1024)).toFixed(2)),
                  down: Number(((inbound.down || 0) / (1024 * 1024 * 1024)).toFixed(2)),
                  total: Number(((inbound.total || 0) / (1024 * 1024 * 1024)).toFixed(2)),
                },
              },
            };
          })
        );

        return detailedInbounds;
      } catch (error) {
        console.error("Error fetching panel inbounds:", error);
        return [];
      }
    }),
}); 