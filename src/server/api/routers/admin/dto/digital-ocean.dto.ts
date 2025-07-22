import { z } from "zod";
import { paginatedQuerySchema, sortOrderSchema } from "~/server/api/utils";

// Input schemas
export const getRegionsDto = z.object({});

export const getSizesDto = z.object({});

export const getSSHKeysDto = z.object({});

export const provisionServerDto = z.object({
  name: z.string().min(1, "Название сервера обязательно").max(100, "Название сервера слишком длинное"),
  location: z.string().min(1, "Локация обязательна").max(100, "Локация слишком длинная"),
  locationRu: z.string().min(1, "Русское название локации обязательно").max(100, "Русское название локации слишком длинное"),
  region: z.string().min(1, "Регион Digital Ocean обязателен"),
  size: z.string().min(1, "Размер VPS обязателен"),
});

export const destroyServerDto = z.object({
  serverId: z.string().cuid("Неверный ID сервера"),
});

export const getServerHealthDto = z.object({
  serverId: z.string().cuid("Неверный ID сервера"),
});

export const getProvisioningStatusDto = z.object({
  serverId: z.string().cuid("Неверный ID сервера"),
});

export const getProvisionedServersDto = z.object({
  ...paginatedQuerySchema.shape,
  sortBy: z.enum(["name", "location", "provisionStatus", "createdAt"]).default("createdAt"),
  sortOrder: sortOrderSchema.default("desc"),
  provisionStatus: z.enum(["MANUAL", "PROVISIONING", "INSTALLING", "CONFIGURING", "READY", "ERROR", "DESTROYING"]).optional(),
  region: z.string().optional(),
});

// Output schemas
export const regionDto = z.object({
  name: z.string(),
  slug: z.string(),
  available: z.boolean(),
});

export const sizeDto = z.object({
  slug: z.string(),
  memory: z.number(),
  vcpus: z.number(),
  disk: z.number(),
  price_monthly: z.number(),
  price_hourly: z.number(),
  available: z.boolean(),
});

export const sshKeyDto = z.object({
  id: z.number(),
  name: z.string(),
  fingerprint: z.string(),
  public_key: z.string(),
});

export const provisionServerResponseDto = z.object({
  success: z.boolean(),
  serverId: z.string().optional(),
  message: z.string().optional(),
});

export const destroyServerResponseDto = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const serverHealthDto = z.object({
  vpsStatus: z.string(),
  v2rayStatus: z.boolean(),
  diskUsage: z.string(),
  memoryUsage: z.string(),
  cpuLoad: z.string(),
  lastCheck: z.date(),
});

export const provisioningStatusDto = z.object({
  id: z.string(),
  name: z.string(),
  provisionStatus: z.enum(["MANUAL", "PROVISIONING", "INSTALLING", "CONFIGURING", "READY", "ERROR", "DESTROYING"]),
  digitalOceanDropletId: z.string().nullable(),
  host: z.string(),
  lastHealthCheck: z.date().nullable(),
});

export const provisionedServerDto = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  locationRu: z.string(),
  host: z.string(),
  provisionStatus: z.enum(["MANUAL", "PROVISIONING", "INSTALLING", "CONFIGURING", "READY", "ERROR", "DESTROYING"]),
  isActive: z.boolean(),
  digitalOceanRegion: z.string().nullable(),
  digitalOceanSize: z.string().nullable(),
  lastHealthCheck: z.date().nullable(),
  createdAt: z.date(),
});

// Types
export type GetRegionsDto = z.infer<typeof getRegionsDto>;
export type GetSizesDto = z.infer<typeof getSizesDto>;
export type GetSSHKeysDto = z.infer<typeof getSSHKeysDto>;
export type ProvisionServerDto = z.infer<typeof provisionServerDto>;
export type DestroyServerDto = z.infer<typeof destroyServerDto>;
export type GetServerHealthDto = z.infer<typeof getServerHealthDto>;
export type GetProvisioningStatusDto = z.infer<typeof getProvisioningStatusDto>;
export type GetProvisionedServersDto = z.infer<typeof getProvisionedServersDto>;

export type RegionDto = z.infer<typeof regionDto>;
export type SizeDto = z.infer<typeof sizeDto>;
export type SSHKeyDto = z.infer<typeof sshKeyDto>;
export type ProvisionServerResponseDto = z.infer<typeof provisionServerResponseDto>;
export type DestroyServerResponseDto = z.infer<typeof destroyServerResponseDto>;
export type ServerHealthDto = z.infer<typeof serverHealthDto>;
export type ProvisioningStatusDto = z.infer<typeof provisioningStatusDto>;
export type ProvisionedServerDto = z.infer<typeof provisionedServerDto>; 