"use client";

import { useState } from "react";
import { Shield, HardDrive, Calendar, Activity, RefreshCw } from "lucide-react";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { api } from "~/trpc/react";

function StatsCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </Card>
  );
}

export function DashboardStats() {
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { 
    data: dashboardData, 
    isLoading, 
    refetch 
  } = api.user.dashboard.getData.useQuery();

  const syncTrafficMutation = api.user.dashboard.syncTraffic.useMutation({
    onMutate: () => setIsSyncing(true),
    onSuccess: () => {
      void refetch(); // Refresh dashboard data
      setIsSyncing(false);
    },
    onError: (error) => {
      console.error('Failed to sync traffic:', error);
      setIsSyncing(false);
    },
  });

  const handleSyncTraffic = () => {
    syncTrafficMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { stats } = dashboardData;

  // Format bytes to human readable format
  const formatBytes = (bytes: bigint, decimals = 1) => {
    if (bytes === BigInt(0)) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'КБ', 'МБ', 'ГБ', 'ТБ'];

    const i = Math.floor(Math.log(Number(bytes)) / Math.log(k));

    return parseFloat((Number(bytes) / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const statsCards = [
    {
      title: "Активные подписки",
      value: stats.activeSubscriptions,
      description: "из " + stats.totalSubscriptions + " всего",
      icon: Shield,
      color: "text-green-600",
      showProgress: false,
      progressValue: 0,
    },
    {
      title: "Использование данных",
      value: `${stats.dataUsage.percentage}%`,
      description: stats.dataUsage.limit ? 
        `${formatBytes(stats.dataUsage.used)} из ${formatBytes(stats.dataUsage.limit)}` : 
        `${formatBytes(stats.dataUsage.used)} (безлимитно)`,
      icon: HardDrive,
      color: stats.dataUsage.percentage > 80 ? "text-red-600" : 
             stats.dataUsage.percentage > 60 ? "text-orange-600" : "text-blue-600",
      showProgress: true,
      progressValue: stats.dataUsage.percentage,
    },
    {
      title: "Дней до истечения",
      value: stats.daysUntilExpiry ?? "∞",
      description: stats.daysUntilExpiry ? "дней осталось" : "Подписка отсутствует",
      icon: Calendar,
      color: stats.daysUntilExpiry && stats.daysUntilExpiry < 7 ? "text-orange-600" : "text-purple-600",
      showProgress: false,
      progressValue: 0,
    },
    {
      title: "Статус соединения",
      value: stats.connectionStatus === "connected" ? "Подключен" : 
             stats.connectionStatus === "connecting" ? "Подключение..." : "Отключен",
      description: "Текущий статус VPN",
      icon: Activity,
      color: stats.connectionStatus === "connected" ? "text-green-600" : 
             stats.connectionStatus === "connecting" ? "text-yellow-600" : "text-red-600",
      showProgress: false,
      progressValue: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                {stat.title === "Использование данных" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleSyncTraffic}
                    disabled={isSyncing}
                    title="Синхронизировать данные с сервера"
                  >
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  </Button>
                )}
              </div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.showProgress && (
              <div className="mt-2 mb-2">
                <Progress 
                  value={stat.progressValue} 
                  className="h-2"
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
} 