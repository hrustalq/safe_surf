import { createTRPCRouter } from "~/server/api/trpc";
import { statsRouter } from "./stats";
import { systemRouter } from "./system";
import { usersRouter } from "./users";
import { subscriptionsRouter } from "./subscriptions";
import { serversRouter } from "./servers";
import { panelsRouter } from "./panels";
import { digitalOceanRouter } from "./digital-ocean";
import { trafficRouter } from "./traffic";

export const adminRouter = createTRPCRouter({
  stats: statsRouter,
  system: systemRouter,
  users: usersRouter,
  subscriptions: subscriptionsRouter,
  servers: serversRouter,
  panels: panelsRouter,
  digitalOcean: digitalOceanRouter,
  traffic: trafficRouter,
}); 