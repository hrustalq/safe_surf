import { z } from "zod";
import { paginatedQuerySchema, sortOrderSchema } from "~/server/api/utils";

// Input schemas
export const getServersDto = z.object({
  ...paginatedQuerySchema.shape,
  sortBy: z.enum(["name", "location", "isActive", "currentLoad", "createdAt"]).default("name"),
  sortOrder: sortOrderSchema.default("asc"),
  isActive: z.boolean().optional(),
});

export const getServerByIdDto = z.object({
  id: z.string().cuid(),
});

export const createServerDto = z.object({
  name: z.string().min(1, "Название сервера обязательно").max(100, "Название сервера слишком длинное"),
  location: z.string().min(1, "Локация обязательна").max(100, "Локация слишком длинная"),
  locationRu: z.string().min(1, "Русское название локации обязательно").max(100, "Русское название локации слишком длинное"),
  host: z.string().min(1, "Хост обязателен").max(255, "Хост слишком длинный"),
  port: z.number().int().min(1, "Порт должен быть больше 0").max(65535, "Порт должен быть меньше 65535").optional().default(443),
  protocol: z.enum(["vless", "vmess", "trojan", "shadowsocks"]).optional().default("vless"),
  security: z.enum(["tls", "reality", "none"]).optional().default("tls"),
  outboundTag: z.string().min(1, "Тег outbound обязателен").max(50, "Тег outbound слишком длинный").optional(),
  maxClients: z.number().int().min(1, "Максимальное количество клиентов должно быть больше 0").optional().default(100),
  priority: z.number().int().min(0, "Приоритет не может быть отрицательным").max(100, "Приоритет не может быть больше 100").optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateServerDto = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, "Название сервера обязательно").max(100, "Название сервера слишком длинное").optional(),
  location: z.string().min(1, "Локация обязательна").max(100, "Локация слишком длинная").optional(),
  locationRu: z.string().min(1, "Русское название локации обязательно").max(100, "Русское название локации слишком длинное").optional(),
  host: z.string().min(1, "Хост обязателен").max(255, "Хост слишком длинный").optional(),
  port: z.number().int().min(1, "Порт должен быть больше 0").max(65535, "Порт должен быть меньше 65535").optional(),
  protocol: z.enum(["vless", "vmess", "trojan", "shadowsocks"]).optional(),
  security: z.enum(["tls", "reality", "none"]).optional(),
  outboundTag: z.string().min(1, "Тег outbound обязателен").max(50, "Тег outbound слишком длинный").optional(),
  maxClients: z.number().int().min(1, "Максимальное количество клиентов должно быть больше 0").optional(),
  priority: z.number().int().min(0, "Приоритет не может быть отрицательным").max(100, "Приоритет не может быть больше 100").optional(),
  isActive: z.boolean().optional(),
});

export const deleteServerDto = z.object({
  id: z.string().cuid(),
});

export const toggleServerStatusDto = z.object({
  id: z.string().cuid(),
  isActive: z.boolean(),
});

// Output schemas
export const serverDto = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  locationRu: z.string(),
  host: z.string(),
  port: z.number(),
  protocol: z.string(),
  security: z.string(),
  outboundId: z.string().nullable(),
  outboundTag: z.string().nullable(),
  isActive: z.boolean(),
  maxClients: z.number(),
  currentLoad: z.number(),
  priority: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const serverListDto = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  locationRu: z.string(),
  host: z.string(),
  port: z.number(),
  protocol: z.string(),
  security: z.string(),
  outboundId: z.string().nullable(),
  outboundTag: z.string().nullable(),
  isActive: z.boolean(),
  maxClients: z.number(),
  currentLoad: z.number(),
  priority: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const serverStatsDto = z.object({
  totalServers: z.number(),
  activeServers: z.number(),
  totalLoad: z.number(),
  averageLoad: z.number(),
});

// Panel DTOs
export const createPanelDto = z.object({
  name: z.string().min(1, "Название панели обязательно").max(100, "Название панели слишком длинное"),
  host: z.string().min(1, "Хост обязателен").max(255, "Хост слишком длинный"),
  port: z.number().int().min(1, "Порт должен быть больше 0").max(65535, "Порт должен быть меньше 65535").optional().default(54321),
  username: z.string().min(1, "Имя пользователя обязательно").max(100, "Имя пользователя слишком длинное"),
  password: z.string().min(1, "Пароль обязателен").max(255, "Пароль слишком длинный"),
  apiUrl: z.string().url("Неверный формат URL API"),
  isActive: z.boolean().optional().default(true),
});

export const updatePanelDto = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, "Название панели обязательно").max(100, "Название панели слишком длинное").optional(),
  host: z.string().min(1, "Хост обязателен").max(255, "Хост слишком длинный").optional(),
  port: z.number().int().min(1, "Порт должен быть больше 0").max(65535, "Порт должен быть меньше 65535").optional(),
  username: z.string().min(1, "Имя пользователя обязательно").max(100, "Имя пользователя слишком длинное").optional(),
  password: z.string().min(1, "Пароль обязателен").max(255, "Пароль слишком длинный").optional(),
  apiUrl: z.string().url("Неверный формат URL API").optional(),
  isActive: z.boolean().optional(),
});

export const panelDto = z.object({
  id: z.string(),
  name: z.string(),
  host: z.string(),
  port: z.number(),
  username: z.string(),
  password: z.string(),
  apiUrl: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Types
export type GetServersDto = z.infer<typeof getServersDto>;
export type GetServerByIdDto = z.infer<typeof getServerByIdDto>;
export type CreateServerDto = z.infer<typeof createServerDto>;
export type UpdateServerDto = z.infer<typeof updateServerDto>;
export type DeleteServerDto = z.infer<typeof deleteServerDto>;
export type ToggleServerStatusDto = z.infer<typeof toggleServerStatusDto>;
export type ServerDto = z.infer<typeof serverDto>;
export type ServerListDto = z.infer<typeof serverListDto>;
export type ServerStatsDto = z.infer<typeof serverStatsDto>;

// Panel Types
export type CreatePanelDto = z.infer<typeof createPanelDto>;
export type UpdatePanelDto = z.infer<typeof updatePanelDto>;
export type PanelDto = z.infer<typeof panelDto>; 