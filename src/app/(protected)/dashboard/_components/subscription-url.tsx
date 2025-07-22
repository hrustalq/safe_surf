"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { 
  Copy, 
  Link, 
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Info
} from "lucide-react";
import { api } from "~/trpc/react";

function SubscriptionUrlSkeleton() {
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
          <div className="h-12 bg-muted animate-pulse rounded" />
          <div className="h-20 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SubscriptionUrl() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get subscription URL
  const { 
    data: urlData, 
    isLoading: loadingUrl, 
    error: urlError,
    refetch: refetchUrl 
  } = api.subscription.getSubscriptionUrl.useQuery();

  // Get subscription data for status info and individual configs
  const { 
    data: subscriptionData,
    isLoading: loadingSubscription,
    error: subscriptionError,
    refetch: refetchSubscriptionData
  } = api.subscription.getFullSubscriptionData.useQuery();

  const isLoading = loadingUrl || loadingSubscription;
  const error = urlError ?? subscriptionError;

  // Mutation to refresh configs from 3x-ui
  const refreshConfigsMutation = api.subscription.refreshSubscriptionConfigs.useMutation({
    onSuccess: () => {
      void refetchUrl();
      void refetchSubscriptionData();
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

  const copyToClipboard = async (text: string, index = -1) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (copyError) {
      console.error("Failed to copy:", copyError);
    }
  };

  const downloadSubscription = (url: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', 'safesurf-subscription.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return <SubscriptionUrlSkeleton />;
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
        </CardContent>
      </Card>
    );
  }

  if (!urlData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Ссылка на подписку
          </CardTitle>
          <CardDescription>
            У вас нет активной подписки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Для получения ссылки на подписку необходима активная подписка.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const subscription = subscriptionData?.subscription;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Ссылка на подписку
        </CardTitle>
        <CardDescription>
          Универсальная ссылка для всех VPN-клиентов
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Subscription Status */}
        {subscription && (
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
              disabled={isRefreshing}
              title="Обновить конфигурации"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}

        {/* Subscription URL */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Ссылка на подписку:</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Use actual domain if urlData contains placeholder
                    const actualUrl = urlData.subscriptionUrl.includes('yourdomain.com') 
                      ? `${window.location.origin}/api/sub/${urlData.uuid}`
                      : urlData.subscriptionUrl;
                    void copyToClipboard(actualUrl, -1);
                  }}
                >
                  {copiedIndex === -1 ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const actualUrl = urlData.subscriptionUrl.includes('yourdomain.com') 
                      ? `${window.location.origin}/api/sub/${urlData.uuid}`
                      : urlData.subscriptionUrl;
                    downloadSubscription(actualUrl);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
              {urlData.subscriptionUrl.includes('yourdomain.com') 
                ? `${window.location.origin}/api/sub/${urlData.uuid}`
                : urlData.subscriptionUrl}
            </div>
          </div>

          {/* Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p>
                  <strong>Как использовать:</strong> Скопируйте эту ссылку в ваше VPN приложение 
                  для автоматического получения всех конфигураций.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">📱 Мобильные приложения:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• V2rayNG (Android) - Import → &quot;From URL&quot;</li>
                      <li>• Shadowrocket (iOS) - Добавить → &quot;Subscribe&quot;</li>
                      <li>• V2Box (iOS/macOS) - Subscribe → &quot;Add&quot;</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">💻 Настольные приложения:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• v2rayN (Windows) - Servers → &quot;Add&quot;</li>
                      <li>• V2rayU (macOS) - Import → &quot;From URL&quot;</li>
                      <li>• Qv2ray (Linux) - Group → &quot;Subscribe&quot;</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Автообновление:</strong> Большинство клиентов могут автоматически 
                    обновлять конфигурации по этой ссылке. Новые серверы и изменения будут 
                    появляться автоматически.
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}