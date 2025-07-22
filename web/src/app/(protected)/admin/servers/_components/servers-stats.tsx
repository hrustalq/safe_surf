import { Server, Activity, CheckCircle } from "lucide-react";
import { Card } from "~/components/ui/card";
import { api } from "~/trpc/server";

export async function ServersStats() {
  const stats = await api.admin.servers.getStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        title="Всего серверов"
        value={stats.totalServers.toString()}
        icon={Server}
        description="Общее количество"
        iconColor="text-blue-500"
      />
      
      <StatCard
        title="Активные серверы"
        value={stats.activeServers.toString()}
        icon={CheckCircle}
        description="В работе"
        iconColor="text-green-500"
      />
      
      <StatCard
        title="Общая нагрузка"
        value={stats.totalLoad.toString()}
        icon={Activity}
        description="Всего подключений"
        iconColor="text-orange-500"
      />

      <StatCard
        title="Средняя нагрузка"
        value={stats.averageLoad.toString()}
        icon={Activity}
        description="Подключений/сервер"
        iconColor="text-purple-500"
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