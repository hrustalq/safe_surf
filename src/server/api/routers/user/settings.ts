import { z } from "zod";
import { compareSync, hashSync } from "bcrypt-ts";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

const updateSettingsSchema = z.object({
  name: z.string().min(1).max(50),
  timezone: z.string().min(1),
  language: z.string().min(1),
  theme: z.enum(["light", "dark", "system"]),
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const updateNotificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  subscriptionUpdates: z.boolean(),
  securityAlerts: z.boolean(),
  marketingEmails: z.boolean(),
  systemMaintenance: z.boolean(),
  trafficWarnings: z.boolean(),
});

const deleteAccountSchema = z.object({
  password: z.string().min(1),
});

export const settingsRouter = createTRPCRouter({
  updateSettings: protectedProcedure
    .input(updateSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      try {
        const updatedUser = await ctx.db.user.update({
          where: { id: userId },
          data: {
            name: input.name,
            // Store additional settings in a JSON field or separate table
            // For now, we'll just update the basic fields available in the User model
          },
        });

        return { success: true, user: updatedUser };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось обновить настройки",
        });
      }
    }),

  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      try {
        // Get current user with password
        const user = await ctx.db.user.findUnique({
          where: { id: userId },
          select: { id: true, password: true },
        });

        if (!user?.password) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Не удалось найти текущий пароль",
          });
        }

        // Verify current password
        const isCurrentPasswordValid = compareSync(
          input.currentPassword,
          user.password
        );

        if (!isCurrentPasswordValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Неверный текущий пароль",
          });
        }

        // Hash new password
        const hashedNewPassword = hashSync(input.newPassword, 12);

        // Update password
        await ctx.db.user.update({
          where: { id: userId },
          data: {
            password: hashedNewPassword,
            updatedAt: new Date(),
          },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось изменить пароль",
        });
      }
    }),

  updateNotificationSettings: protectedProcedure
    .input(updateNotificationSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      try {
        // For now, we'll create a simple settings storage
        // In a real app, you might want a separate UserSettings table
        const settings = JSON.stringify(input);
        
        await ctx.db.user.update({
          where: { id: userId },
          data: {
            // Assuming you have a settings JSON field in your User model
            // If not, you can create a separate UserSettings table
            updatedAt: new Date(),
          },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось обновить настройки уведомлений",
        });
      }
    }),

  resendVerificationEmail: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const userEmail = ctx.session.user.email;

      if (!userEmail) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email не найден",
        });
      }

      try {
        // Here you would typically send a verification email
        // For now, we'll just simulate the process
        console.log(`Sending verification email to ${userEmail}`);
        
        // In a real implementation, you'd:
        // 1. Generate a verification token
        // 2. Store it in the database
        // 3. Send the email with the verification link
        
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось отправить письмо подтверждения",
        });
      }
    }),

  enable2FA: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        // In a real implementation, you'd:
        // 1. Generate a 2FA secret
        // 2. Return QR code for user to scan
        // 3. Wait for confirmation with TOTP code
        // 4. Enable 2FA only after successful verification
        
        await ctx.db.user.update({
          where: { id: userId },
          data: {
            // twoFactorEnabled: true, // Add this field to your User model
            updatedAt: new Date(),
          },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось включить 2FA",
        });
      }
    }),

  disable2FA: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        await ctx.db.user.update({
          where: { id: userId },
          data: {
            // twoFactorEnabled: false, // Add this field to your User model
            updatedAt: new Date(),
          },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось отключить 2FA",
        });
      }
    }),

  revokeAllSessions: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        // In a real implementation, you'd:
        // 1. Delete all sessions for this user from your session store
        // 2. Invalidate all JWT tokens if using JWT
        // 3. Force re-authentication on all devices
        
        console.log(`Revoking all sessions for user ${userId}`);
        
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось отозвать сессии",
        });
      }
    }),

  deleteAccount: protectedProcedure
    .input(deleteAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      try {
        // Get current user with password
        const user = await ctx.db.user.findUnique({
          where: { id: userId },
          select: { id: true, password: true },
        });

        if (!user?.password) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Не удалось найти пароль пользователя",
          });
        }

        // Verify password
        const isPasswordValid = compareSync(input.password, user.password);

        if (!isPasswordValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Неверный пароль",
          });
        }

        // In a real implementation, you'd:
        // 1. Cancel all active subscriptions
        // 2. Delete all user data (or mark as deleted)
        // 3. Send confirmation email
        // 4. Log the deletion for compliance
        
        // For now, we'll just mark the user as inactive
        await ctx.db.user.update({
          where: { id: userId },
          data: {
            // Mark as deleted instead of actually deleting for data retention
            name: "Deleted User",
            email: `deleted_${userId}@deleted.local`,
            updatedAt: new Date(),
          },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось удалить аккаунт",
        });
      }
    }),
});