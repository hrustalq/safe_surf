"use client";

import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  Activity, 
  LogIn, 
  LogOut, 
  Settings, 
  Shield, 
  CreditCard,
  User,
  Clock
} from "lucide-react";

interface ActivityHistoryProps {
  activities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    ip?: string;
    userAgent?: string;
  }>;
}

const activityIcons = {
  login: LogIn,
  logout: LogOut,
  password_change: Shield,
  profile_update: User,
  settings_change: Settings,
  subscription_change: CreditCard,
  default: Activity,
};

const activityColors = {
  login: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  logout: "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400", 
  password_change: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  profile_update: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  settings_change: "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  subscription_change: "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
  default: "bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400",
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Только что";
  if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ч назад`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} д назад`;
  
  return date.toLocaleDateString("ru-RU");
}

export function ActivityHistory({ activities }: ActivityHistoryProps) {
  if (activities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Нет активности
        </h3>
        <p className="text-muted-foreground">
          История активности вашего аккаунта будет отображаться здесь
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activities.slice(0, 10).map((activity) => {
        const IconComponent = activityIcons[activity.type as keyof typeof activityIcons] || activityIcons.default;
        const iconColorClass = activityColors[activity.type as keyof typeof activityColors] || activityColors.default;
        
        return (
          <Card key={activity.id} className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${iconColorClass}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(activity.timestamp)}
                      </div>
                      
                      {activity.ip && (
                        <Badge variant="outline" className="text-xs">
                          {activity.ip}
                        </Badge>
                      )}
                    </div>
                    
                    {activity.userAgent && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {activity.userAgent}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
      
      {activities.length > 10 && (
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Показано последние 10 записей из {activities.length}
          </p>
        </Card>
      )}
    </div>
  );
}