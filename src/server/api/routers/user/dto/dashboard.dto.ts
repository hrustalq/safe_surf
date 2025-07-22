import { z } from "zod";

// Dashboard stats DTO
export const userDashboardStatsDto = z.object({
  activeSubscriptions: z.number(),
  totalSubscriptions: z.number(),
  dataUsage: z.object({
    used: z.bigint(),
    limit: z.bigint().nullable(),
    percentage: z.number(),
  }),
  daysUntilExpiry: z.number().nullable(),
  connectionStatus: z.enum(["connected", "disconnected", "connecting"]),
});

// User profile DTO for dashboard
export const userProfileDto = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string(),
  image: z.string().nullable(),
  createdAt: z.date(),
});

// Current subscription DTO
export const currentSubscriptionDto = z.object({
  id: z.string(),
  planName: z.string(),
  planNameRu: z.string(),
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED", "PENDING"]),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean(),
  connectionInfo: z.string().nullable(),
  maxDevices: z.number(),
  protocols: z.array(z.string()),
}).nullable();

// Recent activity DTO
export const activityDto = z.object({
  id: z.string(),
  type: z.enum(["connection", "subscription", "payment"]),
  description: z.string(),
  timestamp: z.date(),
});

export const recentActivitiesDto = z.array(activityDto);

// Dashboard data DTO
export const dashboardDataDto = z.object({
  user: userProfileDto,
  stats: userDashboardStatsDto,
  currentSubscription: currentSubscriptionDto,
  recentActivities: recentActivitiesDto,
});

// Types
export type UserDashboardStatsDto = z.infer<typeof userDashboardStatsDto>;
export type UserProfileDto = z.infer<typeof userProfileDto>;
export type CurrentSubscriptionDto = z.infer<typeof currentSubscriptionDto>;
export type ActivityDto = z.infer<typeof activityDto>;
export type RecentActivitiesDto = z.infer<typeof recentActivitiesDto>;
export type DashboardDataDto = z.infer<typeof dashboardDataDto>; 