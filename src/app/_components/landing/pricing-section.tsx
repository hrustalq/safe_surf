import { api } from "~/trpc/server";
import { PricingSectionClient } from "./pricing-client";

interface PricingSectionProps {
  plans?: {
    id: string;
    nameRu: string;
    descriptionRu: string;
    price: number;
    currency: string;
    durationDays: number;
    maxDevices: number;
    maxBandwidth: bigint | null;
    featuresRu: string[];
    protocols: string[];
    isPopular?: boolean;
  }[];
}

export async function PricingSection({ plans: propPlans }: PricingSectionProps = {}) {
  // Fetch plans from API if not provided as props
  const plans = propPlans ?? await api.vpn.plans.getFeatured();
  
  // Add popular flag to middle plan (Premium)
  const plansWithPopular = plans.map((plan, index) => ({
    ...plan,
    isPopular: index === 1 || plan.nameRu === "Премиум"
  }));

  return <PricingSectionClient plans={plansWithPopular} />;
} 