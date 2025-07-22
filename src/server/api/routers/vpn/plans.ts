import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { 
  getPlansDto, 
  getPlanByIdDto, 
  vpnPlanListDto, 
  vpnPlanDto,
  type VpnPlanListDto,
  type VpnPlanDto 
} from "./dto/plans.dto";
import { paginatedResponseSchema, createPaginatedResponse } from "../../utils";

export const plansRouter = createTRPCRouter({
  // Get all active plans for public display
  getAll: publicProcedure
    .input(getPlansDto)
    .output(paginatedResponseSchema(vpnPlanListDto))
    .query(async ({ ctx, input }) => {
      const { page, pageSize, sortBy, sortOrder, isActive, maxPrice, minPrice } = input;
      const skip = (page - 1) * pageSize;

      const where = {
        ...(isActive !== undefined && { isActive }),
        ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
        ...(minPrice !== undefined && { 
          price: { 
            ...(maxPrice !== undefined ? { lte: maxPrice, gte: minPrice } : { gte: minPrice })
          } 
        }),
      };

      const orderBy = {
        [sortBy]: sortOrder,
      };

      const [plans, total] = await ctx.db.$transaction([
        ctx.db.vpnPlan.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
        }),
        ctx.db.vpnPlan.count({ where }),
      ]);

      // Transform data to match DTO
      const transformedPlans: VpnPlanListDto[] = plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        nameRu: plan.nameRu,
        description: plan.description,
        descriptionRu: plan.descriptionRu,
        features: JSON.parse(plan.features) as string[],
        featuresRu: JSON.parse(plan.featuresRu) as string[],
        price: Number(plan.price),
        currency: plan.currency,
        durationDays: plan.durationDays,
        maxDevices: plan.maxDevices,
        maxBandwidth: plan.maxBandwidth,
        protocols: JSON.parse(plan.protocols) as string[],
        isActive: plan.isActive,
        sortOrder: plan.sortOrder,
      }));

      return createPaginatedResponse(transformedPlans, total, page, pageSize);
    }),

  // Get plan by ID
  getById: publicProcedure
    .input(getPlanByIdDto)
    .output(vpnPlanDto)
    .query(async ({ ctx, input }) => {
      const plan = await ctx.db.vpnPlan.findUnique({
        where: { id: input.id },
      });

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "VPN plan not found",
        });
      }

      // Transform data to match DTO
      const transformedPlan: VpnPlanDto = {
        id: plan.id,
        name: plan.name,
        nameRu: plan.nameRu,
        description: plan.description,
        descriptionRu: plan.descriptionRu,
        features: JSON.parse(plan.features) as string[],
        featuresRu: JSON.parse(plan.featuresRu) as string[],
        price: Number(plan.price),
        currency: plan.currency,
        durationDays: plan.durationDays,
        maxDevices: plan.maxDevices,
        maxBandwidth: plan.maxBandwidth,
        protocols: JSON.parse(plan.protocols) as string[],
        isActive: plan.isActive,
        sortOrder: plan.sortOrder,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      };

      return transformedPlan;
    }),

  // Get featured/recommended plans for landing page
  getFeatured: publicProcedure
    .query(async ({ ctx }) => {
      const plans = await ctx.db.vpnPlan.findMany({
        where: { isActive: true, name: { not: "Trial" } },
        orderBy: { sortOrder: "asc" },
        take: 3, // Get top 3 featured plans
      });

      // Transform data to match DTO
      const transformedPlans: VpnPlanListDto[] = plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        nameRu: plan.nameRu,
        description: plan.description,
        descriptionRu: plan.descriptionRu,
        features: JSON.parse(plan.features) as string[],
        featuresRu: JSON.parse(plan.featuresRu) as string[],
        price: Number(plan.price),
        currency: plan.currency,
        durationDays: plan.durationDays,
        maxDevices: plan.maxDevices,
        maxBandwidth: plan.maxBandwidth,
        protocols: JSON.parse(plan.protocols) as string[],
        isActive: plan.isActive,
        sortOrder: plan.sortOrder,
      }));

      return transformedPlans;
    }),
}); 