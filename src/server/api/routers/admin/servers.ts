import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { paginatedResponseSchema, createPaginatedResponse } from "../../utils";
import {
  getServersDto,
  getServerByIdDto,
  createServerDto,
  updateServerDto,
  deleteServerDto,
  toggleServerStatusDto,
  serverDto,
  serverListDto,
  serverStatsDto,
  type ServerListDto,
  type ServerDto,
  type ServerStatsDto,
} from "./dto/servers.dto";

export const serversRouter = createTRPCRouter({
  // Get paginated list of servers
  getAll: adminProcedure
    .input(getServersDto)
    .output(paginatedResponseSchema(serverListDto))
    .query(async ({ ctx, input }) => {
      const { page, pageSize, sortBy, sortOrder, isActive } = input;
      const skip = (page - 1) * pageSize;

      const where = {
        ...(isActive !== undefined && { isActive }),
      };

      const orderBy = {
        [sortBy]: sortOrder,
      };

      const [servers, total] = await ctx.db.$transaction([
        ctx.db.xUIServer.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
        }),
        ctx.db.xUIServer.count({ where }),
      ]);

      // Transform data to match DTO
      const transformedServers: ServerListDto[] = servers.map(server => ({
        id: server.id,
        name: server.name,
        location: server.location,
        locationRu: server.locationRu,
        host: server.host,
        port: server.port,
        protocol: server.protocol,
        security: server.security,
        outboundId: server.outboundId,
        outboundTag: server.outboundTag,
        isActive: server.isActive,
        maxClients: server.maxClients,
        currentLoad: server.currentLoad,
        priority: server.priority,
        createdAt: server.createdAt,
        updatedAt: server.updatedAt,
      }));

      return createPaginatedResponse(transformedServers, total, page, pageSize);
    }),

  // Get all servers (simple list for dropdowns, etc.)
  getAllSimple: adminProcedure
    .query(async ({ ctx }) => {
      const servers = await ctx.db.xUIServer.findMany({
        orderBy: {
          name: "asc",
        },
      });

      return servers.map(server => ({
        id: server.id,
        name: server.name,
        location: server.location,
        locationRu: server.locationRu,
        host: server.host,
        port: server.port,
        protocol: server.protocol,
        security: server.security,
        outboundId: server.outboundId,
        outboundTag: server.outboundTag,
        isActive: server.isActive,
        maxClients: server.maxClients,
        currentLoad: server.currentLoad,
        priority: server.priority,
        createdAt: server.createdAt,
        updatedAt: server.updatedAt,
      }));
    }),

  // Get server by ID
  getById: adminProcedure
    .input(getServerByIdDto)
    .output(serverDto)
    .query(async ({ ctx, input }) => {
      const server = await ctx.db.xUIServer.findUnique({
        where: { id: input.id },
      });

      if (!server) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Сервер не найден",
        });
      }

      // Transform data to match DTO
      const transformedServer: ServerDto = {
        id: server.id,
        name: server.name,
        location: server.location,
        locationRu: server.locationRu,
        host: server.host,
        port: server.port,
        protocol: server.protocol,
        security: server.security,
        outboundId: server.outboundId,
        outboundTag: server.outboundTag,
        isActive: server.isActive,
        maxClients: server.maxClients,
        currentLoad: server.currentLoad,
        priority: server.priority,
        createdAt: server.createdAt,
        updatedAt: server.updatedAt,
      };

      return transformedServer;
    }),

  // Create new server
  create: adminProcedure
    .input(createServerDto)
    .output(serverDto)
    .mutation(async ({ ctx, input }) => {
      // Check if server with same host:port already exists
      const existingServer = await ctx.db.xUIServer.findFirst({
        where: {
          host: input.host,
          port: input.port ?? 443,
        },
      });

      if (existingServer) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Сервер с таким адресом и портом уже существует",
        });
      }

      // Check if outbound tag is unique (if provided)
      if (input.outboundTag) {
        const existingTag = await ctx.db.xUIServer.findFirst({
          where: { outboundTag: input.outboundTag },
        });

        if (existingTag) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Outbound с таким тегом уже существует",
          });
        }
      }

      const server = await ctx.db.xUIServer.create({
        data: {
          name: input.name,
          location: input.location,
          locationRu: input.locationRu,
          host: input.host,
          port: input.port ?? 443,
          protocol: input.protocol ?? "vless",
          security: input.security ?? "tls",
          outboundTag: input.outboundTag,
          isActive: input.isActive ?? true,
          maxClients: input.maxClients ?? 100,
          priority: input.priority ?? 0,
          currentLoad: 0, // Start with 0 load
        },
      });

      // Transform data to match DTO
      const transformedServer: ServerDto = {
        id: server.id,
        name: server.name,
        location: server.location,
        locationRu: server.locationRu,
        host: server.host,
        port: server.port,
        protocol: server.protocol,
        security: server.security,
        outboundId: server.outboundId,
        outboundTag: server.outboundTag,
        isActive: server.isActive,
        maxClients: server.maxClients,
        currentLoad: server.currentLoad,
        priority: server.priority,
        createdAt: server.createdAt,
        updatedAt: server.updatedAt,
      };

      return transformedServer;
    }),

  // Update existing server
  update: adminProcedure
    .input(updateServerDto)
    .output(serverDto)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Check if server exists
      const existingServer = await ctx.db.xUIServer.findUnique({
        where: { id },
      });

      if (!existingServer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Сервер не найден",
        });
      }

      // Check for host:port conflict if host or port is being updated
      if (input.host || input.port) {
        const conflictingServer = await ctx.db.xUIServer.findFirst({
          where: {
            host: input.host ?? existingServer.host,
            port: input.port ?? existingServer.port,
            id: { not: id },
          },
        });

        if (conflictingServer) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Сервер с таким адресом и портом уже существует",
          });
        }
      }

      // Check for outbound tag conflict if tag is being updated
      if (input.outboundTag) {
        const conflictingTag = await ctx.db.xUIServer.findFirst({
          where: {
            outboundTag: input.outboundTag,
            id: { not: id },
          },
        });

        if (conflictingTag) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Outbound с таким тегом уже существует",
          });
        }
      }

      const updatedServer = await ctx.db.xUIServer.update({
        where: { id },
        data: updateData,
      });

      // Transform data to match DTO
      const transformedServer: ServerDto = {
        id: updatedServer.id,
        name: updatedServer.name,
        location: updatedServer.location,
        locationRu: updatedServer.locationRu,
        host: updatedServer.host,
        port: updatedServer.port,
        protocol: updatedServer.protocol,
        security: updatedServer.security,
        outboundId: updatedServer.outboundId,
        outboundTag: updatedServer.outboundTag,
        isActive: updatedServer.isActive,
        maxClients: updatedServer.maxClients,
        currentLoad: updatedServer.currentLoad,
        priority: updatedServer.priority,
        createdAt: updatedServer.createdAt,
        updatedAt: updatedServer.updatedAt,
      };

      return transformedServer;
    }),

  // Delete server
  delete: adminProcedure
    .input(deleteServerDto)
    .mutation(async ({ ctx, input }) => {
      // Check if server exists
      const existingServer = await ctx.db.xUIServer.findUnique({
        where: { id: input.id },
      });

      if (!existingServer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Сервер не найден",
        });
      }

      // TODO: Check if server has active subscriptions/connections
      // For now, we'll allow deletion but in production you might want to prevent this

      await ctx.db.xUIServer.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle server status (active/inactive)
  toggleStatus: adminProcedure
    .input(toggleServerStatusDto)
    .mutation(async ({ ctx, input }) => {
      const server = await ctx.db.xUIServer.findUnique({
        where: { id: input.id },
      });

      if (!server) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Сервер не найден",
        });
      }

      const updatedServer = await ctx.db.xUIServer.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });

      return {
        id: updatedServer.id,
        isActive: updatedServer.isActive,
      };
    }),

  // Get server statistics
  getStats: adminProcedure
    .output(serverStatsDto)
    .query(async ({ ctx }) => {
      const [servers, activeServers] = await Promise.all([
        ctx.db.xUIServer.findMany({
          select: {
            currentLoad: true,
            maxClients: true,
            isActive: true,
          },
        }),
        ctx.db.xUIServer.findMany({
          where: { isActive: true },
          select: {
            currentLoad: true,
            maxClients: true,
          },
        }),
      ]);

      const totalServers = servers.length;
      const totalActiveServers = activeServers.length;
      const totalLoad = servers.reduce((sum, server) => sum + server.currentLoad, 0);
      const averageLoad = totalServers > 0 ? Math.round(totalLoad / totalServers) : 0;

      const stats: ServerStatsDto = {
        totalServers,
        activeServers: totalActiveServers,
        totalLoad,
        averageLoad,
      };

      return stats;
    }),

  // Legacy methods for backward compatibility
  getCount: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.xUIServer.count();
    }),

  getActiveCount: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.xUIServer.count({
        where: {
          isActive: true,
        },
      });
    }),
}); 