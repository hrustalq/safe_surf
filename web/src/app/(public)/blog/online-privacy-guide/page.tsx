import { type Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, Calendar, Clock, User, Share2, Eye, Lock, AlertTriangle, CheckCircle, Smartphone, Monitor } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";

export const metadata: Metadata = {
  title: "Полное руководство по защите приватности в интернете - SafeSurf VPN",
  description: "Практические советы по защите личных данных онлайн: от выбора VPN до безопасного браузинга. Комплексный гид по цифровой приватности.",
  keywords: "приватность, безопасность, анонимность, защита данных, VPN, браузер, пароли",
};

export default function OnlinePrivacyGuidePage() {
  const privacyLevels = [
    {
      level: "Базовый",
      description: "Основные меры защиты для обычных пользователей",
      color: "bg-green-500",
      steps: [
        "Используйте VPN для всех подключений",
        "Включите двухфакторную аутентификацию",
        "Используйте менеджер паролей",
        "Обновляйте программы и ОС",
        "Проверьте настройки приватности в соцсетях"
      ]
    },
    {
      level: "Продвинутый",
      description: "Дополнительные меры для повышенной защиты",
      color: "bg-orange-500",
      steps: [
        "Используйте Tor браузер для чувствительных задач",
        "Настройте DNS фильтрацию",
        "Отключите телеметрию в ОС",
        "Используйте зашифрованные мессенджеры",
        "Регулярно очищайте цифровые следы"
      ]
    },
    {
      level: "Экспертный",
      description: "Максимальная защита для особо чувствительных данных",
      color: "bg-red-500",
      steps: [
        "Используйте операционную систему Tails",
        "Настройте собственный DNS сервер",
        "Используйте только открытые мессенджеры",
        "Применяйте дополнительное шифрование файлов",
        "Изолируйте устройства по задачам"
      ]
    }
  ];

  const browserTips = [
    {
      browser: "Firefox",
      icon: "🦊",
      tips: [
        "Установите uBlock Origin и Privacy Badger",
        "Включите Strict tracking protection",
        "Отключите телеметрию в about:config",
        "Используйте контейнеры для изоляции",
        "Настройте DNS over HTTPS"
      ]
    },
    {
      browser: "Chrome/Chromium",
      icon: "🌐",
      tips: [
        "Установите uBlock Origin",
        "Отключите синхронизацию с Google",
        "Используйте гостевой режим",
        "Включите Enhanced Safe Browsing",
        "Регулярно очищайте данные"
      ]
    },
    {
      browser: "Safari",
      icon: "🧭",
      tips: [
        "Включите Prevent cross-site tracking",
        "Отключите предложения Siri",
        "Используйте Hide IP Address",
        "Включите блокировку рекламы",
        "Настройте приватные релеи"
      ]
    }
  ];

  const passwordSecurity = [
    {
      issue: "Слабые пароли",
      solution: "Используйте пароли длиной 12+ символов с цифрами, буквами и символами",
      priority: "Критично"
    },
    {
      issue: "Повторное использование",
      solution: "Уникальный пароль для каждого аккаунта с помощью менеджера паролей",
      priority: "Критично"
    },
    {
      issue: "Отсутствие 2FA",
      solution: "Включите двухфакторную аутентификацию везде, где возможно",
      priority: "Высокий"
    },
    {
      issue: "Хранение в браузере",
      solution: "Используйте специализированный менеджер паролей",
      priority: "Средний"
    }
  ];

  const commonThreats = [
    {
      threat: "Отслеживание рекламодателями",
      description: "Сбор данных о ваших интересах и поведении в интернете",
      protection: "Блокировщики рекламы, VPN, приватный браузинг"
    },
    {
      threat: "Слежка провайдера",
      description: "Мониторинг посещаемых сайтов интернет-провайдером",
      protection: "VPN с шифрованием DNS, Tor браузер"
    },
    {
      threat: "Утечки данных",
      description: "Компрометация личной информации из-за взломов сервисов",
      protection: "Уникальные пароли, 2FA, минимизация данных"
    },
    {
      threat: "Фишинг и социальная инженерия",
      description: "Обман с целью получения доступа к аккаунтам",
      protection: "Осторожность, проверка ссылок, обучение"
    }
  ];

  const toolsRecommendations = [
    {
      category: "VPN сервисы",
      tools: [
        { name: "SafeSurf VPN", description: "Наш сервис с политикой No-Logs", recommended: true },
        { name: "Tor Browser", description: "Для максимальной анонимности", recommended: true }
      ]
    },
    {
      category: "Менеджеры паролей",
      tools: [
        { name: "Bitwarden", description: "Открытый и безопасный", recommended: true },
        { name: "1Password", description: "Удобный интерфейс", recommended: false },
        { name: "KeePassXC", description: "Локальное хранение", recommended: true }
      ]
    },
    {
      category: "Мессенджеры",
      tools: [
        { name: "Signal", description: "Золотой стандарт приватности", recommended: true },
        { name: "Element", description: "Децентрализованный Matrix", recommended: true },
        { name: "Telegram", description: "Только секретные чаты", recommended: false }
      ]
    },
    {
      category: "Email",
      tools: [
        { name: "ProtonMail", description: "End-to-end шифрование", recommended: true },
        { name: "Tutanota", description: "Германская юрисдикция", recommended: true },
        { name: "Temp-Mail", description: "Для временных нужд", recommended: false }
      ]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Критично":
        return "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400";
      case "Высокий":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400";
      case "Средний":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400";
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
              <Badge variant="secondary">Безопасность</Badge>
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                Рекомендуем
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-6">
              Полное руководство по защите приватности в интернете
            </h1>
            <div className="flex items-center gap-6 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Мария Иванова</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>15 января 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>12 минут чтения</span>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Практические советы по защите личных данных онлайн: от выбора VPN до безопасного браузинга. 
              Узнайте, как защитить свою приватность в цифровую эпоху.
            </p>
          </header>

          {/* Privacy Alert */}
          <Alert className="mb-8 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Важно:</strong> Каждый день ваши личные данные собираются десятками компаний. 
              Эта статья поможет взять контроль над вашей цифровой приватностью.
            </AlertDescription>
          </Alert>

          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Почему приватность важна?</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p className="mb-4">
                В современном мире каждый клик, каждый поиск, каждое сообщение может быть отслежено, 
                записано и проанализировано. Компании строят подробные профили пользователей, 
                правительства усиливают цифровое наблюдение, а киберпреступники постоянно ищут 
                способы украсть личную информацию.
              </p>
              <p className="mb-4">
                Защита приватности — это не параноя, а необходимость. Это право на личную жизнь 
                в цифровую эпоху. В этом руководстве мы расскажем, как эффективно защитить себя.
              </p>
            </div>
          </section>

          {/* Privacy Levels */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Уровни защиты приватности</h2>
            <div className="grid gap-6">
              {privacyLevels.map((level, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-4 h-4 rounded-full ${level.color}`}></div>
                    <h3 className="text-xl font-semibold text-foreground">{level.level} уровень</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">{level.description}</p>
                  <ul className="space-y-2">
                    {level.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </section>

          {/* Common Threats */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Основные угрозы приватности</h2>
            <div className="space-y-4">
              {commonThreats.map((threat, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <Eye className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">{threat.threat}</h3>
                      <p className="text-muted-foreground mb-3">{threat.description}</p>
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="text-sm font-medium text-foreground mb-1">Защита:</div>
                        <div className="text-sm text-muted-foreground">{threat.protection}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Password Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              Безопасность паролей
            </h2>
            <div className="space-y-4 mb-6">
              {passwordSecurity.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{item.issue}</h3>
                      <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                    </div>
                    <p className="text-muted-foreground">{item.solution}</p>
                  </div>
                </div>
              ))}
            </div>
            <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-foreground mb-3">💡 Совет по паролям</h3>
              <p className="text-muted-foreground">
                Используйте парольные фразы вместо сложных паролей. Например, 
                &quot;КотЛюбитРыбу2024!&quot; легче запомнить, чем &quot;K7$mX9#p&quot;, но он столь же безопасен.
              </p>
            </Card>
          </section>

          {/* Browser Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Monitor className="h-6 w-6 text-primary" />
              Безопасный браузинг
            </h2>
            <div className="grid gap-6">
              {browserTips.map((browser, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{browser.icon}</span>
                    <h3 className="text-lg font-semibold text-foreground">{browser.browser}</h3>
                  </div>
                  <ul className="space-y-2">
                    {browser.tips.map((tip, tipIndex) => (
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

          {/* Tools Recommendations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Рекомендованные инструменты</h2>
            <div className="grid gap-6">
              {toolsRecommendations.map((category, index) => (
                <Card key={index} className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">{category.category}</h3>
                  <div className="space-y-3">
                    {category.tools.map((tool, toolIndex) => (
                      <div key={toolIndex} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{tool.name}</span>
                            {tool.recommended && (
                              <Badge className="text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                                Рекомендуем
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Mobile Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Smartphone className="h-6 w-6 text-primary" />
              Безопасность мобильных устройств
            </h2>
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">iOS</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Включите Tracking Protection</li>
                    <li>• Отключите персонализированную рекламу</li>
                    <li>• Используйте Hide My Email</li>
                    <li>• Включите блокировщик рекламы в Safari</li>
                    <li>• Регулярно проверяйте разрешения приложений</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Android</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Отключите Google Ad Personalization</li>
                    <li>• Используйте F-Droid для приложений</li>
                    <li>• Включите VPN Always-On</li>
                    <li>• Установите приватный DNS</li>
                    <li>• Регулярно очищайте данные активности</li>
                  </ul>
                </div>
              </div>
            </Card>
          </section>

          {/* SafeSurf Integration */}
          <Card className="p-6 mb-12 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Как SafeSurf VPN защищает вашу приватность
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Строгая политика No-Logs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Военное шифрование AES-256
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  DNS защита от отслеживания
                </li>
              </ul>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Kill Switch защита
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Независимые аудиты безопасности
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Защита от утечек IP/DNS
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/auth/signup">Начать защиту</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/no-logs">Политика No-Logs</Link>
              </Button>
            </div>
          </Card>

          {/* Conclusion */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Заключение</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Защита приватности в интернете — это не однократное действие, а постоянный процесс. 
                Начните с базовых мер: установите VPN, используйте менеджер паролей, включите 2FA. 
                Затем постепенно внедряйте более продвинутые техники.
              </p>
              <p className="mb-4">
                Помните: абсолютной приватности не существует, но правильные инструменты и привычки 
                могут значительно повысить вашу безопасность. Каждый шаг к большей приватности — 
                это шаг к большей свободе в цифровом мире.
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
                <Link href="/help">FAQ по безопасности</Link>
              </Button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}