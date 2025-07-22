import { Suspense } from "react";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Shield, CheckCircle } from "lucide-react";
import { api } from "~/trpc/server";

export default function AdminPlansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Управление планами</h1>
        <p className="text-muted-foreground">
          Настройка и управление тарифными планами VPN
        </p>
      </div>

      <Suspense fallback={<PlansListSkeleton />}>
        <PlansList />
      </Suspense>
    </div>
  );
}

async function PlansList() {
  const plans = await api.subscription.plans.getAll();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">VPN Планы</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-6 relative">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">{plan.nameRu}</h4>
              <Badge variant={plan.isActive ? "default" : "secondary"}>
                {plan.isActive ? "Активный" : "Неактивный"}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {plan.descriptionRu}
            </p>
            
            <div className="text-3xl font-bold mb-4">
              ${plan.price}
              <span className="text-lg font-normal text-muted-foreground">/мес</span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{plan.maxDevices} устройств</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{plan.durationDays} дней доступа</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Протоколы: {plan.protocols.join(", ")}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Порядок сортировки: {plan.sortOrder}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}

function PlansListSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-10 w-24 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
} 