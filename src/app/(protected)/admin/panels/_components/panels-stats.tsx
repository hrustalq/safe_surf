import { Monitor, CheckCircle, XCircle } from "lucide-react";
import { Card } from "~/components/ui/card";
import { api } from "~/trpc/server";

export async function PanelsStats() {
  const stats = await api.admin.panels.getStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Всего панелей"
        value={stats.totalPanels.toString()}
        icon={Monitor}
        description="3X-UI панели"
        iconColor="text-blue-500"
      />
      
      <StatCard
        title="Активные панели"
        value={stats.activePanels.toString()}
        icon={CheckCircle}
        description="В работе"
        iconColor="text-green-500"
      />
      
      <StatCard
        title="Неактивные панели"
        value={stats.inactivePanels.toString()}
        icon={XCircle}
        description="Отключены"
        iconColor="text-red-500"
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