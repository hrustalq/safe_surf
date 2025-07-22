import { createTRPCRouter } from "../../trpc";
import { dashboardRouter } from "./dashboard";
import { settingsRouter } from "./settings";
import { profileRouter } from "./profile";

export const userRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  updateSettings: settingsRouter.updateSettings,
  changePassword: settingsRouter.changePassword,
  updateNotificationSettings: settingsRouter.updateNotificationSettings,
  resendVerificationEmail: settingsRouter.resendVerificationEmail,
  enable2FA: settingsRouter.enable2FA,
  disable2FA: settingsRouter.disable2FA,
  revokeAllSessions: settingsRouter.revokeAllSessions,
  deleteAccount: settingsRouter.deleteAccount,
  updateProfile: profileRouter.updateProfile,
  getActivity: profileRouter.getActivity,
  getCurrentUser: profileRouter.getCurrentUser,
}); 