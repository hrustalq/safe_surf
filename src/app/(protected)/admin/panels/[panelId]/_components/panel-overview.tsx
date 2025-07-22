import { Activity, Users, Server, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { type RouterOutputs } from "~/trpc/react";

interface PanelOverviewProps {
  panelData: RouterOutputs["admin"]["panels"]["getDetailedInfo"];
}

export function PanelOverview({ panelData }: PanelOverviewProps) {
  const { panelInfo, connectionStatus } = panelData;

  if (!connectionStatus || !panelInfo) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive">
              Соединение
            </CardTitle>
            <div className="text-2xl font-bold text-destructive">
              Ошибка
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Не удается подключиться к панели
            </p>
          </CardContent>
        </Card>
        
        {[1, 2, 3].map((i) => (
          <Card key={i} className="opacity-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Данные недоступны
              </CardTitle>
              <div className="text-2xl font-bold text-muted-foreground">
                —
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Требуется подключение
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { serverStatus, inboundsSummary, onlineClients } = panelInfo;
  
  // Ensure onlineClients is always an array of objects
  const normalizedOnlineClients = Array.isArray(onlineClients) 
    ? onlineClients.map(client => 
        typeof client === 'string' 
          ? { email: client, ip: 'unknown', port: 0, protocol: 'unknown' }
          : client
      )
    : [];
  
  // Calculate usage percentages
  const memUsagePercent = serverStatus 
    ? Math.round((serverStatus.mem.current / serverStatus.mem.total) * 100)
    : 0;
  
  const diskUsagePercent = serverStatus 
    ? Math.round((serverStatus.disk.current / serverStatus.disk.total) * 100)
    : 0;

  const totalTrafficGB = Math.round(
    ((inboundsSummary.totalTraffic.up + inboundsSummary.totalTraffic.down) / (1024 * 1024 * 1024))
  );

  // Format uptime
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}д ${hours}ч`;
    if (hours > 0) return `${hours}ч ${mins}м`;
    return `${mins}м`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Server Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Статус сервера
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">CPU</span>
              <span className="text-xs font-medium">{serverStatus?.cpu ?? 0}%</span>
            </div>
            <Progress value={serverStatus?.cpu ?? 0} className="h-1" />
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Память</span>
              <span className="text-xs font-medium">{memUsagePercent}%</span>
            </div>
            <Progress value={memUsagePercent} className="h-1" />
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Диск</span>
              <span className="text-xs font-medium">{diskUsagePercent}%</span>
            </div>
            <Progress value={diskUsagePercent} className="h-1" />

            <div className="flex items-center justify-between">
              <Badge 
                variant={serverStatus?.xray.state === "running" ? "default" : "destructive"}
                className="text-xs"
              >
                X-Ray {serverStatus?.xray.state === "running" ? "Работает" : "Остановлен"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {serverStatus ? formatUptime(serverStatus.uptime) : "—"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inbounds Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Inbound&apos;ы
          </CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {inboundsSummary.totalInbounds}
          </div>
          <div className="space-y-1 mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Активных</span>
              <span className="font-medium text-green-600">
                {inboundsSummary.enabledInbounds}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Истекших</span>
              <span className="font-medium text-red-600">
                {inboundsSummary.expiredInbounds}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Трафик</span>
              <span className="font-medium">
                {totalTrafficGB} GB
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Клиенты
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {inboundsSummary.totalClients}
          </div>
          <div className="space-y-1 mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Онлайн</span>
              <span className="font-medium text-green-600">
                {normalizedOnlineClients.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Истекших</span>
              <span className="font-medium text-red-600">
                {panelInfo.expiredClients.length}
              </span>
            </div>
            {serverStatus && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Соединения</span>
                <span className="font-medium">
                  TCP: {serverStatus.tcpCount} | UDP: {serverStatus.udpCount}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Network Traffic */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Сетевая активность
          </CardTitle>
          <Wifi className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {serverStatus ? (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Исходящий трафик</span>
                  <span className="font-medium">
                    {(serverStatus.netTraffic.sent / (1024 * 1024 * 1024)).toFixed(2)} GB
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Входящий трафик</span>
                  <span className="font-medium">
                    {(serverStatus.netTraffic.recv / (1024 * 1024 * 1024)).toFixed(2)} GB
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Скорость Up</span>
                  <span className="font-medium text-blue-600">
                    {(serverStatus.netIO.up / (1024 * 1024)).toFixed(2)} MB/s
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Скорость Down</span>
                  <span className="font-medium text-green-600">
                    {(serverStatus.netIO.down / (1024 * 1024)).toFixed(2)} MB/s
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center text-xs text-muted-foreground">
                Данные недоступны
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 