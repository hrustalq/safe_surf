"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { 
  Shield, 
  CheckCircle, 
  Download, 
  Smartphone, 
  ArrowRight,
  Copy,
  ExternalLink,
  Clock,
  Zap,
  Globe,
  Link as LinkIcon,
  Info
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { api } from "~/trpc/react";

export default function OnboardingPage() {
  const router = useRouter();
  const { status } = useSession();
  const [copied, setCopied] = useState(false);
  
  // Use tRPC to fetch subscription URL
  const { 
    data: urlData, 
    isLoading: loadingUrl 
  } = api.subscription.getSubscriptionUrl.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  // Also get subscription data for status display
  const { 
    data: subscriptionData, 
    isLoading: loadingSubscription, 
    refetch: refetchSubscriptionData 
  } = api.subscription.getFullSubscriptionData.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const loading = loadingUrl || loadingSubscription;

  // Redirect if unauthenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl">SafeSurf VPN</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Добро пожаловать в SafeSurf!
          </h1>
          <p className="text-muted-foreground text-lg">
            Ваша 7-дневная пробная версия активирована
          </p>
        </div>

        {/* Success Alert */}
        <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Поздравляем!</strong> Ваша пробная подписка на 7 дней успешно активирована. 
            Вы получили доступ к 2 одновременным подключениям и 5 ГБ трафика.
          </AlertDescription>
        </Alert>

        {/* Trial Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold">7 дней бесплатно</p>
                <p className="text-sm text-muted-foreground">Полный доступ</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Zap className="h-8 w-8 text-orange-600" />
              <div>
                <p className="font-semibold">2 устройства</p>
                <p className="text-sm text-muted-foreground">Одновременно</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Globe className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold">5 ГБ трафика</p>
                <p className="text-sm text-muted-foreground">На весь период</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Настройка подключения
            </CardTitle>
            <CardDescription>
              Выберите удобный способ подключения к VPN серверу
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(urlData || (subscriptionData?.configUrls && subscriptionData.configUrls.length > 0)) ? (
              <div className="space-y-6">
                {/* Subscription URL - Recommended */}
                {urlData && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5 text-green-600" />
                      <label className="text-sm font-medium">Ссылка на подписку (рекомендуется):</label>
                      <Badge variant="secondary" className="text-xs">Авто-обновление</Badge>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg font-mono text-sm break-all">
                        {urlData.subscriptionUrl}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(urlData.subscriptionUrl)}
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Рекомендуется:</strong> Используйте эту ссылку для автоматического получения всех серверов. 
                        Новые серверы будут появляться автоматически.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Individual Configs - Alternative */}
                {subscriptionData?.configUrls && subscriptionData.configUrls.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <Download className="h-5 w-5 text-blue-600" />
                      <label className="text-sm font-medium">Отдельные конфигурации:</label>
                      <Badge variant="outline" className="text-xs">Ручное добавление</Badge>
                    </div>
                    
                    <div className="grid gap-3">
                      {subscriptionData.configUrls.map((config, index) => {
                        const getConfigName = (cfg: typeof config, idx: number) => {
                          if (cfg.name) {
                            const parts = cfg.name.split(' - ');
                            const location = parts[1] ?? parts[0] ?? `Server ${idx + 1}`;
                            return `${location} (${cfg.protocol})`;
                          }
                          return `${cfg.protocol} ${idx + 1}`;
                        };

                        return (
                          <div key={index} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{config.protocol}</Badge>
                                <span className="text-sm font-medium">{getConfigName(config, index)}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(config.url)}
                              >
                                {copied ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            
                            {/* QR Code */}
                            {subscriptionData.qrCodes?.[index] && (
                              <div className="flex justify-center">
                                <Image 
                                  src={subscriptionData.qrCodes[index].qrCode} 
                                  alt={`QR код для ${config.protocol}`}
                                  className="border rounded-lg"
                                  width={160}
                                  height={160}
                                />
                              </div>
                            )}
                            
                            {/* Config URL */}
                            <div className="p-2 bg-muted rounded font-mono text-xs break-all">
                              {config.url}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="grid md:grid-cols-2 gap-4">
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
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Конфигурации подключения настраиваются...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Это может занять несколько минут. Ваша пробная подписка уже активирована!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => void refetchSubscriptionData()}
                    >
                      Проверить еще раз
                    </Button>
                    <Button 
                      onClick={goToDashboard}
                    >
                      Перейти в панель управления
                    </Button>
                  </div>
                  <Alert>
                    <AlertDescription>
                      <strong>Совет:</strong> Конфигурации также будут доступны в панели управления. 
                      Если они не появляются в течение 10 минут, попробуйте обновить конфигурации в панели.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Start Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Быстрый старт
            </CardTitle>
            <CardDescription>
              Инструкции по подключению к VPN
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">📱 Мобильное приложение</h4>
                <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                  <li>Скачайте V2rayNG (Android) или Shadowrocket (iOS)</li>
                  <li>Отсканируйте QR-код выше</li>
                  <li>Или скопируйте URL конфигурации</li>
                  <li>Нажмите &quot;Подключить&quot;</li>
                </ol>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">💻 Компьютер</h4>
                <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                  <li>Скачайте v2rayN (Windows) или V2rayU (macOS)</li>
                  <li>Импортируйте конфигурацию по URL</li>
                  <li>Выберите сервер из списка</li>
                  <li>Включите VPN подключение</li>
                </ol>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Нужна помощь?</strong> Посетите нашу страницу{" "}
                <Link href="/help" className="text-primary hover:underline inline-flex items-center gap-1">
                  поддержки <ExternalLink className="h-3 w-3" />
                </Link>
                {" "}для подробных инструкций.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={goToDashboard} className="flex items-center gap-2">
            Перейти в панель управления
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" asChild>
            <Link href="/help">
              Нужна помощь?
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 