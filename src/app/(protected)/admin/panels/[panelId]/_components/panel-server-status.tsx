import { Activity, Cpu, HardDrive, MemoryStick, Network, Zap, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { type RouterOutputs } from "~/trpc/react";

interface PanelServerStatusProps {
  panelData: RouterOutputs["admin"]["panels"]["getDetailedInfo"];
}

export function PanelServerStatus({ panelData }: PanelServerStatusProps) {
  const { panelInfo, connectionStatus } = panelData;
  
  if (!connectionStatus || !panelInfo?.serverStatus) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Статус сервера недоступен</p>
            <p className="text-sm mt-1">
              {!connectionStatus 
                ? "Нет соединения с панелью" 
                : "Не удается получить статус сервера"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { serverStatus } = panelInfo;

  // Calculate usage percentages
  const memUsagePercent = Math.round((serverStatus.mem.current / serverStatus.mem.total) * 100);
  const swapUsagePercent = Math.round((serverStatus.swap.current / serverStatus.swap.total) * 100);
  const diskUsagePercent = Math.round((serverStatus.disk.current / serverStatus.disk.total) * 100);

  // Format bytes to human readable
  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format uptime
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days} дней ${hours} часов ${mins} минут`;
    if (hours > 0) return `${hours} часов ${mins} минут`;
    return `${mins} минут`;
  };

  // Format speed
  const formatSpeed = (bytesPerSecond: number): string => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Статус сервера</h3>
        <p className="text-sm text-muted-foreground">
          Мониторинг системных ресурсов и производительности
        </p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CPU Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Использование CPU
            </CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serverStatus.cpu}%</div>
            <Progress value={serverStatus.cpu} className="mt-2" />
            {serverStatus.loads && (
              <p className="text-xs text-muted-foreground mt-2">
                Загрузка: {serverStatus.loads.map(l => l.toFixed(2)).join(", ")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Использование памяти
            </CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memUsagePercent}%</div>
            <Progress value={memUsagePercent} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {formatBytes(serverStatus.mem.current)} / {formatBytes(serverStatus.mem.total)}
            </p>
          </CardContent>
        </Card>

        {/* Disk Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Использование диска
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diskUsagePercent}%</div>
            <Progress value={diskUsagePercent} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {formatBytes(serverStatus.disk.current)} / {formatBytes(serverStatus.disk.total)}
            </p>
          </CardContent>
        </Card>

        {/* Uptime */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Время работы
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {Math.floor(serverStatus.uptime / (24 * 3600))} дней
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatUptime(serverStatus.uptime)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network & X-Ray Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Сетевая активность
            </CardTitle>
            <CardDescription>
              Статистика сетевого трафика и соединений
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Speed */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Скорость выгрузки</div>
                <div className="text-lg font-semibold text-blue-600">
                  {formatSpeed(serverStatus.netIO.up)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Скорость загрузки</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatSpeed(serverStatus.netIO.down)}
                </div>
              </div>
            </div>

            {/* Total Traffic */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Всего отправлено</div>
                <div className="text-lg font-semibold">
                  {formatBytes(serverStatus.netTraffic.sent)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Всего получено</div>
                <div className="text-lg font-semibold">
                  {formatBytes(serverStatus.netTraffic.recv)}
                </div>
              </div>
            </div>

            {/* Connections */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">TCP соединения</div>
                <div className="text-lg font-semibold">
                  {serverStatus.tcpCount}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">UDP соединения</div>
                <div className="text-lg font-semibold">
                  {serverStatus.udpCount}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* X-Ray Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Статус X-Ray
            </CardTitle>
            <CardDescription>
              Информация о состоянии X-Ray core
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* X-Ray State */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Состояние:</span>
              <Badge 
                variant={serverStatus.xray.state === "running" ? "default" : "destructive"}
                className="text-sm"
              >
                {serverStatus.xray.state === "running" ? "Работает" : "Остановлен"}
              </Badge>
            </div>

            {/* X-Ray Version */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Версия:</span>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {serverStatus.xray.version || "Неизвестно"}
              </span>
            </div>

            {/* Error Message */}
            {serverStatus.xray.errorMsg && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <div className="text-sm font-medium text-destructive mb-1">
                  Ошибка X-Ray:
                </div>
                <div className="text-xs text-destructive font-mono">
                  {serverStatus.xray.errorMsg}
                </div>
              </div>
            )}

            {/* Swap Usage if exists */}
            {serverStatus.swap.total > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Использование swap:</span>
                  <span className="text-sm">{swapUsagePercent}%</span>
                </div>
                <Progress value={swapUsagePercent} />
                <p className="text-xs text-muted-foreground mt-1">
                  {formatBytes(serverStatus.swap.current)} / {formatBytes(serverStatus.swap.total)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 