"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Search, Book, Monitor, Smartphone, Router, Code, ExternalLink, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: "setup",
      title: "Быстрая настройка",
      icon: Monitor,
      color: "bg-blue-500",
      guides: [
        { title: "Установка на Windows", difficulty: "Начальный", time: "5 мин", url: "/docs/windows-setup" },
        { title: "Установка на macOS", difficulty: "Начальный", time: "5 мин", url: "/docs/macos-setup" },
        { title: "Установка на Android", difficulty: "Начальный", time: "3 мин", url: "/docs/android-setup" },
        { title: "Установка на iOS", difficulty: "Начальный", time: "3 мин", url: "/docs/ios-setup" },
      ],
    },
    {
      id: "protocols",
      title: "Протоколы и клиенты",
      icon: Code,
      color: "bg-green-500",
      guides: [
        { title: "Настройка VLESS в V2Ray", difficulty: "Продвинутый", time: "15 мин", url: "/docs/vless-v2ray" },
        { title: "Настройка VMESS в V2RayN", difficulty: "Средний", time: "10 мин", url: "/docs/vmess-v2rayn" },
        { title: "Clash для Windows/macOS", difficulty: "Средний", time: "12 мин", url: "/docs/clash-setup" },
        { title: "Shadowrocket для iOS", difficulty: "Средний", time: "8 мин", url: "/docs/shadowrocket" },
        { title: "V2RayNG для Android", difficulty: "Средний", time: "8 мин", url: "/docs/v2rayng" },
      ],
    },
    {
      id: "router",
      title: "Роутеры и устройства",
      icon: Router,
      color: "bg-purple-500",
      guides: [
        { title: "Настройка на OpenWrt", difficulty: "Экспертный", time: "30 мин", url: "/docs/openwrt" },
        { title: "Mikrotik RouterOS", difficulty: "Экспертный", time: "25 мин", url: "/docs/mikrotik" },
        { title: "ASUS роутеры", difficulty: "Продвинутый", time: "20 мин", url: "/docs/asus-router" },
        { title: "Настройка на Raspberry Pi", difficulty: "Экспертный", time: "45 мин", url: "/docs/raspberry-pi" },
      ],
    },
    {
      id: "troubleshooting",
      title: "Решение проблем",
      icon: Book,
      color: "bg-orange-500",
      guides: [
        { title: "VPN не подключается", difficulty: "Начальный", time: "5 мин", url: "/docs/connection-issues" },
        { title: "Медленная скорость", difficulty: "Средний", time: "10 мин", url: "/docs/speed-issues" },
        { title: "Проблемы с DNS", difficulty: "Продвинутый", time: "15 мин", url: "/docs/dns-issues" },
        { title: "Обход блокировок", difficulty: "Продвинутый", time: "20 мин", url: "/docs/bypass-blocks" },
      ],
    },
  ];

  const popularGuides = [
    { title: "Первые шаги с SafeSurf VPN", category: "Начинающим", url: "/docs/getting-started" },
    { title: "Выбор лучшего сервера", category: "Оптимизация", url: "/docs/server-selection" },
    { title: "Настройка Kill Switch", category: "Безопасность", url: "/docs/kill-switch" },
    { title: "VPN для игр", category: "Развлечения", url: "/docs/gaming" },
    { title: "Стриминг с VPN", category: "Развлечения", url: "/docs/streaming" },
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    guides: category.guides.filter(
      guide =>
        guide.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.guides.length > 0);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Начальный": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "Средний": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "Продвинутый": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "Экспертный": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

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
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Документация
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Подробные инструкции по настройке и использованию SafeSurf VPN
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск в документации..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">Все инструкции</TabsTrigger>
              <TabsTrigger value="popular">Популярные</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-8">
              {/* Categories */}
              {(searchQuery ? filteredCategories : categories).map((category, categoryIndex) => (
                <Card key={categoryIndex} className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 ${category.color} rounded-lg`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{category.title}</h2>
                      <p className="text-sm text-muted-foreground">{category.guides.length} инструкций</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.guides.map((guide, guideIndex) => (
                      <Link
                        key={guideIndex}
                        href={guide.url}
                        className="block p-4 rounded-lg border hover:border-primary/50 transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {guide.title}
                          </h3>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getDifficultyColor(guide.difficulty)}>
                            {guide.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{guide.time}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              ))}

              {searchQuery && filteredCategories.length === 0 && (
                <Card className="p-8 text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Ничего не найдено
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Попробуйте изменить поисковый запрос
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Показать все инструкции
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="popular" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Популярные инструкции
                </h2>
                <div className="space-y-4">
                  {popularGuides.map((guide, index) => (
                    <Link
                      key={index}
                      href={guide.url}
                      className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors group"
                    >
                      <div>
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {guide.title}
                        </h3>
                        <Badge variant="secondary" className="mt-1">
                          {guide.category}
                        </Badge>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              </Card>

              {/* Quick Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Monitor className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold text-foreground">Для новичков</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Никогда не пользовались VPN? Начните с базовых инструкций.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/docs/getting-started">Руководство для новичков</Link>
                  </Button>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Code className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold text-foreground">Для продвинутых</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Настройка протоколов и клиентов для опытных пользователей.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/docs/advanced-setup">Продвинутая настройка</Link>
                  </Button>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Help Section */}
          <Card className="p-8 mt-12 bg-primary/5 border-primary/20">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Нужна дополнительная помощь?
              </h3>
              <p className="text-muted-foreground mb-6">
                Не нашли нужную инструкцию или столкнулись с проблемой?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/contact">
                    Связаться с поддержкой
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/help">
                    FAQ
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://t.me/safesurfvpn" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Telegram сообщество
                  </a>
                </Button>
              </div>
            </div>
          </Card>

          {/* API Documentation */}
          <Card className="p-6 mt-8">
            <div className="flex items-center gap-3 mb-4">
              <Code className="h-6 w-6 text-primary" />
              <h3 className="font-semibold text-foreground">API Документация</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Интегрируйте SafeSurf VPN в свои приложения с помощью нашего API.
            </p>
            <Button variant="outline" asChild>
              <Link href="/docs/api">
                <ExternalLink className="h-4 w-4 mr-2" />
                Открыть API документацию
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}