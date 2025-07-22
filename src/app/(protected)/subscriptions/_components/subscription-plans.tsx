import { Check, Zap, Shield, Users } from "lucide-react";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/server";
import { HydrateClient } from "~/trpc/server";
import { SubscribeButton } from "./subscribe-button";

export async function SubscriptionPlans() {
  const plans = await api.subscription.plans.getAll();
  
  // Filter out Trial plan from public subscription plans
  const availablePlans = plans?.filter(plan => plan.name !== "Trial") ?? [];

  if (!availablePlans.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Планы временно недоступны</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {availablePlans.map((plan) => {
        const isPopular = plan.name === "Premium";
        
        return (
          <Card
            key={plan.id}
            className={`relative p-6 ${
              isPopular ? "border-primary shadow-lg scale-105" : ""
            }`}
          >
            {isPopular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                Популярный
              </Badge>
            )}

            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-2">
                {plan.name === "Basic" && (
                  <Shield className="h-8 w-8 text-blue-500" />
                )}
                {plan.name === "Premium" && (
                  <Zap className="h-8 w-8 text-primary" />
                )}
                {plan.name === "Business" && (
                  <Users className="h-8 w-8 text-purple-500" />
                )}
              </div>

              <h3 className="text-2xl font-bold mb-2">{plan.nameRu}</h3>
              <p className="text-muted-foreground mb-4">{plan.descriptionRu}</p>

              <div className="text-4xl font-bold mb-2">
                ${plan.price}
                <span className="text-lg font-normal text-muted-foreground">
                  /мес
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {plan.durationDays} дней доступа
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {plan.featuresRu.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <HydrateClient>
              <SubscribeButton planId={plan.id} isPopular={isPopular} />
            </HydrateClient>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                {plan.maxDevices} устройств • {plan.currency}
              </p>
              <p className="text-xs text-muted-foreground">
                Протоколы: {plan.protocols.join(", ")}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
} 