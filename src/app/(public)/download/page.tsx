import { type Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, Smartphone, Monitor, Download, ExternalLink, CheckCircle, QrCode } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";

export const metadata: Metadata = {
  title: "Скачать SafeSurf VPN - Приложения для всех устройств",
  description: "Скачайте SafeSurf VPN для Windows, macOS, Linux, iOS, Android. Простая настройка, быстрое подключение, максимальная безопасность.",
  keywords: "скачать VPN, приложения VPN, Windows, macOS, Android, iOS, Linux",
};

export default function DownloadPage() {
  const apps = [
    {
      platform: "Windows",
      icon: Monitor,
      description: "Для Windows 10/11",
      version: "v2.1.0",
      size: "45 MB",
      downloads: [
        { type: "Установщик", url: "#", format: ".exe" },
        { type: "Portable", url: "#", format: ".zip" },
      ],
    },
    {
      platform: "macOS",
      icon: Monitor,
      description: "Для macOS 11+",
      version: "v2.1.0",
      size: "38 MB",
      downloads: [
        { type: "DMG файл", url: "#", format: ".dmg" },
        { type: "App Store", url: "#", format: "Store" },
      ],
    },
    {
      platform: "Android",
      icon: Smartphone,
      description: "Для Android 7+",
      version: "v2.1.2",
      size: "25 MB",
      downloads: [
        { type: "Google Play", url: "#", format: "Store" },
        { type: "APK файл", url: "#", format: ".apk" },
      ],
    },
    {
      platform: "iOS",
      icon: Smartphone,
      description: "Для iOS 13+",
      version: "v2.1.1",
      size: "32 MB",
      downloads: [
        { type: "App Store", url: "#", format: "Store" },
      ],
    },
    {
      platform: "Linux",
      icon: Monitor,
      description: "Ubuntu/Debian",
      version: "v2.1.0",
      size: "42 MB",
      downloads: [
        { type: "DEB пакет", url: "#", format: ".deb" },
        { type: "AppImage", url: "#", format: ".AppImage" },
      ],
    },
  ];

  const features = [
    "Автоматическое переподключение",
    "Kill Switch защита",
    "Обход блокировок",
    "Быстрые серверы",
    "Без логов",
    "24/7 поддержка",
  ];

  const manualSetup = [
    {
      protocol: "VLESS",
      description: "Современный протокол для максимальной скорости",
      guides: [
        { client: "V2Ray", url: "/docs/v2ray-setup" },
        { client: "Xray", url: "/docs/xray-setup" },
        { client: "Clash", url: "/docs/clash-setup" },
      ],
    },
    {
      protocol: "VMESS",
      description: "Надёжный протокол с высокой безопасностью",
      guides: [
        { client: "V2rayN", url: "/docs/v2rayn-setup" },
        { client: "Clash", url: "/docs/clash-vmess" },
        { client: "Shadowrocket", url: "/docs/shadowrocket-setup" },
      ],
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
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Скачать SafeSurf VPN
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Защитите все свои устройства с помощью наших приложений
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          <Tabs defaultValue="apps" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="apps">Официальные приложения</TabsTrigger>
              <TabsTrigger value="manual">Ручная настройка</TabsTrigger>
            </TabsList>
            
            <TabsContent value="apps" className="space-y-6">
              {/* Apps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apps.map((app, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <app.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{app.platform}</h3>
                        <p className="text-sm text-muted-foreground">{app.description}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-4 text-sm text-muted-foreground">
                      <span>Версия: {app.version}</span>
                      <span>Размер: {app.size}</span>
                    </div>

                    <div className="space-y-2">
                      {app.downloads.map((download, downloadIndex) => (
                        <Button
                          key={downloadIndex}
                          variant={downloadIndex === 0 ? "default" : "outline"}
                          className="w-full justify-between"
                          asChild
                        >
                          <a href={download.url}>
                            <span className="flex items-center gap-2">
                              <Download className="h-4 w-4" />
                              {download.type}
                            </span>
                            <span className="text-xs opacity-75">{download.format}</span>
                          </a>
                        </Button>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>

              {/* System Requirements */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Системные требования</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Windows</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Windows 10/11</li>
                      <li>• 2 ГБ RAM</li>
                      <li>• 100 МБ свободного места</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">macOS</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• macOS 11.0+</li>
                      <li>• Intel или Apple Silicon</li>
                      <li>• 150 МБ свободного места</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Мобильные</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Android 7.0+ / iOS 13.0+</li>
                      <li>• 1 ГБ RAM</li>
                      <li>• 50 МБ свободного места</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="manual" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Ручная настройка протоколов
                </h2>
                <p className="text-muted-foreground">
                  Для продвинутых пользователей и сторонних клиентов
                </p>
              </div>

              {/* Manual Setup */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {manualSetup.map((setup, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <QrCode className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{setup.protocol}</h3>
                        <p className="text-sm text-muted-foreground">{setup.description}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {setup.guides.map((guide, guideIndex) => (
                        <Button
                          key={guideIndex}
                          variant="outline"
                          className="w-full justify-between"
                          asChild
                        >
                          <Link href={guide.url}>
                            <span>{guide.client}</span>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Configuration Help */}
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-semibold text-foreground mb-2">
                  Нужна помощь с настройкой?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Наша команда поддержки поможет вам настроить VPN на любом устройстве
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild>
                    <Link href="/contact">Связаться с поддержкой</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/docs">Документация</Link>
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Bottom CTA */}
          <Card className="p-8 mt-12 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Готовы начать?
            </h3>
            <p className="text-muted-foreground mb-6">
              Создайте аккаунт и получите доступ к нашим серверам по всему миру
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Создать аккаунт</Link>
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