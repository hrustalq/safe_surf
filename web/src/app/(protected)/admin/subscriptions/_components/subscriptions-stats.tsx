import { CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { Card } from "~/components/ui/card";
import { api } from "~/trpc/server";

export async function SubscriptionsStats() {
  const [
    activeSubscriptions,
    expiredSubscriptions,
    pendingSubscriptions,
    monthlyRevenue
  ] = await Promise.all([
    api.admin.subscriptions.getActiveCount(),
    api.admin.subscriptions.getExpiredCount(),
    api.admin.subscriptions.getPendingCount(),
    api.admin.subscriptions.getMonthlyRevenue(),
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        title="Активные"
        value={activeSubscriptions.toString()}
        icon={CheckCircle}
        description="Действующие подписки"
        iconColor="text-green-500"
      />
      
      <StatCard
        title="Истекшие"
        value={expiredSubscriptions.toString()}
        icon={XCircle}
        description="Требуют продления"
        iconColor="text-red-500"
      />
      
      <StatCard
        title="Ожидающие"
        value={pendingSubscriptions.toString()}
        icon={Clock}
        description="Ожидают активации"
        iconColor="text-yellow-500"
      />

      <StatCard
        title="Доход/мес"
        value={`$${monthlyRevenue.toLocaleString()}`}
        icon={DollarSign}
        description="Месячный доход"
        iconColor="text-blue-500"
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  iconColor,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  iconColor: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="p-3 bg-muted rounded-full">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
} 