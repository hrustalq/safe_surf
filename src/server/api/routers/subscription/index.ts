import { createTRPCRouter } from "../../trpc";
import { plansRouter } from "./plans";
import { getUserSubscription, getFullSubscriptionData, refreshSubscriptionConfigs, getSubscriptionUrl } from "./user-subscription";
import { createPayment } from "./payment";

export const subscriptionRouter = createTRPCRouter({
  plans: plansRouter,
  getUserSubscription,
  getFullSubscriptionData,
  refreshSubscriptionConfigs,
  getSubscriptionUrl,
  createPayment,
}); 