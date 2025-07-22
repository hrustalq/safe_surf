"use client";

import { Clock, Users, Activity, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

interface PanelInboundsProps {
  panelId: string;
}

export function PanelInbounds({ panelId }: PanelInboundsProps) {
  const { data: inbounds = [], isLoading, error } = api.admin.panels.getPanelInbounds.useQuery({ id: panelId });

  if (isLoading) {
    return <div className="text-center py-8">Загрузка inbound&apos;ов...</div>;
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p className="font-medium">Ошибка загрузки inbound&apos;ов</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!inbounds || inbounds.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Inbound&apos;ы не найдены</p>
            <p className="text-sm mt-1">На этой панели пока нет настроенных inbound&apos;ов</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Inbound&apos;ы панели</h3>
          <p className="text-sm text-muted-foreground">
            Найдено {inbounds.length} inbound{inbounds.length === 1 ? '' : 'ов'}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {inbounds.map((inbound) => (
          <Card key={inbound.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${
                    inbound.enable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{inbound.remark}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Порт: {inbound.port}, Транспорт: {inbound.streamSettings.network.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={inbound.enable ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {inbound.enable ? "Включен" : "Отключен"}
                  </Badge>
                  {inbound.expiryTime > 0 && inbound.expiryTime < Date.now() && (
                    <Badge variant="destructive" className="text-xs">
                      Истек
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <Users className="h-3 w-3" />
                    Клиенты
                  </div>
                  <div className="text-lg font-semibold">
                    {inbound.meta.activeClientsCount} / {inbound.meta.clientsCount}
                  </div>
                  <div className="text-xs text-muted-foreground">активных</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <ChevronRight className="h-3 w-3" />
                    Исходящий
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    {inbound.meta.trafficGB.up} GB
                  </div>
                  <div className="text-xs text-muted-foreground">отправлено</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <ChevronDown className="h-3 w-3" />
                    Входящий
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    {inbound.meta.trafficGB.down} GB
                  </div>
                  <div className="text-xs text-muted-foreground">получено</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <ChevronRight className="h-3 w-3" />
                    Общий
                  </div>
                  <div className="text-lg font-semibold">
                    {inbound.meta.trafficGB.total} GB
                  </div>
                  <div className="text-xs text-muted-foreground">всего</div>
                </div>
              </div>

              {/* Network Configuration */}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm font-medium mb-2">Конфигурация сети</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Транспорт:</span>
                    <span className="ml-1 font-medium">
                      {inbound.streamSettings.network.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Безопасность:</span>
                    <span className="ml-1 font-medium">
                      {inbound.streamSettings.security.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Снифинг:</span>
                    <span className="ml-1 font-medium">
                      {inbound.sniffing.enabled ? "Включен" : "Отключен"}
                    </span>
                  </div>
                </div>
                
                {inbound.streamSettings.network === "ws" && inbound.streamSettings.wsSettings && (
                  <div className="mt-2 text-xs">
                    <span className="text-muted-foreground">WebSocket путь:</span>
                    <span className="ml-1 font-mono bg-background px-1 py-0.5 rounded">
                      {inbound.streamSettings.wsSettings.path}
                    </span>
                  </div>
                )}
              </div>

              {/* Expiry Information */}
              {inbound.expiryTime > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-amber-800 mb-1">
                    Срок действия
                  </div>
                  <div className="text-xs text-amber-700">
                    {inbound.expiryTime < Date.now() ? (
                      <span className="font-medium">Истек</span>
                    ) : (
                      <>Истекает: {new Date(inbound.expiryTime).toLocaleString('ru-RU')}</>
                    )}
                  </div>
                </div>
              )}

              {/* Clients Preview */}
              {inbound.settings.clients.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">
                    Клиенты ({inbound.settings.clients.length})
                  </div>
                  <div className="space-y-1">
                    {inbound.settings.clients.slice(0, 3).map((client) => (
                      <div key={client.id} className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1">
                        <span className="font-mono">{client.email ?? client.id}</span>
                        <Badge 
                          variant={client.enable ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {client.enable ? "Активен" : "Отключен"}
                        </Badge>
                      </div>
                    ))}
                    {inbound.settings.clients.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        ... и еще {inbound.settings.clients.length - 3} клиентов
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 