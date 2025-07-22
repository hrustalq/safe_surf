import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api, HydrateClient } from "~/trpc/server";
import { TrafficSyncButton } from "../panels/[panelId]/_components/traffic-sync-button";
import { TrendingUp, Users, Activity, Database } from "lucide-react";

export default async function TrafficPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление трафиком</h1>
          <p className="text-muted-foreground">
            Мониторинг и синхронизация данных трафика с 3X-UI панелей
          </p>
        </div>
      </div>

      {/* Traffic Statistics */}
      <Suspense fallback={<TrafficStatsSkeleton />}>
        <HydrateClient>
          <TrafficStats />
        </HydrateClient>
      </Suspense>

      {/* Top Traffic Users */}
      <Suspense fallback={<TopUsersSkeleton />}>
        <HydrateClient>
          <TopTrafficUsers />
        </HydrateClient>
      </Suspense>
    </div>
  );
}

async function TrafficStats() {
  const stats = await api.admin.traffic.getTrafficStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Общий трафик
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(Number(stats.totalTraffic.used) / (1024 * 1024 * 1024)).toFixed(1)} GB
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            ↑ {(Number(stats.totalTraffic.up) / (1024 * 1024 * 1024)).toFixed(1)} GB • 
            ↓ {(Number(stats.totalTraffic.down) / (1024 * 1024 * 1024)).toFixed(1)} GB
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            За 24 часа
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {(Number(stats.last24Hours.total) / (1024 * 1024 * 1024)).toFixed(1)} GB
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            ↑ {(Number(stats.last24Hours.up) / (1024 * 1024 * 1024)).toFixed(1)} GB • 
            ↓ {(Number(stats.last24Hours.down) / (1024 * 1024 * 1024)).toFixed(1)} GB
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Активные подписки
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.activeSubscriptions}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            из {stats.totalSubscriptions} всего
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Синхронизация
          </CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
                     <div className="space-y-2">
             <TrafficSyncButton showStats={false} />
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function TopTrafficUsers() {
  const topUsers = await api.admin.traffic.getTopTrafficUsers({ limit: 10, period: "7d" });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Топ пользователей по трафику (7 дней)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Пользователи с наибольшим потреблением трафика
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topUsers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Нет данных о трафике</p>
              <p className="text-sm mt-1">Синхронизируйте данные с панелей для отображения статистики</p>
            </div>
          ) : (
            topUsers.map((userEntry, index) => (
              <div key={userEntry.subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">
                      {userEntry.subscription.user.name ?? userEntry.subscription.user.email}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {userEntry.subscription.plan.name} • {userEntry.subscription.xUIClientEmail}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {(Number(userEntry.traffic.used) / (1024 * 1024 * 1024)).toFixed(2)} GB
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ↑ {(Number(userEntry.traffic.up) / (1024 * 1024 * 1024)).toFixed(1)} GB • 
                    ↓ {(Number(userEntry.traffic.down) / (1024 * 1024 * 1024)).toFixed(1)} GB
                  </div>
                  {userEntry.traffic.limit && (
                    <div className="text-xs text-muted-foreground">
                      Лимит: {(Number(userEntry.traffic.limit) / (1024 * 1024 * 1024)).toFixed(0)} GB
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TrafficStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TopUsersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-80" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 