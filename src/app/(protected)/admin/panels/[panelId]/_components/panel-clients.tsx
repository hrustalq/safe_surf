"use client";

import { Users, Clock, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Progress } from "~/components/ui/progress";
import { useState } from "react";
import { api } from "~/trpc/react";
import { TrafficSyncButton } from "./traffic-sync-button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface PanelClientsProps {
  panelId: string;
}

export function PanelClients({ panelId }: PanelClientsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: clients = [], isLoading, error } = api.admin.panels.getPanelClients.useQuery({ id: panelId });

  if (isLoading) {
    return <div className="text-center py-8">Загрузка клиентов...</div>;
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p className="font-medium">Ошибка загрузки клиентов</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Клиенты не найдены</p>
            <p className="text-sm mt-1">На этой панели пока нет клиентов</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter clients based on search and status
  const filteredClients = clients.filter((clientData) => {
    const { client, usage, isOnline } = clientData;
    
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (client.email?.toLowerCase().includes(searchLower) ?? false) ||
      client.id.toLowerCase().includes(searchLower);

    // Status filter
    let matchesStatus = true;
    switch (filterStatus) {
      case "active":
        matchesStatus = client.enable;
        break;
      case "inactive":
        matchesStatus = !client.enable;
        break;
      case "online":
        matchesStatus = isOnline;
        break;
      case "offline":
        matchesStatus = !isOnline;
        break;
      case "expired":
        matchesStatus = usage?.isExpired ?? false;
        break;
      case "depleted":
        matchesStatus = usage?.isDepleted ?? false;
        break;
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h3 className="text-lg font-semibold">Клиенты панели</h3>
          <p className="text-sm text-muted-foreground">
            Найдено {filteredClients.length} из {clients.length} клиентов
          </p>
        </div>
        <TrafficSyncButton panelId={panelId} />
        <div className="flex gap-2">
          <Input
            placeholder="Поиск по email или ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="inactive">Неактивные</SelectItem>
              <SelectItem value="online">Онлайн</SelectItem>
              <SelectItem value="offline">Офлайн</SelectItem>
              <SelectItem value="expired">Истекшие</SelectItem>
              <SelectItem value="depleted">Исчерпанные</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid gap-4">
        {filteredClients.map((clientData) => {
          const { inbound, client, usage, stats, isOnline } = clientData;
          
          return (
            <Card key={client.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      isOnline 
                        ? 'bg-green-100 text-green-700' 
                        : client.enable 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700'
                    }`}>
                      {isOnline ? <Wifi className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {client.email ?? "Без email"}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {client.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOnline && (
                      <Badge variant="default" className="text-xs">
                        <Wifi className="h-2 w-2 mr-1 fill-current" />
                        Онлайн
                      </Badge>
                    )}
                    <Badge 
                      variant={client.enable ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {client.enable ? "Активен" : "Отключен"}
                    </Badge>
                    {usage?.isExpired && (
                      <Badge variant="destructive" className="text-xs">
                        Истек
                      </Badge>
                    )}
                    {usage?.isDepleted && (
                      <Badge variant="destructive" className="text-xs">
                        Исчерпан
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Usage Statistics */}
                {usage && stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Использовано</div>
                      <div className="text-lg font-semibold">
                        {usage.trafficUsedGB} GB
                      </div>
                      <div className="text-xs text-muted-foreground">
                        из {usage.trafficTotalGB || "∞"} GB
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Процент</div>
                      <div className="text-lg font-semibold">
                        {usage.trafficTotalGB > 0 ? `${usage.trafficUsedPercent}%` : "—"}
                      </div>
                      {usage.trafficTotalGB > 0 && (
                        <Progress 
                          value={usage.trafficUsedPercent} 
                          className="h-1 mt-1"
                        />
                      )}
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Исходящий</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {(stats.up / (1024 * 1024 * 1024)).toFixed(2)} GB
                      </div>
                      <div className="text-xs text-muted-foreground">отправлено</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Входящий</div>
                      <div className="text-lg font-semibold text-green-600">
                        {(stats.down / (1024 * 1024 * 1024)).toFixed(2)} GB
                      </div>
                      <div className="text-xs text-muted-foreground">получено</div>
                    </div>
                  </div>
                )}

                {/* Client Details */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-sm font-medium mb-2">Детали клиента</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Inbound:</span>
                      <span className="ml-1 font-medium">
                        {inbound.remark} (#{inbound.id})
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Протокол:</span>
                      <span className="ml-1 font-medium">
                        {inbound.protocol.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Порт:</span>
                      <span className="ml-1 font-medium">
                        {inbound.port}
                      </span>
                    </div>
                  </div>

                  {(client.limitIp > 0 || client.totalGB > 0 || client.expiryTime > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mt-2">
                      {client.limitIp > 0 && (
                        <div>
                          <span className="text-muted-foreground">Лимит IP:</span>
                          <span className="ml-1 font-medium">
                            {client.limitIp}
                          </span>
                        </div>
                      )}
                      {client.totalGB > 0 && (
                        <div>
                          <span className="text-muted-foreground">Лимит трафика:</span>
                          <span className="ml-1 font-medium">
                            {client.totalGB} GB
                          </span>
                        </div>
                      )}
                      {client.expiryTime > 0 && (
                        <div>
                          <span className="text-muted-foreground">Истекает:</span>
                          <span className="ml-1 font-medium">
                            {format(new Date(client.expiryTime), "dd MMM yyyy", { locale: ru })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {client.flow && (
                    <div className="text-xs mt-2">
                      <span className="text-muted-foreground">Flow:</span>
                      <span className="ml-1 font-mono bg-background px-1 py-0.5 rounded">
                        {client.flow}
                      </span>
                    </div>
                  )}
                </div>

                {/* Expiry Warning */}
                {usage && usage.daysUntilExpiry >= 0 && usage.daysUntilExpiry <= 7 && !usage.isExpired && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-800 mb-1">
                      <Clock className="h-4 w-4" />
                      Скоро истечет
                    </div>
                    <div className="text-xs text-amber-700">
                      Остается {usage.daysUntilExpiry} дней до истечения
                    </div>
                  </div>
                )}

                {/* Traffic Warning */}
                {usage && usage.trafficUsedPercent >= 80 && !usage.isDepleted && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-orange-800 mb-1">
                      <WifiOff className="h-4 w-4" />
                      Заканчивается трафик
                    </div>
                    <div className="text-xs text-orange-700">
                      Использовано {usage.trafficUsedPercent}% лимита трафика
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredClients.length === 0 && searchQuery && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p className="font-medium">Клиенты не найдены</p>
              <p className="text-sm mt-1">Попробуйте изменить поисковый запрос или фильтр</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 