import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { vpnRouter } from "./routers/vpn";
import { userRouter } from "./routers/user";
import { subscriptionRouter } from "./routers/subscription";
import { adminRouter } from "./routers/admin";
	
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  vpn: vpnRouter,
  user: userRouter,
  subscription: subscriptionRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
