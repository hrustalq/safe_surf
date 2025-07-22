import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const usersRouter = createTRPCRouter({
  getRecent: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.user.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          subscriptions: {
            where: {
              status: "ACTIVE",
              isActive: true,
            },
            include: {
              plan: true,
            },
          },
        },
      });
    }),

  getAll: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          subscriptions: {
            include: {
              plan: true,
            },
          },
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      });
    }),

  getTotalCount: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.user.count();
    }),

  getWithSubscriptions: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.user.count({
        where: {
          subscriptions: {
            some: {
              status: "ACTIVE",
              isActive: true,
            },
          },
        },
      });
    }),

  getWithoutSubscriptions: adminProcedure
    .query(async ({ ctx }) => {
      const totalUsers = await ctx.db.user.count();
      const usersWithSubscriptions = await ctx.db.user.count({
        where: {
          subscriptions: {
            some: {
              status: "ACTIVE",
              isActive: true,
            },
          },
        },
      });
      return totalUsers - usersWithSubscriptions;
    }),

  updateRole: adminProcedure
    .input(z.object({
      userId: z.string(),
      role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user exists
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Пользователь не найден",
        });
      }

      // Prevent changing super admin role (only super admin can do that)
      if (user.role === "SUPER_ADMIN" && ctx.session.user.role !== "SUPER_ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Нет прав для изменения роли супер-администратора",
        });
      }

      // Update user role
      return await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });
    }),
}); 