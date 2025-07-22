"use client";

import { Activity, Users, Shield, Zap } from "lucide-react";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

function RecentActivitySkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function RecentActivity() {
  const { data: dashboardData, isLoading } = api.user.dashboard.getData.useQuery();

  if (isLoading) {
    return <RecentActivitySkeleton />;
  }

  if (!dashboardData) {
    return null;
  }

  const { recentActivities } = dashboardData;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "connection":
        return Zap;
      case "subscription":
        return Shield;
      case "payment":
        return Users;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "connection":
        return "text-blue-600";
      case "subscription":
        return "text-green-600";
      case "payment":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Последняя активность</h3>
      <div className="space-y-4">
        {recentActivities.map((activity) => {
          const IconComponent = getActivityIcon(activity.type);
          const iconColor = getActivityColor(activity.type);
          
          return (
            <div key={activity.id} className="flex items-center gap-4">
              <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.timestamp.toLocaleString('ru-RU')}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {activity.type === "connection" ? "Соединение" :
                 activity.type === "subscription" ? "Подписка" : "Платеж"}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
} 