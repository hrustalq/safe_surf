"use client";

import { Activity, Globe } from "lucide-react";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import Link from "next/link";

function ConnectionCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6" />
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
    </Card>
  );
}

export function ConnectionStatus() {
  const { data: dashboardData, isLoading } = api.user.dashboard.getData.useQuery();

  if (isLoading) {
    return <ConnectionCardSkeleton />;
  }

  if (!dashboardData) {
    return null;
  }

  const { currentSubscription, stats } = dashboardData;

  if (!currentSubscription) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Нет активной подписки</h3>
          <p className="text-muted-foreground mb-4">
            Для использования VPN необходимо активировать подписку
          </p>
          <Button asChild>
            <Link href="/subscriptions">Выбрать тариф</Link>
          </Button>
        </div>
      </Card>
    );
  }

  const formatBytes = (bytes: bigint) => {
    const gb = Number(bytes) / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} ГБ`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className={`h-6 w-6 ${
              stats.connectionStatus === "connected" ? "text-green-600" : 
              stats.connectionStatus === "connecting" ? "text-yellow-600 animate-pulse" : "text-red-600"
            }`} />
            {stats.connectionStatus === "connected" && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">
              {stats.connectionStatus === "connected" ? "VPN подключен" : 
               stats.connectionStatus === "connecting" ? "Подключение..." : "VPN отключен"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {currentSubscription.planNameRu}
            </p>
          </div>
        </div>
        <Button 
          variant={stats.connectionStatus === "connected" ? "destructive" : "default"}
          size="sm"
        >
          {stats.connectionStatus === "connected" ? "Отключить" : "Подключить"}
        </Button>
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Максимум устройств</span>
          <span className="font-medium">{currentSubscription.maxDevices}</span>
        </div>
        
        {stats.dataUsage.limit && (
          <>
            <div className="flex justify-between text-sm">
              <span>Использование данных</span>
              <span className="font-medium">
                {formatBytes(stats.dataUsage.used)} / {formatBytes(stats.dataUsage.limit)}
              </span>
            </div>
            <Progress value={stats.dataUsage.percentage} className="h-2" />
          </>
        )}
        
        <div className="flex justify-between text-sm">
          <span>Протоколы</span>
          <div className="flex gap-1">
            {currentSubscription.protocols.map((protocol) => (
              <Badge key={protocol} variant="secondary" className="text-xs">
                {protocol.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Действительно до</span>
          <span className="font-medium">
            {new Date(currentSubscription.endDate).toLocaleDateString('ru-RU')}
          </span>
        </div>
      </div>
    </Card>
  );
} 