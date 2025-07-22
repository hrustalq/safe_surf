import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  company: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().max(100).optional(),
  timezone: z.string().min(1),
});

export const profileRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      try {
        const updatedUser = await ctx.db.user.update({
          where: { id: userId },
          data: {
            name: input.name,
            updatedAt: new Date(),
            // Store additional profile fields in a JSON field or separate table
            // For now, we'll just update the basic fields available in the User model
          },
        });

        return { success: true, user: updatedUser };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось обновить профиль",
        });
      }
    }),

  getActivity: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        // In a real implementation, you'd have an ActivityLog table
        // For now, we'll return mock data
        const mockActivities = [
          {
            id: "1",
            type: "login",
            description: "Вход в систему",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            ip: "192.168.1.1",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          {
            id: "2", 
            type: "profile_update",
            description: "Обновление профиля",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            ip: "192.168.1.1",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          {
            id: "3",
            type: "password_change", 
            description: "Смена пароля",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            ip: "192.168.1.1",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        ];

        return mockActivities;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось получить историю активности",
        });
      }
    }),

  getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        const user = await ctx.db.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            // Add other fields you want to return
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Пользователь не найден",
          });
        }

        return user;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось получить данные пользователя",
        });
      }
    }),
});