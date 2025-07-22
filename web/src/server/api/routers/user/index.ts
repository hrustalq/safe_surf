import { createTRPCRouter } from "../../trpc";
import { dashboardRouter } from "./dashboard";

export const userRouter = createTRPCRouter({
  dashboard: dashboardRouter,
}); 