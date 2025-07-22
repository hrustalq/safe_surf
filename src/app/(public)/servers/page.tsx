import { type Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, MapPin, Activity, Users, Zap, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";

export const metadata: Metadata = {
  title: "Серверы SafeSurf VPN - Глобальная сеть высокоскоростных серверов",
  description: "50+ серверов SafeSurf VPN в 25+ странах. Выберите оптимальное местоположение для максимальной скорости и безопасности.",
  keywords: "VPN серверы, местоположения, страны, скорость, пинг, нагрузка",
};

export default function ServersPage() {
  const regions = [
    {
      name: "Европа",
      servers: [
        { country: "Германия", city: "Франкфурт", flag: "🇩🇪", load: 23, ping: 15, users: 1247 },
        { country: "Нидерланды", city: "Амстердам", flag: "🇳🇱", load: 18, ping: 12, users: 892 },
        { country: "Великобритания", city: "Лондон", flag: "🇬🇧", load: 45, ping: 28, users: 2156 },
        { country: "Франция", city: "Париж", flag: "🇫🇷", load: 32, ping: 22, users: 1534 },
        { country: "Швейцария", city: "Цюрих", flag: "🇨🇭", load: 15, ping: 18, users: 743 },
        { country: "Швеция", city: "Стокгольм", flag: "🇸🇪", load: 28, ping: 25, users: 967 },
        { country: "Италия", city: "Милан", flag: "🇮🇹", load: 38, ping: 35, users: 1234 },
      ],
    },
    {
      name: "Северная Америка",
      servers: [
        { country: "США", city: "Нью-Йорк", flag: "🇺🇸", load: 52, ping: 85, users: 3245 },
        { country: "США", city: "Лос-Анджелес", flag: "🇺🇸", load: 48, ping: 120, users: 2987 },
        { country: "США", city: "Чикаго", flag: "🇺🇸", load: 35, ping: 95, users: 1876 },
        { country: "Канада", city: "Торонто", flag: "🇨🇦", load: 29, ping: 98, users: 1453 },
      ],
    },
    {
      name: "Азиатско-Тихоокеанский регион",
      servers: [
        { country: "Сингапур", city: "Сингапур", flag: "🇸🇬", load: 42, ping: 180, users: 2134 },
        { country: "Япония", city: "Токио", flag: "🇯🇵", load: 36, ping: 165, users: 1789 },
        { country: "Гонконг", city: "Гонконг", flag: "🇭🇰", load: 55, ping: 175, users: 2456 },
        { country: "Австралия", city: "Сидней", flag: "🇦🇺", load: 24, ping: 250, users: 987 },
      ],
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "10 Гбит/с",
      description: "Высокоскоростные каналы",
    },
    {
      icon: Shield,
      title: "AES-256",
      description: "Military-grade шифрование",
    },
    {
      icon: Activity,
      title: "99.9%",
      description: "Время работы серверов",
    },
    {
      icon: Users,
      title: "10K+",
      description: "Одновременных подключений",
    },
  ];

  // const getLoadColor = (load: number) => {
  //   if (load < 30) return "bg-green-500";
  //   if (load < 60) return "bg-yellow-500";
  //   return "bg-red-500";
  // };

  const getLoadText = (load: number) => {
    if (load < 30) return "Низкая";
    if (load < 60) return "Средняя";
    return "Высокая";
  };

  const getPingColor = (ping: number) => {
    if (ping < 50) return "text-green-600";
    if (ping < 100) return "text-yellow-600";
    return "text-red-600";
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
              Наши серверы по всему миру
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              50+ серверов в 25+ странах для максимальной скорости и надёжности
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="p-4 text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{feature.title}</div>
                  <div className="text-sm text-muted-foreground">{feature.description}</div>
                </Card>
              ))}
            </div>
          </div>

          {/* Servers by Region */}
          <div className="space-y-8">
            {regions.map((region, regionIndex) => (
              <div key={regionIndex}>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-primary" />
                  {region.name}
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {region.servers.map((server, serverIndex) => (
                    <Card key={serverIndex} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{server.flag}</span>
                          <div>
                            <h3 className="font-semibold text-foreground">{server.country}</h3>
                            <p className="text-sm text-muted-foreground">{server.city}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Онлайн
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {/* Load */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Нагрузка</span>
                          <span className="font-medium">{getLoadText(server.load)}</span>
                        </div>
                        <Progress value={server.load} className="h-2" />

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Пинг:</span>
                            <span className={`font-medium ${getPingColor(server.ping)}`}>
                              {server.ping}мс
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Пользователи:</span>
                            <span className="font-medium">{server.users.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Statistics */}
          <Card className="p-8 mt-12 bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Глобальная статистика сети
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">50+</div>
                  <div className="text-muted-foreground">Серверов</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">25+</div>
                  <div className="text-muted-foreground">Стран</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">1M+</div>
                  <div className="text-muted-foreground">Пользователей</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">500TB</div>
                  <div className="text-muted-foreground">Данных в месяц</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-3">
                Как выбрать сервер?
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Выбирайте ближайший сервер для лучшей скорости</li>
                <li>• Проверяйте нагрузку сервера (зелёная - лучше)</li>
                <li>• Для стриминга выбирайте серверы в нужной стране</li>
                <li>• Для торрентов используйте P2P-разрешённые серверы</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-3">
                Автоматический выбор
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Наши приложения автоматически выберут лучший сервер для вас 
                на основе скорости, нагрузки и расстояния.
              </p>
              <Button variant="outline" asChild>
                <Link href="/download">Скачать приложение</Link>
              </Button>
            </Card>
          </div>

          {/* CTA */}
          <Card className="p-8 mt-12 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Попробуйте наши серверы
            </h3>
            <p className="text-muted-foreground mb-6">
              30-дневная гарантия возврата денег. Подключайтесь к любому серверу без ограничений.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Начать бесплатно</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/#pricing">Посмотреть тарифы</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}