import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { handleSubscriptionUpdate } from "~/lib/subscription-management";

export const subscriptionsRouter = createTRPCRouter({
  getAll: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.subscription.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          plan: true,
        },
      });
    }),

  getActiveCount: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.subscription.count({
        where: {
          status: "ACTIVE",
          isActive: true,
          endDate: {
            gte: new Date(),
          },
        },
      });
    }),

  getExpiredCount: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.subscription.count({
        where: {
          OR: [
            { status: "EXPIRED" },
            {
              status: "ACTIVE",
              endDate: {
                lt: new Date(),
              },
            },
          ],
        },
      });
    }),

  getPendingCount: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.subscription.count({
        where: {
          status: "PENDING",
        },
      });
    }),

  getMonthlyRevenue: adminProcedure
    .query(async ({ ctx }) => {
      const subscriptions = await ctx.db.subscription.findMany({
        where: {
          status: "ACTIVE",
        },
        include: {
          plan: true,
        },
      });

      const totalRevenue = subscriptions.reduce((sum, sub) => {
        return sum + Number(sub.plan.price);
      }, 0);

      return totalRevenue;
    }),

  updateStatus: adminProcedure
    .input(z.object({
      subscriptionId: z.string(),
      status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED", "PENDING"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { id: input.subscriptionId },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Подписка не найдена",
        });
      }

      const updatedSubscription = await ctx.db.subscription.update({
        where: { id: input.subscriptionId },
        data: { 
          status: input.status,
          isActive: input.status === "ACTIVE",
        },
      });

      // Handle 3x-ui integration for status changes
      try {
        if (input.status === "ACTIVE") {
          // If subscription is being activated, add user to inbounds (or update existing)
          await handleSubscriptionUpdate(input.subscriptionId);
          console.log(`Successfully updated 3x-ui for subscription ${input.subscriptionId} (status: ${input.status})`);
        }
        // Note: We don't automatically remove users from 3x-ui when status changes to EXPIRED/CANCELLED
        // This allows for grace periods and manual cleanup if needed
      } catch (xuiError) {
        console.error(`Error updating 3x-ui for subscription ${input.subscriptionId}:`, xuiError);
        // Don't fail the admin operation - log the error for manual resolution
      }

      return updatedSubscription;
    }),

  extend: adminProcedure
    .input(z.object({
      subscriptionId: z.string(),
      days: z.number().min(1).max(365),
    }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { id: input.subscriptionId },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Подписка не найдена",
        });
      }

      const newEndDate = new Date(subscription.endDate);
      newEndDate.setDate(newEndDate.getDate() + input.days);

      const extendedSubscription = await ctx.db.subscription.update({
        where: { id: input.subscriptionId },
        data: { 
          endDate: newEndDate,
          status: "ACTIVE",
          isActive: true,
        },
      });

      // Handle 3x-ui integration for subscription extension
      try {
        await handleSubscriptionUpdate(input.subscriptionId);
        console.log(`Successfully updated 3x-ui limits for extended subscription ${input.subscriptionId}`);
      } catch (xuiError) {
        console.error(`Error updating 3x-ui for extended subscription ${input.subscriptionId}:`, xuiError);
        // Don't fail the admin operation - log the error for manual resolution
      }

      return extendedSubscription;
    }),
}); 