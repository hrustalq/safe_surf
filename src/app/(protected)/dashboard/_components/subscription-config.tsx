"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { 
  Copy, 
  Download, 
  QrCode, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import Image from "next/image";
import { api } from "~/trpc/react";





function ConfigSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-muted animate-pulse rounded" />
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-48 bg-muted animate-pulse rounded" />
          <div className="h-12 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SubscriptionConfig() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use tRPC to fetch subscription data
  const { 
    data, 
    isLoading: loading, 
    error, 
    refetch: fetchSubscriptionData 
  } = api.subscription.getFullSubscriptionData.useQuery();

  // Mutation to refresh configs from 3x-ui
  const refreshConfigsMutation = api.subscription.refreshSubscriptionConfigs.useMutation({
    onSuccess: (result) => {
      console.log('Configs refreshed:', result);
      void fetchSubscriptionData(); // Refetch data after successful refresh
      setIsRefreshing(false);
    },
    onError: (error) => {
      console.error('Failed to refresh configs:', error);
      setIsRefreshing(false);
    },
  });

  const handleRefreshConfigs = () => {
    setIsRefreshing(true);
    refreshConfigsMutation.mutate();
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (copyError) {
      console.error("Failed to copy:", copyError);
    }
  };

  const downloadConfig = (configUrl: string, filename: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(configUrl));
    element.setAttribute('download', `${filename}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return <ConfigSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Ошибка загрузки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || "Произошла ошибка при загрузке данных"}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={handleRefreshConfigs} 
            variant="outline" 
            className="mt-4"
            disabled={loading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Обновление...' : 'Повторить попытку'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data?.subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Конфигурация VPN
          </CardTitle>
          <CardDescription>
            У вас нет активной подписки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Для получения доступа к VPN конфигурациям необходима активная подписка.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { subscription, configUrls, qrCodes } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Конфигурация VPN
        </CardTitle>
        <CardDescription>
          Настройки подключения для вашей подписки
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Subscription Status */}
        <div className="flex items-center justify-between mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={subscription.status === "ACTIVE" ? "default" : "secondary"}>
                {subscription.plan.nameRu}
              </Badge>
              {subscription.status === "ACTIVE" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Clock className="h-4 w-4 text-orange-600" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Осталось дней: {subscription.daysRemaining} | 
              Устройств: {subscription.plan.maxDevices} | 
              Трафик: {subscription.traffic.usedGB.toFixed(2)} / {subscription.traffic.limitGB ? subscription.traffic.limitGB.toFixed(0) : '∞'} ГБ
            </p>
          </div>
          <Button 
            onClick={handleRefreshConfigs}
            variant="outline"
            size="sm"
            disabled={loading || isRefreshing}
            title={isRefreshing ? 'Обновление конфигураций...' : 'Обновить конфигурации'}
          >
            <RefreshCw className={`h-4 w-4 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Configuration Options */}
        {configUrls.length > 0 ? (
          <div className="space-y-6">
            {/* Subscription URL - Primary Option */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-600" />
                <label className="text-sm font-medium">Ссылка на подписку (рекомендуется):</label>
                <Badge variant="secondary" className="text-xs">Авто-обновление</Badge>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg font-mono text-sm break-all">
                  {typeof window !== 'undefined' && subscription.uuid ? `${window.location.origin}/api/sub/${subscription.uuid}` : 'Загрузка...'}
                </div>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (typeof window !== 'undefined' && subscription.uuid) {
                      void copyToClipboard(`${window.location.origin}/api/sub/${subscription.uuid}`, -1);
                    }
                  }}
                >
                  {copiedIndex === -1 ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Рекомендуется:</strong> Используйте эту ссылку для автоматического получения всех серверов. 
                  Новые серверы будут появляться автоматически без необходимости обновлять конфигурацию.
                </AlertDescription>
              </Alert>
            </div>

            {/* Individual Configs - Alternative */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-600" />
                <label className="text-sm font-medium">Отдельные конфигурации:</label>
                <Badge variant="outline" className="text-xs">Ручное добавление</Badge>
              </div>
              
              <Tabs defaultValue={`config-0`}>
                <div className="w-full overflow-x-auto">
                  <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-w-full">
                    {configUrls.map((config, index) => {
                      // Create shorter, more readable tab labels
                      const getTabLabel = (cfg: typeof config, idx: number) => {
                        if (cfg.name) {
                          // Extract server location from name (e.g., "Freedom VPN - Frankfurt" -> "Frankfurt")
                          const parts = cfg.name.split(' - ');
                          const location = parts[1] ?? parts[0] ?? `Server ${idx + 1}`;
                          return `${location} (${cfg.protocol})`;
                        }
                        return `${cfg.protocol} ${idx + 1}`;
                      };
                      
                      return (
                        <TabsTrigger 
                          key={`trigger-${index}`} 
                          value={`config-${index}`}
                          className="whitespace-nowrap px-3 py-1.5 text-sm font-medium"
                        >
                          {getTabLabel(config, index)}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>

                {configUrls.map((config, index) => (
                  <TabsContent key={`content-${index}`} value={`config-${index}`}>
                    <div className="space-y-6">
                      {/* Server Info */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Badge variant="outline">{config.name}</Badge>
                          <p className="text-sm text-muted-foreground">
                            Протокол: {config.protocol}
                          </p>
                        </div>
                        <Badge variant="secondary">{config.protocol}</Badge>
                      </div>

                      {/* QR Code */}
                      {qrCodes[index] && (
                        <div className="flex flex-col items-center space-y-3">
                          <div className="p-4 bg-white rounded-lg border">
                            <Image 	
                              src={qrCodes[index].qrCode} 
                              alt={`QR код для ${config.protocol}`}
                              className="block"
                              width={200}
                              height={200}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground text-center">
                            <QrCode className="h-4 w-4 inline mr-1" />
                            Отсканируйте QR-код в вашем VPN приложении
                          </p>
                        </div>
                      )}

                      {/* Config URL */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">URL конфигурации:</label>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(config.url, index)}
                            >
                              {copiedIndex === index ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadConfig(config.url, `${config.name}-${config.protocol}`)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                          {config.url}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Конфигурации VPN пока недоступны. Это может произойти если:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Серверы ещё настраиваются</li>
                <li>Возникла временная проблема с подключением</li>
                <li>Ваша подписка находится в процессе активации</li>
              </ul>
              <Button 
                onClick={handleRefreshConfigs} 
                variant="outline" 
                size="sm" 
                className="mt-4"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Обновление...' : 'Обновить'}
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
} 