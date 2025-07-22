import { createTRPCRouter } from "../../trpc";
import { plansRouter } from "./plans";
import { getUserSubscription } from "./user-subscription";
import { createPayment } from "./payment";

export const subscriptionRouter = createTRPCRouter({
  plans: plansRouter,
  getUserSubscription,
  createPayment,
}); 