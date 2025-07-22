import { createTRPCRouter, publicProcedure } from "../../trpc";

export const plansRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const plans = await ctx.db.vpnPlan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return plans.map((plan) => ({
      ...plan,
      features: JSON.parse(plan.features) as string[],
      featuresRu: JSON.parse(plan.featuresRu) as string[],
      protocols: JSON.parse(plan.protocols) as string[],
      price: Number(plan.price),
    }));
  }),
}); 