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
}); 