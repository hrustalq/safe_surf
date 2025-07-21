import { createTRPCRouter } from "../../trpc";
import { plansRouter } from "./plans";

export const vpnRouter = createTRPCRouter({
  plans: plansRouter,
}); 