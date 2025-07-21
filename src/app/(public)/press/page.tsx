import { type Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, Download, FileText, Users, Award, ImageIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

export const metadata: Metadata = {
  title: "Пресс-центр - SafeSurf VPN",
  description: "Пресс-кит SafeSurf VPN для журналистов и блогеров. Логотипы, фотографии, пресс-релизы и контакты для СМИ.",
  keywords: "пресс-кит, медиа, журналисты, пресс-релизы, логотипы, SafeSurf VPN",
};

export default function PressPage() {
  const pressReleases = [
    {
      date: "2024-01-20",
      title: "SafeSurf VPN запускает новые серверы в 5 странах Европы",
      excerpt: "Расширение сети для улучшения скорости и доступности сервиса в Европейском регионе",
      downloadUrl: "/press/releases/2024-01-20-eu-expansion.pdf",
    },
    {
      date: "2024-01-15", 
      title: "SafeSurf VPN достигает отметки в 1 миллион пользователей",
      excerpt: "Компания празднует важную веху и объявляет о планах дальнейшего развития",
      downloadUrl: "/press/releases/2024-01-15-1m-users.pdf",
    },
    {
      date: "2024-01-01",
      title: "Независимый аудит подтверждает политику No-Logs SafeSurf VPN",
      excerpt: "Третья сторона подтвердила соблюдение строгой политики конфиденциальности",
      downloadUrl: "/press/releases/2024-01-01-audit-report.pdf",
    },
  ];

  const mediaAssets = [
    {
      category: "Логотипы",
      items: [
        { name: "Основной логотип (PNG)", size: "2048x2048", url: "/press/logos/safesurf-logo.png" },
        { name: "Логотип горизонтальный (PNG)", size: "1920x560", url: "/press/logos/safesurf-horizontal.png" },
        { name: "Логотип вертикальный (PNG)", size: "560x1920", url: "/press/logos/safesurf-vertical.png" },
        { name: "Иконка (PNG)", size: "512x512", url: "/press/logos/safesurf-icon.png" },
        { name: "Векторные логотипы (SVG)", size: "Векторный", url: "/press/logos/safesurf-logos.zip" },
      ],
    },
    {
      category: "Скриншоты приложений",
      items: [
        { name: "Windows приложение", size: "1920x1080", url: "/press/screenshots/windows-app.png" },
        { name: "macOS приложение", size: "1920x1200", url: "/press/screenshots/macos-app.png" },
        { name: "Android приложение", size: "1080x1920", url: "/press/screenshots/android-app.png" },
        { name: "iOS приложение", size: "1170x2532", url: "/press/screenshots/ios-app.png" },
        { name: "Веб-панель", size: "1920x1080", url: "/press/screenshots/web-dashboard.png" },
      ],
    },
    {
      category: "Фотографии команды",
      items: [
        { name: "CEO - Александр Петров", size: "1200x1200", url: "/press/team/ceo-photo.jpg" },
        { name: "CTO - Мария Иванова", size: "1200x1200", url: "/press/team/cto-photo.jpg" },
        { name: "Команда в офисе", size: "1920x1280", url: "/press/team/office-team.jpg" },
        { name: "Командная фотография", size: "1920x1080", url: "/press/team/team-group.jpg" },
      ],
    },
  ];

  const companyFacts = [
    { label: "Основана", value: "2020" },
    { label: "Штаб-квартира", value: "Эстония, Таллин" },
    { label: "Активных пользователей", value: "1+ миллион" },
    { label: "Серверов по миру", value: "50+" },
    { label: "Стран покрытия", value: "25+" },
    { label: "Сотрудников", value: "45" },
    { label: "Поддерживаемые устройства", value: "Windows, macOS, Linux, iOS, Android" },
    { label: "Протоколы", value: "VLESS, VMESS, WireGuard" },
  ];

  const awards = [
    {
      year: "2024",
      title: "Лучший VPN для стриминга",
      organization: "TechReview Russia",
    },
    {
      year: "2023", 
      title: "Выбор редакции - Приватность",
      organization: "CyberSec Magazine",
    },
    {
      year: "2023",
      title: "Лучший новый VPN сервис",
      organization: "Privacy Awards",
    },
  ];

  const keyMetrics = [
    { metric: "99.97%", description: "Время работы серверов" },
    { metric: "50ms", description: "Средняя задержка" },
    { metric: "No-Logs", description: "Политика приватности" },
    { metric: "AES-256", description: "Шифрование" },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              Пресс-центр
            </h1>
            <p className="text-lg text-muted-foreground">
              Медиа-ресурсы, пресс-релизы и информация о компании для журналистов и блогеров
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {keyMetrics.map((item, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{item.metric}</div>
                <div className="text-sm text-muted-foreground">{item.description}</div>
              </Card>
            ))}
          </div>

          {/* Company Overview */}
          <Card className="p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">О компании</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  SafeSurf VPN — премиальный VPN сервис, основанный в 2020 году с миссией защиты 
                  приватности пользователей в интернете. Компания использует современные протоколы 
                  VLESS и VMESS для обеспечения максимальной скорости и безопасности.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Строгая политика No-Logs, подтверждённая независимыми аудитами, и глобальная 
                  сеть из 50+ серверов в 25+ странах делают SafeSurf VPN выбором для более чем 
                  миллиона пользователей по всему миру.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {companyFacts.map((fact, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">{fact.label}:</span>
                    <span className="font-medium text-foreground">{fact.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Awards & Recognition */}
          <Card className="p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Награды и признание
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {awards.map((award, index) => (
                <div key={index} className="text-center p-4 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-2">{award.year}</div>
                  <h3 className="font-semibold text-foreground mb-2">{award.title}</h3>
                  <p className="text-sm text-muted-foreground">{award.organization}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Press Releases */}
          <Card className="p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Пресс-релизы
            </h2>
            <div className="space-y-6">
              {pressReleases.map((release, index) => (
                <div key={index}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary">{formatDate(release.date)}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {release.title}
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        {release.excerpt}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={release.downloadUrl} download>
                        <Download className="h-4 w-4 mr-2" />
                        Скачать
                      </a>
                    </Button>
                  </div>
                  {index < pressReleases.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
          </Card>

          {/* Media Assets */}
          <Card className="p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <ImageIcon className="h-6 w-6 text-primary" />
              Медиа-ресурсы
            </h2>
            <div className="space-y-8">
              {mediaAssets.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {category.category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.items.map((item, itemIndex) => (
                      <div 
                        key={itemIndex} 
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-foreground text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.size}</div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={item.url} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                  {categoryIndex < mediaAssets.length - 1 && <Separator className="mt-8" />}
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                💡 Все материалы доступны для свободного использования в редакционных целях 
                с обязательным указанием источника &quot;SafeSurf VPN&quot;
              </p>
            </div>
          </Card>

          {/* Media Contact */}
          <Card className="p-8 bg-primary/5 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Контакты для прессы
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Общие вопросы</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> press@safesurf.tech</p>
                  <p><strong>Время ответа:</strong> в течение 24 часов</p>
                  <p><strong>Языки:</strong> Русский, Английский</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-3">Руководство</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>CEO Александр Петров:</strong> ceo@safesurf.tech</p>
                  <p><strong>Интервью и комментарии</strong></p>
                  <p><strong>Предварительная запись</strong></p>
                </div>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-3">Запрос интервью или комментария</h3>
              <p className="text-muted-foreground mb-4">
                Готовы ответить на вопросы о VPN индустрии, приватности в интернете и трендах кибербезопасности
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <a href="mailto:press@safesurf.tech?subject=Запрос интервью">
                    Запросить интервью
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/contact">Другие контакты</Link>
                </Button>
              </div>
            </div>
          </Card>

          {/* Usage Guidelines */}
          <Card className="p-6 mt-8">
            <h3 className="font-semibold text-foreground mb-4">Условия использования материалов</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">✅ Разрешено</h4>
                <ul className="space-y-1">
                  <li>• Использование в новостных статьях</li>
                  <li>• Обзоры и тестирования</li>
                  <li>• Образовательный контент</li>
                  <li>• Упоминание в исследованиях</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">❌ Запрещено</h4>
                <ul className="space-y-1">
                  <li>• Коммерческое использование без разрешения</li>
                  <li>• Изменение логотипов и брендинга</li>
                  <li>• Использование в рекламе конкурентов</li>
                  <li>• Создание производных работ</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}