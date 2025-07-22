import { z } from "zod";

// Get Plans Response
export const getPlansDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameRu: z.string(),
  description: z.string(),
  descriptionRu: z.string(),
  features: z.string().transform((str) => JSON.parse(str) as string[]),
  featuresRu: z.string().transform((str) => JSON.parse(str) as string[]),
  price: z.number(),
  currency: z.string(),
  durationDays: z.number(),
  maxDevices: z.number(),
  maxBandwidth: z.bigint().nullable(),
  protocols: z.string().transform((str) => JSON.parse(str) as string[]),
  isActive: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GetPlansDto = z.infer<typeof getPlansDtoSchema>;

// User Subscription Response
export const userSubscriptionDtoSchema = z.object({
  id: z.string(),
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED", "PENDING"]),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean(),
  paymentId: z.string().nullable(),
  plan: getPlansDtoSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
}).nullable();

export type UserSubscriptionDto = z.infer<typeof userSubscriptionDtoSchema>;

// Create Payment Request
export const createPaymentRequestSchema = z.object({
  planId: z.string(),
});

export type CreatePaymentRequest = z.infer<typeof createPaymentRequestSchema>;

// Create Payment Response
export const createPaymentResponseSchema = z.object({
  paymentId: z.string(),
  confirmationUrl: z.string(),
  amount: z.object({
    value: z.string(),
    currency: z.string(),
  }),
});

export type CreatePaymentResponse = z.infer<typeof createPaymentResponseSchema>; 