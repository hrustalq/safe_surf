import { CheckCircle, Clock } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/server";

export async function SystemOverview() {
  const systemStatus = await api.admin.system.getOverview();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Статус системы</span>
        <Badge variant={systemStatus.systemHealth === "healthy" ? "default" : "destructive"}>
          {systemStatus.systemHealth === "healthy" ? "Работает" : "Проблемы"}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">База данных</span>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm">Подключена</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Серверы VPN</span>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm">{systemStatus.activeServers}/{systemStatus.totalServers}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Использование памяти</span>
        <span className="text-sm">{systemStatus.memoryUsage}%</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Загрузка CPU</span>
        <span className="text-sm">{systemStatus.cpuUsage}%</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Время работы</span>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          <span className="text-sm">{systemStatus.uptime}</span>
        </div>
      </div>
    </div>
  );
} 