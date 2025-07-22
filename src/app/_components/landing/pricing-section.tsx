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
  const allPlans = propPlans ?? await api.vpn.plans.getFeatured();
  
  // Sort by price ascending to ensure consistent order
  const sortedPlans = allPlans.sort((a, b) => Number(a.price) - Number(b.price));
  
  // Add popular flag to middle plan or Premium plan
  const plansWithPopular = sortedPlans.map((plan, index) => ({
    ...plan,
    isPopular: index === Math.floor(sortedPlans.length / 2) || plan.nameRu === "Премиум" || plan.nameRu === "Premium"
  }));

  // Ensure we have plans to display
  if (plansWithPopular.length === 0) {
    return (
      <section id="pricing" className="py-24 bg-gradient-to-b from-muted/20 to-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Тарифы временно недоступны
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Мы работаем над обновлением наших планов. Пожалуйста, попробуйте позже.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return <PricingSectionClient plans={plansWithPopular} />;
} 