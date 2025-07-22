import { z } from "zod";
import { paginatedQuerySchema, sortOrderSchema } from "~/server/api/utils";

// Input schemas
export const getPlansDto = z.object({
  ...paginatedQuerySchema.shape,
  sortBy: z.enum(["price", "name", "sortOrder", "createdAt"]).default("sortOrder"),
  sortOrder: sortOrderSchema.default("asc"),
  isActive: z.boolean().optional(),
  maxPrice: z.number().optional(),
  minPrice: z.number().optional(),
});

export const getPlanByIdDto = z.object({
  id: z.string().cuid(),
});

// Output schemas
export const vpnPlanDto = z.object({
  id: z.string(),
  name: z.string(),
  nameRu: z.string(),
  description: z.string(),
  descriptionRu: z.string(),
  features: z.array(z.string()),
  featuresRu: z.array(z.string()),
  price: z.number(),
  currency: z.string(),
  durationDays: z.number(),
  maxDevices: z.number(),
  maxBandwidth: z.bigint().nullable(),
  protocols: z.array(z.string()),
  isActive: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const vpnPlanListDto = z.object({
  id: z.string(),
  name: z.string(),
  nameRu: z.string(),
  description: z.string(),
  descriptionRu: z.string(),
  features: z.array(z.string()),
  featuresRu: z.array(z.string()),
  price: z.number(),
  currency: z.string(),
  durationDays: z.number(),
  maxDevices: z.number(),
  maxBandwidth: z.bigint().nullable(),
  protocols: z.array(z.string()),
  isActive: z.boolean(),
  sortOrder: z.number(),
});

// Types
export type GetPlansDto = z.infer<typeof getPlansDto>;
export type GetPlanByIdDto = z.infer<typeof getPlanByIdDto>;
export type VpnPlanDto = z.infer<typeof vpnPlanDto>;
export type VpnPlanListDto = z.infer<typeof vpnPlanListDto>; 