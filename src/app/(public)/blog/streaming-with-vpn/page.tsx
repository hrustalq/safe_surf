import { type Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, Calendar, Clock, User, Share2, Play, CheckCircle, XCircle, Globe, Zap } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";

export const metadata: Metadata = {
  title: "Как смотреть стриминговые сервисы с VPN без блокировок - SafeSurf VPN",
  description: "Секреты обхода гео-блокировок Netflix, YouTube и других популярных стриминговых платформ. Полное руководство по стримингу с VPN.",
  keywords: "стриминг, Netflix, VPN, гео-блокировка, обход блокировок, YouTube, видео",
};

export default function StreamingWithVpnPage() {
  const streamingServices = [
    {
      name: "Netflix",
      icon: "🎬",
      difficulty: "Сложно",
      tips: [
        "Используйте серверы в США или Великобритании",
        "Очищайте cookies и кеш браузера",
        "Пробуйте разные серверы при блокировке",
        "Используйте приватное окно браузера"
      ],
      availability: "Частично работает",
      color: "bg-red-500"
    },
    {
      name: "YouTube",
      icon: "📺",
      difficulty: "Легко",
      tips: [
        "Подключайтесь к любому зарубежному серверу",
        "Меняйте локацию в настройках YouTube",
        "Используйте мобильное приложение",
        "Очищайте историю просмотров"
      ],
      availability: "Отлично работает",
      color: "bg-green-500"
    },
    {
      name: "Amazon Prime",
      icon: "📦",
      difficulty: "Средне",
      tips: [
        "Выбирайте серверы в стране регистрации аккаунта",
        "Отключайте GPS на мобильных устройствах",
        "Используйте браузер вместо приложения",
        "Проверяйте время и часовой пояс"
      ],
      availability: "Хорошо работает",
      color: "bg-blue-500"
    },
    {
      name: "Disney+",
      icon: "🏰",
      difficulty: "Сложно",
      tips: [
        "Используйте только серверы поддерживаемых стран",
        "Перезапускайте приложение после смены VPN",
        "Создавайте новые профили при проблемах",
        "Используйте VPN на роутере"
      ],
      availability: "Частично работает",
      color: "bg-purple-500"
    },
    {
      name: "Twitch",
      icon: "🎮",
      difficulty: "Легко",
      tips: [
        "Любые серверы работают отлично",
        "Улучшает качество стрима",
        "Снижает задержку",
        "Защищает от DDoS атак"
      ],
      availability: "Отлично работает",
      color: "bg-indigo-500"
    },
    {
      name: "BBC iPlayer",
      icon: "🇬🇧",
      difficulty: "Средне",
      tips: [
        "Только серверы в Великобритании",
        "Требуется почтовый индекс UK",
        "Используйте Chrome в приватном режиме",
        "Отключайте WebRTC"
      ],
      availability: "Работает с настройкой",
      color: "bg-orange-500"
    }
  ];

  const commonProblems = [
    {
      problem: "Обнаружение VPN",
      symptoms: "Сообщение 'Обнаружен прокси или VPN'",
      solutions: [
        "Попробуйте другой сервер в той же стране",
        "Очистите cookies и кеш браузера",
        "Используйте режим инкогнито",
        "Перезапустите VPN подключение"
      ]
    },
    {
      problem: "Медленная загрузка",
      symptoms: "Видео буферизуется или плохое качество",
      solutions: [
        "Выберите ближайший сервер",
        "Проверьте нагрузку сервера",
        "Смените протокол VPN",
        "Закройте другие приложения"
      ]
    },
    {
      problem: "Ошибки региона",
      symptoms: "Контент недоступен в вашем регионе",
      solutions: [
        "Убедитесь в выборе правильной страны",
        "Проверьте настройки языка в аккаунте",
        "Используйте VPN на уровне роутера",
        "Создайте новый аккаунт с VPN"
      ]
    }
  ];

  const bestPractices = [
    {
      title: "Выбор правильного сервера",
      description: "Как найти оптимальный сервер для стриминга",
      tips: [
        "Выбирайте серверы с низкой нагрузкой (менее 50%)",
        "Приоритет серверам с высокой скоростью",
        "Учитывайте физическое расстояние до сервера",
        "Тестируйте разные серверы в одной стране"
      ]
    },
    {
      title: "Оптимизация браузера",
      description: "Настройка браузера для лучшего стриминга",
      tips: [
        "Используйте режим инкогнито для новых сессий",
        "Отключите расширения, блокирующие JavaScript",
        "Включите аппаратное ускорение",
        "Очищайте кеш перед просмотром"
      ]
    },
    {
      title: "Управление аккаунтами",
      description: "Как правильно использовать аккаунты с VPN",
      tips: [
        "Не меняйте страну слишком часто",
        "Используйте способы оплаты из целевой страны",
        "Поддерживайте постоянный IP для важных аккаунтов",
        "Создавайте отдельные профили для разных регионов"
      ]
    }
  ];

  const qualitySettings = [
    {
      speed: "10+ Мбит/с",
      quality: "4K Ultra HD",
      recommendation: "Используйте ближайшие серверы"
    },
    {
      speed: "5-10 Мбит/с",
      quality: "Full HD (1080p)",
      recommendation: "Оптимально для большинства случаев"
    },
    {
      speed: "2-5 Мбит/с",
      quality: "HD (720p)",
      recommendation: "Подходит для мобильных устройств"
    },
    {
      speed: "1-2 Мбит/с",
      quality: "SD (480p)",
      recommendation: "Минимум для комфортного просмотра"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Легко":
        return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
      case "Средне":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "Сложно":
        return "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400";
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
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                К блогу
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <article className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Инструкции</Badge>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-6">
              Как смотреть стриминговые сервисы с VPN без блокировок
            </h1>
            <div className="flex items-center gap-6 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Дмитрий Сидоров</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>12 января 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>6 минут чтения</span>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Секреты обхода гео-блокировок Netflix, YouTube и других популярных стриминговых платформ. 
              Узнайте, как получить доступ к контенту из любой точки мира.
            </p>
          </header>

          {/* Legal Notice */}
          <Alert className="mb-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Важно:</strong> Используйте VPN для стриминга в соответствии с условиями использования 
              сервисов и местным законодательством. Эта статья носит образовательный характер.
            </AlertDescription>
          </Alert>

          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Зачем нужен VPN для стриминга?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Обход гео-блокировок
                </h3>
                <p className="text-muted-foreground">
                  Получите доступ к контенту, недоступному в вашем регионе. 
                  Смотрите библиотеки Netflix других стран, региональные YouTube каналы.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Улучшение скорости
                </h3>
                <p className="text-muted-foreground">
                  Обход троттлинга провайдера, который может замедлять стриминговые сервисы. 
                  Иногда VPN может даже ускорить подключение.
                </p>
              </Card>
            </div>
          </section>

          {/* Streaming Services */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Play className="h-6 w-6 text-primary" />
              Популярные стриминговые сервисы
            </h2>
            <div className="grid gap-6">
              {streamingServices.map((service, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{service.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getDifficultyColor(service.difficulty)}>
                            {service.difficulty}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{service.availability}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-foreground mb-3">Советы для {service.name}:</h4>
                  <ul className="space-y-2">
                    {service.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </section>

          {/* Common Problems */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Решение типичных проблем</h2>
            <div className="space-y-6">
              {commonProblems.map((item, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">{item.problem}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        <strong>Симптомы:</strong> {item.symptoms}
                      </p>
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Решения:</h4>
                        <ul className="space-y-1">
                          {item.solutions.map((solution, solutionIndex) => (
                            <li key={solutionIndex} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{solution}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Best Practices */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Лучшие практики</h2>
            <div className="grid gap-6">
              {bestPractices.map((practice, index) => (
                <Card key={index} className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{practice.title}</h3>
                  <p className="text-muted-foreground mb-4">{practice.description}</p>
                  <ul className="space-y-2">
                    {practice.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </section>

          {/* Quality Settings */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Скорость и качество видео</h2>
            <Card className="p-6">
              <p className="text-muted-foreground mb-6">
                Для комфортного стриминга важно правильно подобрать качество видео к скорости VPN подключения:
              </p>
              <div className="space-y-4">
                {qualitySettings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="font-medium text-foreground">{setting.quality}</div>
                      <div className="text-sm text-muted-foreground">Требуется: {setting.speed}</div>
                    </div>
                    <div className="text-sm text-muted-foreground text-right">
                      {setting.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* SafeSurf for Streaming */}
          <Card className="p-6 mb-12 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              SafeSurf VPN для стриминга
            </h2>
            <p className="text-muted-foreground mb-4">
              Наши серверы оптимизированы для стриминга с высокой скоростью и низкой задержкой. 
              Специальные серверы для популярных сервисов обеспечивают стабильный доступ к контенту.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  10 Гбит/с серверы для 4K стриминга
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Серверы в 25+ странах
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Автоматический выбор лучшего сервера
                </li>
              </ul>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Smart DNS для умных TV
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Безлимитная пропускная способность
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Поддержка всех устройств
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/auth/signup">Попробовать для стриминга</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/servers">Посмотреть серверы</Link>
              </Button>
            </div>
          </Card>

          {/* Advanced Tips */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Продвинутые советы</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Для мобильных устройств</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Отключите GPS при использовании VPN</li>
                  <li>• Используйте приложения вместо браузера</li>
                  <li>• Подключайтесь к VPN перед запуском приложения</li>
                  <li>• Выбирайте серверы с низким пингом</li>
                </ul>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Для Smart TV</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Настройте VPN на роутере</li>
                  <li>• Используйте Smart DNS функции</li>
                  <li>• Создайте отдельную сеть для TV</li>
                  <li>• Перезагружайте TV после смены локации</li>
                </ul>
              </Card>
            </div>
          </section>

          {/* Conclusion */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Заключение</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Стриминг с VPN открывает доступ к огромному количеству контента со всего мира. 
                Главное — выбрать качественный VPN сервис, правильно настроить подключение и 
                следовать рекомендациям для конкретных платформ.
              </p>
              <p className="mb-4">
                Помните: не все VPN одинаково хорошо работают со стриминговыми сервисами. 
                Выбирайте провайдеров с быстрыми серверами и опытом работы с популярными платформами.
              </p>
            </div>
          </section>

          {/* Share and Navigation */}
          <Separator className="my-8" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Поделиться:</span>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/blog">← К блогу</Link>
              </Button>
              <Button asChild>
                <Link href="/download">Скачать SafeSurf</Link>
              </Button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}