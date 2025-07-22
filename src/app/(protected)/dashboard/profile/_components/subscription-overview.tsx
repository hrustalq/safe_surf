"use client";

import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import {
  Shield,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface SubscriptionOverviewProps {
  subscription: {
    id: string;
    status: string;
    planName: string;
    expiresAt: Date;
    // Add other subscription properties as needed
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getDaysUntilExpiry(date: Date): number {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function SubscriptionOverview({ subscription }: SubscriptionOverviewProps) {
  const daysUntilExpiry = getDaysUntilExpiry(subscription.expiresAt);
  const isExpiringSoon = daysUntilExpiry <= 7;
  const isExpired = daysUntilExpiry < 0;

  // Mock data - replace with real subscription data
  const mockData = {
    usedTraffic: 45 * 1024 * 1024 * 1024, // 45 GB
    totalTraffic: null, // Unlimited
    deviceCount: 3,
    maxDevices: 5,
    connectionTime: "142 ч",
    lastConnection: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  };

  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Истекла
        </Badge>
      );
    }
    
    if (isExpiringSoon) {
      return (
        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
          <Clock className="h-3 w-3" />
          Скоро истечет
        </Badge>
      );
    }
    
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle className="h-3 w-3" />
        Активна
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Plan Info */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-foreground">{subscription.planName}</h4>
          <p className="text-sm text-muted-foreground">
            Истекает {subscription.expiresAt.toLocaleDateString("ru-RU")}
          </p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Expiry Warning */}
      {(isExpiringSoon || isExpired) && (
        <Card className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                {isExpired ? "Подписка истекла" : `Подписка истекает через ${daysUntilExpiry} дн.`}
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                {isExpired 
                  ? "Обновите подписку для продолжения использования VPN"
                  : "Продлите подписку, чтобы избежать перерывов в обслуживании"
                }
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Usage Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Трафик</span>
          </div>
          <div>
            <p className="text-lg font-semibold">
              {formatBytes(mockData.usedTraffic)}
            </p>
            <p className="text-xs text-muted-foreground">
              {mockData.totalTraffic ? `из ${formatBytes(mockData.totalTraffic)}` : "Безлимитный"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="font-medium">Устройства</span>
          </div>
          <div>
            <p className="text-lg font-semibold">
              {mockData.deviceCount}/{mockData.maxDevices}
            </p>
            <Progress 
              value={(mockData.deviceCount / mockData.maxDevices) * 100} 
              className="h-2 mt-1"
            />
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="pt-2 border-t border-border space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Время подключения</span>
          </div>
          <span className="font-medium">{mockData.connectionTime}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span>Последнее подключение</span>
          </div>
          <span className="text-muted-foreground">
            {mockData.lastConnection.toLocaleString("ru-RU", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 space-y-2">
        {(isExpiringSoon || isExpired) && (
          <Button asChild className="w-full" size="sm">
            <Link href="/subscriptions">
              Продлить подписку
            </Link>
          </Button>
        )}
        
        <Button asChild variant="outline" className="w-full" size="sm">
          <Link href="/dashboard">
            Перейти в панель управления
          </Link>
        </Button>
      </div>
    </div>
  );
}