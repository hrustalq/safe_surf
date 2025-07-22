import { protectedProcedure } from "../../trpc";

export const getUserSubscription = protectedProcedure.query(async ({ ctx }) => {
  const subscription = await ctx.db.subscription.findFirst({
    where: {
      userId: ctx.session.user.id,
      status: "ACTIVE",
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!subscription) {
    return null;
  }

  return {
    ...subscription,
    plan: {
      ...subscription.plan,
      features: JSON.parse(subscription.plan.features) as string[],
      featuresRu: JSON.parse(subscription.plan.featuresRu) as string[],
      protocols: JSON.parse(subscription.plan.protocols) as string[],
      price: Number(subscription.plan.price),
    },
  };
}); 