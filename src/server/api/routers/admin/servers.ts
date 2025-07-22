import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";

export const serversRouter = createTRPCRouter({
  getAll: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.xUIServer.findMany({
        orderBy: {
          name: "asc",
        },
      });
    }),

  getCount: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.xUIServer.count();
    }),

  getActiveCount: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.xUIServer.count({
        where: {
          isActive: true,
        },
      });
    }),
}); 