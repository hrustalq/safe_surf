import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { paginatedResponseSchema, createPaginatedResponse } from "../../utils";
import { createDigitalOceanClient } from "~/lib/digital-ocean/client";
import { createServerProvisioningService } from "~/lib/automation/server-provisioning";
import {
  getRegionsDto,
  getSizesDto,
  getSSHKeysDto,
  provisionServerDto,
  destroyServerDto,
  getServerHealthDto,
  getProvisioningStatusDto,
  getProvisionedServersDto,
  regionDto,
  sizeDto,
  sshKeyDto,
  provisionServerResponseDto,
  destroyServerResponseDto,
  serverHealthDto,
  provisioningStatusDto,
  provisionedServerDto,
  type RegionDto,
  type SizeDto,
  type SSHKeyDto,
  type ProvisionedServerDto,
} from "./dto/digital-ocean.dto";

// Initialize services
let doClient: ReturnType<typeof createDigitalOceanClient> | null = null;
let provisioningService: ReturnType<typeof createServerProvisioningService> | null = null;

function getDigitalOceanClient() {
  if (!doClient) {
    try {
      doClient = createDigitalOceanClient();
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Digital Ocean client not configured. Please check your environment variables.",
      });
    }
  }
  return doClient;
}

function getProvisioningService() {
  if (!provisioningService) {
    try {
      provisioningService = createServerProvisioningService();
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Server provisioning service not configured. Please check your environment variables.",
      });
    }
  }
  return provisioningService;
}

export const digitalOceanRouter = createTRPCRouter({
  // Get available Digital Ocean regions
  getRegions: adminProcedure
    .input(getRegionsDto)
    .output(regionDto.array())
    .query(async ({ input: _input }) => {
      try {
        const client = getDigitalOceanClient();
        const regions = await client.getRegions();
        
        // Transform to match DTO
        const transformedRegions: RegionDto[] = regions.map(region => ({
          name: region.name,
          slug: region.slug,
          available: region.available,
        }));

        return transformedRegions;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch regions: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }),

  // Get available VPS sizes
  getSizes: adminProcedure
    .input(getSizesDto)
    .output(sizeDto.array())
    .query(async ({ input: _input }) => {
      try {
        const client = getDigitalOceanClient();
        const sizes = await client.getSizes();
        
        // Filter to only show relevant VPS sizes for VPN servers
        const relevantSizes = sizes.filter(size => 
          ['s-1vcpu-1gb', 's-1vcpu-2gb', 's-2vcpu-2gb', 's-2vcpu-4gb', 's-4vcpu-8gb'].includes(size.slug)
        );

        // Transform to match DTO
        const transformedSizes: SizeDto[] = relevantSizes.map(size => ({
          slug: size.slug,
          memory: size.memory,
          vcpus: size.vcpus,
          disk: size.disk,
          price_monthly: size.price_monthly,
          price_hourly: size.price_hourly,
          available: size.available,
        }));

        return transformedSizes;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch sizes: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }),

  // Get SSH keys
  getSSHKeys: adminProcedure
    .input(getSSHKeysDto)
    .output(sshKeyDto.array())
    .query(async ({ input: _input }) => {
      try {
        const client = getDigitalOceanClient();
        const sshKeys = await client.getSSHKeys();

        // Transform to match DTO
        const transformedKeys: SSHKeyDto[] = sshKeys.map(key => ({
          id: key.id,
          name: key.name,
          fingerprint: key.fingerprint,
          public_key: key.public_key,
        }));

        return transformedKeys;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch SSH keys: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }),

  // Provision new server
  provisionServer: adminProcedure
    .input(provisionServerDto)
    .output(provisionServerResponseDto)
    .mutation(async ({ input }) => {
      try {
        const service = getProvisioningService();
        const serverId = await service.provisionServer({
          name: input.name,
          location: input.location,
          locationRu: input.locationRu,
          region: input.region,
          size: input.size,
        });

        return {
          success: true,
          serverId,
          message: "Провизионирование сервера запущено успешно",
        };
      } catch (error) {
        console.error('[DigitalOcean Router] Provisioning failed:', error);
        
        return {
          success: false,
          message: `Ошибка при провизионировании сервера: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }),

  // Destroy server
  destroyServer: adminProcedure
    .input(destroyServerDto)
    .output(destroyServerResponseDto)
    .mutation(async ({ input }) => {
      try {
        const service = getProvisioningService();
        const success = await service.destroyServer(input.serverId);

        return {
          success,
          message: success 
            ? "Сервер успешно удален" 
            : "Не удалось удалить сервер",
        };
      } catch (error) {
        console.error('[DigitalOcean Router] Server destruction failed:', error);
        
        return {
          success: false,
          message: `Ошибка при удалении сервера: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }),

  // Get server health
  getServerHealth: adminProcedure
    .input(getServerHealthDto)
    .output(serverHealthDto)
    .query(async ({ input }) => {
      try {
        const service = getProvisioningService();
        const health = await service.getServerHealth(input.serverId);

        return {
          vpsStatus: health.vpsStatus,
          v2rayStatus: health.v2rayStatus,
          diskUsage: health.diskUsage,
          memoryUsage: health.memoryUsage,
          cpuLoad: health.cpuLoad,
          lastCheck: health.lastCheck,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get server health: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }),

  // Get provisioning status
  getProvisioningStatus: adminProcedure
    .input(getProvisioningStatusDto)
    .output(provisioningStatusDto)
    .query(async ({ input }) => {
      try {
        const service = getProvisioningService();
        const status = await service.getProvisioningStatus(input.serverId);

        return {
          id: status.id,
          name: status.name,
          provisionStatus: status.provisionStatus,
          digitalOceanDropletId: status.digitalOceanDropletId,
          host: status.host,
          lastHealthCheck: status.lastHealthCheck,
        };
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Server not found: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }),

  // Get paginated list of provisioned servers
  getProvisionedServers: adminProcedure
    .input(getProvisionedServersDto)
    .output(paginatedResponseSchema(provisionedServerDto))
    .query(async ({ input }) => {
      try {
        const service = getProvisioningService();
        const { page, pageSize, sortBy, sortOrder, provisionStatus, region } = input;
        const skip = (page - 1) * pageSize;

        // Get all provisioned servers first
        const allServers = await service.listProvisionedServers();

        // Apply filters
        let filteredServers = allServers;
        
        if (provisionStatus) {
          filteredServers = filteredServers.filter(server => server.provisionStatus === provisionStatus);
        }
        
        if (region) {
          filteredServers = filteredServers.filter(server => server.digitalOceanRegion === region);
        }

        // Apply sorting
        const sortedServers = filteredServers.sort((a, b) => {
          let aValue: string | boolean | Date | null = a[sortBy as keyof typeof a];
          let bValue: string | boolean | Date | null = b[sortBy as keyof typeof b];

          if (aValue instanceof Date) aValue = aValue.getTime() as unknown as string | boolean | Date | null;
          if (bValue instanceof Date) bValue = bValue.getTime() as unknown as string | boolean | Date | null;

          if (sortOrder === 'desc') {
            return bValue && aValue && bValue > aValue ? 1 : -1;
          }
          return aValue && bValue && aValue > bValue ? 1 : -1;
        });

        // Apply pagination
        const total = sortedServers.length;
        const paginatedServers = sortedServers.slice(skip, skip + pageSize);

        // Transform to match DTO
        const transformedServers: ProvisionedServerDto[] = paginatedServers.map(server => ({
          id: server.id,
          name: server.name,
          location: server.location,
          locationRu: server.locationRu,
          host: server.host,
          provisionStatus: server.provisionStatus,
          isActive: server.isActive,
          digitalOceanRegion: server.digitalOceanRegion,
          digitalOceanSize: server.digitalOceanSize,
          lastHealthCheck: server.lastHealthCheck,
          createdAt: server.createdAt,
        }));

        return createPaginatedResponse(transformedServers, total, page, pageSize);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get provisioned servers: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }),

  // Get server provisioning logs (mock for now)
  getProvisioningLogs: adminProcedure
    .input(getProvisioningStatusDto)
    .output(z.object({
      logs: z.array(z.object({
        timestamp: z.date(),
        level: z.enum(['info', 'warning', 'error']),
        message: z.string(),
      })),
    }))
    .query(async ({ input: _input }) => {
      // Mock implementation - in production this would fetch actual logs
      const mockLogs = [
        {
          timestamp: new Date(Date.now() - 300000), // 5 minutes ago
          level: 'info' as const,
          message: 'Запуск провизионирования VPS',
        },
        {
          timestamp: new Date(Date.now() - 240000), // 4 minutes ago
          level: 'info' as const,
          message: 'VPS создан, ожидание готовности',
        },
        {
          timestamp: new Date(Date.now() - 180000), // 3 minutes ago
          level: 'info' as const,
          message: 'Установка V2Ray...',
        },
        {
          timestamp: new Date(Date.now() - 120000), // 2 minutes ago
          level: 'info' as const,
          message: 'Настройка безопасности',
        },
        {
          timestamp: new Date(Date.now() - 60000), // 1 minute ago
          level: 'info' as const,
          message: 'Сервер готов к использованию',
        },
      ];

      return { logs: mockLogs };
    }),
}); 