import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import { createPaymentRequestSchema } from "./dto/subscription.dto";
import { yooKassa } from "~/lib/yookassa";

export const createPayment = protectedProcedure
  .input(createPaymentRequestSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      // Get the plan
      const plan = await ctx.db.vpnPlan.findUnique({
        where: { id: input.planId },
      });

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "План не найден",
        });
      }

      if (!plan.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "План недоступен",
        });
      }

      // Check if user already has active subscription
      const existingSubscription = await ctx.db.subscription.findFirst({
        where: {
          userId: ctx.session.user.id,
          status: "ACTIVE",
        },
      });

      if (existingSubscription) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "У вас уже есть активная подписка",
        });
      }

      // Create YooKassa payment
      const baseUrl = process.env.NODE_ENV === "production" 
        ? "https://safesurf.tech" 
        : "http://localhost:3001";

      console.log("Creating payment for plan:", plan.nameRu, "Price:", Number(plan.price));

      const yooKassaPayment = await yooKassa.createPayment({
        amount: {
          value: Number(plan.price).toFixed(2),
          currency: "RUB", // YooKassa primarily works with RUB
        },
        confirmation: {
          type: "redirect" as const,
          return_url: `${baseUrl}/subscriptions/success`,
        },
        capture: true,
        description: `Подписка SafeSurf VPN - ${plan.nameRu}`,
        metadata: {
          userId: ctx.session.user.id,
          planId: plan.id,
          userEmail: ctx.session.user.email ?? "",
        },
      });

      // Create pending subscription record
      const subscription = await ctx.db.subscription.create({
        data: {
          userId: ctx.session.user.id,
          planId: plan.id,
          status: "PENDING",
          startDate: new Date(),
          endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000),
          paymentId: yooKassaPayment.id,
          isActive: false,
        },
      });

      return {
        paymentId: yooKassaPayment.id,
        confirmationUrl: yooKassaPayment.confirmation.confirmation_url,
        amount: yooKassaPayment.amount,
        subscriptionId: subscription.id,
      };
    } catch (error) {
      console.error("Payment creation error:", error);
      
      if (error instanceof TRPCError) {
        throw error;
      }
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Ошибка при создании платежа",
      });
    }
  }); 