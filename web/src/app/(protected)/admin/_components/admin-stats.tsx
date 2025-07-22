import { Users, CreditCard, DollarSign, Server } from "lucide-react";
import { Card } from "~/components/ui/card";
import { api } from "~/trpc/server";

export async function AdminStats() {
  const [
    totalUsers,
    activeSubscriptions,
    totalRevenue,
    activeServers
  ] = await Promise.all([
    api.admin.stats.getTotalUsers(),
    api.admin.stats.getActiveSubscriptions(),
    api.admin.stats.getTotalRevenue(),
    api.admin.stats.getActiveServers(),
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Всего пользователей"
        value={totalUsers.toString()}
        icon={Users}
        trend="+12%"
        trendLabel="за месяц"
      />
      
      <StatCard
        title="Активные подписки"
        value={activeSubscriptions.toString()}
        icon={CreditCard}
        trend="+8%"
        trendLabel="за месяц"
      />
      
      <StatCard
        title="Общий доход"
        value={`$${totalRevenue.toLocaleString()}`}
        icon={DollarSign}
        trend="+23%"
        trendLabel="за месяц"
      />
      
      <StatCard
        title="Активные серверы"
        value={activeServers.toString()}
        icon={Server}
        trend="100%"
        trendLabel="работают"
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  trendLabel: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-green-600 font-medium">{trend}</span>
            <span className="text-sm text-muted-foreground">{trendLabel}</span>
          </div>
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  );
} 