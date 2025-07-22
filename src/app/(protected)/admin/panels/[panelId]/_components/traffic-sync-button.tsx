"use client";

import { useState } from "react";
import { RefreshCw, Download, TrendingUp } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";
import { toast } from "sonner";

interface TrafficSyncButtonProps {
  panelId?: string;
  showStats?: boolean;
}

export function TrafficSyncButton({ panelId, showStats = false }: TrafficSyncButtonProps) {
  const [isSync, setIsSync] = useState(false);
  const utils = api.useUtils();

  const { data: trafficStats, isLoading: statsLoading } = api.admin.traffic.getTrafficStats.useQuery(
    undefined,
    { enabled: showStats }
  );

  const syncTrafficMutation = api.admin.traffic.syncPanelTraffic.useMutation({
    onSuccess: (result) => {
      toast.success(`Трафик синхронизирован: ${result.syncedCount} клиентов обновлено`);
      if (panelId) {
        void utils.admin.panels.getPanelClients.invalidate({ id: panelId });
      }
      if (showStats) {
        void utils.admin.traffic.getTrafficStats.invalidate();
      }
    },
    onError: (error) => {
      toast.error(`Ошибка синхронизации: ${error.message}`);
    },
    onSettled: () => {
      setIsSync(false);
    },
  });

  const syncAllTrafficMutation = api.admin.traffic.syncAllTraffic.useMutation({
    onSuccess: (result) => {
      toast.success(`Синхронизирован трафик со всех панелей: ${result.totalSynced} клиентов обновлено`);
      if (panelId) {
        void utils.admin.panels.getPanelClients.invalidate({ id: panelId });
      }
      if (showStats) {
        void utils.admin.traffic.getTrafficStats.invalidate();
      }
    },
    onError: (error) => {
      toast.error(`Ошибка синхронизации: ${error.message}`);
    },
    onSettled: () => {
      setIsSync(false);
    },
  });

  const handleSyncPanel = () => {
    if (!panelId) {
      toast.error("ID панели не указан");
      return;
    }
    setIsSync(true);
    syncTrafficMutation.mutate({ panelId });
  };

  const handleSyncAll = () => {
    setIsSync(true);
    syncAllTrafficMutation.mutate();
  };

  if (showStats) {
    if (statsLoading) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    if (trafficStats) {
      return (
        <div className="space-y-4">
          {/* Traffic Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Общий трафик
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(Number(trafficStats.totalTraffic.used) / (1024 * 1024 * 1024)).toFixed(1)} GB
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ↑ {(Number(trafficStats.totalTraffic.up) / (1024 * 1024 * 1024)).toFixed(1)} GB • 
                ↓ {(Number(trafficStats.totalTraffic.down) / (1024 * 1024 * 1024)).toFixed(1)} GB
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                За сутки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(Number(trafficStats.last24Hours.total) / (1024 * 1024 * 1024)).toFixed(1)} GB
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ↑ {(Number(trafficStats.last24Hours.up) / (1024 * 1024 * 1024)).toFixed(1)} GB • 
                ↓ {(Number(trafficStats.last24Hours.down) / (1024 * 1024 * 1024)).toFixed(1)} GB
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Подписки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trafficStats.activeSubscriptions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                из {trafficStats.totalSubscriptions} активных
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sync Buttons */}
        <div className="flex items-center gap-2">
          {panelId && (
            <Button
              onClick={handleSyncPanel}
              disabled={isSync}
              variant="outline"
              size="sm"
            >
              {isSync ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Синхронизировать панель
            </Button>
          )}

          <Button
            onClick={handleSyncAll}
            disabled={isSync}
            size="sm"
          >
            {isSync ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2" />
            )}
            Синхронизировать все
          </Button>
        </div>
      </div>
    );
    }
  }

  return (
    <div className="flex items-center gap-2">
      {panelId ? (
        <Button
          onClick={handleSyncPanel}
          disabled={isSync}
          variant="outline"
          size="sm"
        >
          {isSync ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Синхронизировать трафик
        </Button>
      ) : (
        <Button
          onClick={handleSyncAll}
          disabled={isSync}
          size="sm"
        >
          {isSync ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <TrendingUp className="h-4 w-4 mr-2" />
          )}
          Синхронизировать все
        </Button>
      )}
    </div>
  );
} 