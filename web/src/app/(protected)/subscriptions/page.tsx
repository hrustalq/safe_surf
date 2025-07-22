import { Suspense } from "react";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { SubscriptionPlans } from "./_components/subscription-plans";
import { UserSubscriptionStatus } from "./_components/user-subscription-status";

export default function SubscriptionsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Выберите подходящий план
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Защитите своё интернет-соединение с помощью SafeSurf VPN
          </p>
        </div>

        {/* Current Subscription Status */}
        <Suspense fallback={<SubscriptionStatusSkeleton />}>
          <UserSubscriptionStatus />
        </Suspense>

        {/* Available Plans */}
        <Suspense fallback={<PlansSkeleton />}>
          <SubscriptionPlans />
        </Suspense>
      </div>
    </div>
  );
}

function SubscriptionStatusSkeleton() {
  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </Card>
  );
}

function PlansSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6">
          <div className="text-center mb-6">
            <Skeleton className="h-8 w-24 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto mb-4" />
            <Skeleton className="h-12 w-20 mx-auto" />
          </div>
          <div className="space-y-3 mb-8">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-12 w-full" />
        </Card>
      ))}
    </div>
  );
} 