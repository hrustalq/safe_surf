"use client";

import { Shield, HardDrive, Calendar, Activity } from "lucide-react";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
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
  const { data: dashboardData, isLoading } = api.user.dashboard.getData.useQuery();

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

  const statsCards = [
    {
      title: "Активные подписки",
      value: stats.activeSubscriptions,
      description: "из " + stats.totalSubscriptions + " всего",
      icon: Shield,
      color: "text-green-600",
    },
    {
      title: "Использование данных",
      value: `${stats.dataUsage.percentage}%`,
      description: stats.dataUsage.limit ? 
        `${(Number(stats.dataUsage.used) / 1024 / 1024 / 1024).toFixed(1)} ГБ использовано` : 
        "Безлимитно",
      icon: HardDrive,
      color: "text-blue-600",
    },
    {
      title: "Дней до истечения",
      value: stats.daysUntilExpiry ?? "∞",
      description: stats.daysUntilExpiry ? "дней осталось" : "Подписка отсутствует",
      icon: Calendar,
      color: stats.daysUntilExpiry && stats.daysUntilExpiry < 7 ? "text-orange-600" : "text-purple-600",
    },
    {
      title: "Статус соединения",
      value: stats.connectionStatus === "connected" ? "Подключен" : 
             stats.connectionStatus === "connecting" ? "Подключение..." : "Отключен",
      description: "Текущий статус VPN",
      icon: Activity,
      color: stats.connectionStatus === "connected" ? "text-green-600" : 
             stats.connectionStatus === "connecting" ? "text-yellow-600" : "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </div>
          <div className="text-2xl font-bold">{stat.value}</div>
          <p className="text-xs text-muted-foreground">{stat.description}</p>
        </Card>
      ))}
    </div>
  );
} 