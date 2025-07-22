"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, CheckCircle, AlertTriangle, XCircle, Clock, Activity, Globe, Server, Zap } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage";
  uptime: number;
  responseTime: number;
  lastChecked: string;
}

interface ServerStatus {
  location: string;
  country: string;
  flag: string;
  status: "online" | "maintenance" | "offline";
  load: number;
  ping: number;
  uptime: number;
}

export default function StatusPage() {
  const [services] = useState<ServiceStatus[]>([
    { name: "VPN Серверы", status: "operational", uptime: 99.98, responseTime: 45, lastChecked: "2 минуты назад" },
    { name: "Веб-сайт", status: "operational", uptime: 99.99, responseTime: 120, lastChecked: "1 минуту назад" },
    { name: "API", status: "operational", uptime: 99.95, responseTime: 85, lastChecked: "30 секунд назад" },
    { name: "Система авторизации", status: "operational", uptime: 99.97, responseTime: 65, lastChecked: "1 минуту назад" },
    { name: "Панель управления", status: "operational", uptime: 99.94, responseTime: 150, lastChecked: "2 минуты назад" },
    { name: "Поддержка", status: "operational", uptime: 99.92, responseTime: 200, lastChecked: "5 минут назад" },
  ]);

  const [servers] = useState<ServerStatus[]>([
    { location: "Германия", country: "DE", flag: "🇩🇪", status: "online", load: 23, ping: 15, uptime: 99.99 },
    { location: "США (Нью-Йорк)", country: "US", flag: "🇺🇸", status: "online", load: 52, ping: 85, uptime: 99.95 },
    { location: "Нидерланды", country: "NL", flag: "🇳🇱", status: "online", load: 18, ping: 12, uptime: 99.98 },
    { location: "Великобритания", country: "GB", flag: "🇬🇧", status: "online", load: 45, ping: 28, uptime: 99.97 },
    { location: "Сингапур", country: "SG", flag: "🇸🇬", status: "online", load: 42, ping: 180, uptime: 99.94 },
    { location: "Япония", country: "JP", flag: "🇯🇵", status: "maintenance", load: 0, ping: 0, uptime: 99.91 },
    { location: "Франция", country: "FR", flag: "🇫🇷", status: "online", load: 32, ping: 22, uptime: 99.96 },
    { location: "Канада", country: "CA", flag: "🇨🇦", status: "online", load: 29, ping: 98, uptime: 99.93 },
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "degraded":
      case "maintenance":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "outage":
      case "offline":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
      case "online":
        return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
      case "degraded":
      case "maintenance":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "outage":
      case "offline":
        return "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "operational":
      case "online":
        return "Работает";
      case "degraded":
        return "Замедлено";
      case "maintenance":
        return "Обслуживание";
      case "outage":
      case "offline":
        return "Недоступно";
      default:
        return "Неизвестно";
    }
  };

  const overallStatus = services.every(s => s.status === "operational") ? "operational" : 
                       services.some(s => s.status === "outage") ? "outage" : "degraded";

  const incidentHistory = [
    {
      date: "2024-01-15",
      title: "Плановое обслуживание серверов в Азии",
      status: "resolved",
      duration: "2 часа",
      description: "Обновление оборудования на серверах в Сингапуре и Японии",
    },
    {
      date: "2024-01-10",
      title: "Кратковременные проблемы с подключением",
      status: "resolved", 
      duration: "30 минут",
      description: "Проблемы с маршрутизацией трафика, затронули 5% пользователей",
    },
    {
      date: "2024-01-05",
      title: "Замедленная работа API",
      status: "resolved",
      duration: "1 час",
      description: "Повышенная нагрузка на серверы авторизации",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">SafeSurf VPN</span>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                На главную
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Page Title & Overall Status */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Статус системы
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              {getStatusIcon(overallStatus)}
              <span className="text-lg font-medium">
                {overallStatus === "operational" ? "Все системы работают нормально" :
                 overallStatus === "degraded" ? "Некоторые системы работают замедленно" :
                 "Обнаружены проблемы в системе"}
              </span>
            </div>
            <p className="text-muted-foreground">
              Последнее обновление: {currentTime.toLocaleTimeString('ru-RU')} MSK
            </p>
          </div>

          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="services">Сервисы</TabsTrigger>
              <TabsTrigger value="servers">Серверы</TabsTrigger>
              <TabsTrigger value="history">История</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-6">
              {/* Services Status */}
              <div className="grid gap-4">
                {services.map((service, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(service.status)}
                          <h3 className="font-semibold text-foreground">{service.name}</h3>
                        </div>
                        <Badge className={getStatusColor(service.status)}>
                          {getStatusText(service.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-8 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          <span>{service.uptime}% Uptime</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          <span>{service.responseTime}ms</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{service.lastChecked}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">99.97%</div>
                  <div className="text-sm text-muted-foreground">Среднее время работы</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">85ms</div>
                  <div className="text-sm text-muted-foreground">Среднее время отклика</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
                  <div className="text-sm text-muted-foreground">Активные инциденты</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">Мониторинг</div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="servers" className="space-y-6">
              {/* Servers Status */}
              <div className="grid gap-4">
                {servers.map((server, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{server.flag}</span>
                        <div>
                          <h3 className="font-semibold text-foreground">{server.location}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(server.status)}
                            <Badge className={getStatusColor(server.status)}>
                              {getStatusText(server.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8 text-sm">
                        {server.status !== "maintenance" && (
                          <>
                            <div>
                              <div className="text-muted-foreground mb-1">Нагрузка</div>
                              <div className="flex items-center gap-2">
                                <Progress value={server.load} className="w-16 h-2" />
                                <span className="font-medium">{server.load}%</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground mb-1">Пинг</div>
                              <div className="font-medium text-center">{server.ping}ms</div>
                            </div>
                          </>
                        )}
                        <div>
                          <div className="text-muted-foreground mb-1">Uptime</div>
                          <div className="font-medium text-center">{server.uptime}%</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Server Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="p-6 text-center">
                  <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground mb-1">{servers.length}</div>
                  <div className="text-sm text-muted-foreground">Всего серверов</div>
                </Card>
                <Card className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {servers.filter(s => s.status === "online").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Онлайн</div>
                </Card>
                <Card className="p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {servers.filter(s => s.status === "maintenance").length}
                  </div>
                  <div className="text-sm text-muted-foreground">На обслуживании</div>
                </Card>
                <Card className="p-6 text-center">
                  <Server className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {Math.round(servers.filter(s => s.status === "online").reduce((acc, s) => acc + s.load, 0) / servers.filter(s => s.status === "online").length)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Средняя нагрузка</div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              {/* Incident History */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  История инцидентов (последние 30 дней)
                </h2>
                <div className="space-y-4">
                  {incidentHistory.map((incident, index) => (
                    <div key={index} className="border-l-2 border-green-500 pl-4 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">{incident.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className="text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Решено
                          </Badge>
                          <span className="text-sm text-muted-foreground">{incident.duration}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{incident.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(incident.date).toLocaleDateString('ru-RU', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Uptime Graph Placeholder */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  График доступности (последние 90 дней)
                </h2>
                <div className="h-32 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">График доступности (99.97% среднее время работы)</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Subscribe to Updates */}
          <Card className="p-8 mt-12 bg-primary/5 border-primary/20 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Подписаться на обновления статуса
            </h3>
            <p className="text-muted-foreground mb-6">
              Получайте уведомления об инцидентах и плановом обслуживании
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="https://t.me/safesurfvpn" target="_blank" rel="noopener noreferrer">
                  Telegram канал
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Email уведомления</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}