import { type Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, Calendar, Clock, User, Share2, CheckCircle, XCircle, Zap } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

export const metadata: Metadata = {
  title: "Сравнение VPN протоколов в 2024 году: VLESS vs VMESS vs WireGuard - SafeSurf VPN",
  description: "Подробный анализ современных VPN протоколов, их преимуществ и недостатков для разных сценариев использования. VLESS, VMESS, WireGuard сравнение.",
  keywords: "VLESS, VMESS, WireGuard, VPN протоколы, сравнение, безопасность, скорость",
};

export default function VpnProtocolsComparisonPage() {
  const protocols = [
    {
      name: "VLESS",
      description: "Современный протокол с минимальными накладными расходами",
      pros: [
        "Максимальная скорость передачи данных",
        "Минимальные накладные расходы",
        "Отличная производительность",
        "Поддержка различных транспортов",
        "Простота настройки"
      ],
      cons: [
        "Относительно новый протокол",
        "Меньше клиентов поддерживают",
        "Требует V2Ray/Xray"
      ],
      useCase: "Идеален для высокоскоростного интернета и стриминга",
      security: "Высокая",
      speed: "Отличная",
      compatibility: "Средняя",
      color: "bg-green-500"
    },
    {
      name: "VMESS",
      description: "Проверенный временем протокол с балансом функций",
      pros: [
        "Широкая поддержка клиентами",
        "Встроенное шифрование",
        "Хорошая обфускация",
        "Стабильная работа",
        "Множество настроек"
      ],
      cons: [
        "Больше накладных расходов чем VLESS",
        "Сложнее в настройке",
        "Может быть медленнее"
      ],
      useCase: "Универсальный выбор для большинства задач",
      security: "Отличная",
      speed: "Хорошая",
      compatibility: "Отличная",
      color: "bg-blue-500"
    },
    {
      name: "WireGuard",
      description: "Современный протокол с фокусом на простоту",
      pros: [
        "Очень быстрый",
        "Простая настройка",
        "Минимальный код",
        "Встроен в ядро Linux",
        "Низкое энергопотребление"
      ],
      cons: [
        "Сохраняет IP адреса",
        "Менее анонимный",
        "Проще для обнаружения",
        "Статические ключи"
      ],
      useCase: "Лучший для скорости, но хуже для приватности",
      security: "Хорошая",
      speed: "Отличная",
      compatibility: "Хорошая",
      color: "bg-orange-500"
    }
  ];

  const comparisonTable = [
    { feature: "Скорость", vless: "Отличная", vmess: "Хорошая", wireguard: "Отличная" },
    { feature: "Безопасность", vless: "Высокая", vmess: "Отличная", wireguard: "Хорошая" },
    { feature: "Приватность", vless: "Отличная", vmess: "Отличная", wireguard: "Средняя" },
    { feature: "Обход блокировок", vless: "Отличный", vmess: "Отличный", wireguard: "Средний" },
    { feature: "Поддержка клиентами", vless: "Средняя", vmess: "Отличная", wireguard: "Хорошая" },
    { feature: "Простота настройки", vless: "Хорошая", vmess: "Сложная", wireguard: "Отличная" },
    { feature: "Энергопотребление", vless: "Среднее", vmess: "Среднее", wireguard: "Низкое" },
  ];

  const recommendations = [
    {
      scenario: "Максимальная скорость",
      protocol: "VLESS",
      reason: "Минимальные накладные расходы обеспечивают лучшую производительность"
    },
    {
      scenario: "Максимальная анонимность",
      protocol: "VMESS",
      reason: "Лучшая обфускация трафика и отсутствие сохранения IP адресов"
    },
    {
      scenario: "Простота использования",
      protocol: "WireGuard",
      reason: "Самая простая настройка и встроенная поддержка во многих ОС"
    },
    {
      scenario: "Обход блокировок",
      protocol: "VLESS/VMESS",
      reason: "Лучшие возможности маскировки трафика под обычный HTTPS"
    },
    {
      scenario: "Мобильные устройства",
      protocol: "WireGuard",
      reason: "Низкое энергопотребление продлевает время работы батареи"
    }
  ];

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Отличная":
      case "Отличный":
        return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
      case "Хорошая":
      case "Хороший":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400";
      case "Средняя":
      case "Средний":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "Низкая":
      case "Сложная":
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
              <Badge variant="secondary">Технологии</Badge>
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                Рекомендуем
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-6">
              Сравнение VPN протоколов в 2024 году: VLESS vs VMESS vs WireGuard
            </h1>
            <div className="flex items-center gap-6 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Алексей Петров</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>20 января 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>8 минут чтения</span>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Подробный анализ современных VPN протоколов, их преимуществ и недостатков 
              для разных сценариев использования. Поможем выбрать лучший протокол для ваших задач.
            </p>
          </header>

          {/* Introduction */}
          <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
            <p className="text-foreground leading-relaxed">
              В мире VPN существует множество протоколов, каждый из которых имеет свои особенности. 
              В этой статье мы рассмотрим три современных протокола: VLESS, VMESS и WireGuard, 
              проанализируем их сильные и слабые стороны, чтобы помочь вам сделать правильный выбор.
            </p>
          </Card>

          {/* Protocol Cards */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Обзор протоколов</h2>
            <div className="grid gap-8">
              {protocols.map((protocol, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-4 h-4 rounded-full ${protocol.color}`}></div>
                    <h3 className="text-xl font-semibold text-foreground">{protocol.name}</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">{protocol.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Преимущества
                      </h4>
                      <ul className="space-y-2">
                        {protocol.pros.map((pro, proIndex) => (
                          <li key={proIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        Недостатки
                      </h4>
                      <ul className="space-y-2">
                        {protocol.cons.map((con, conIndex) => (
                          <li key={conIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-red-600 mt-1">•</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Безопасность</div>
                      <Badge className={getRatingColor(protocol.security)}>{protocol.security}</Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Скорость</div>
                      <Badge className={getRatingColor(protocol.speed)}>{protocol.speed}</Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Совместимость</div>
                      <Badge className={getRatingColor(protocol.compatibility)}>{protocol.compatibility}</Badge>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium text-foreground mb-1">Лучше всего для:</div>
                    <div className="text-sm text-muted-foreground">{protocol.useCase}</div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Comparison Table */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Детальное сравнение</h2>
            <Card className="p-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-semibold text-foreground">Характеристика</th>
                    <th className="text-center py-3 font-semibold text-foreground">VLESS</th>
                    <th className="text-center py-3 font-semibold text-foreground">VMESS</th>
                    <th className="text-center py-3 font-semibold text-foreground">WireGuard</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonTable.map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 font-medium text-foreground">{row.feature}</td>
                      <td className="py-3 text-center">
                        <Badge className={getRatingColor(row.vless)}>{row.vless}</Badge>
                      </td>
                      <td className="py-3 text-center">
                        <Badge className={getRatingColor(row.vmess)}>{row.vmess}</Badge>
                      </td>
                      <td className="py-3 text-center">
                        <Badge className={getRatingColor(row.wireguard)}>{row.wireguard}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>

          {/* Recommendations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Рекомендации по выбору</h2>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        {rec.scenario} → <span className="text-primary">{rec.protocol}</span>
                      </h3>
                      <p className="text-muted-foreground">{rec.reason}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* SafeSurf Implementation */}
          <Card className="p-6 mb-12 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              SafeSurf VPN и протоколы
            </h2>
            <p className="text-muted-foreground mb-4">
              В SafeSurf VPN мы поддерживаем как VLESS, так и VMESS протоколы, автоматически 
              выбирая оптимальный для ваших условий. Наши серверы оптимизированы для работы 
              с обоими протоколами, обеспечивая максимальную скорость и надёжность.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/download">Попробовать сейчас</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/docs">Настройки протоколов</Link>
              </Button>
            </div>
          </Card>

          {/* Conclusion */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Заключение</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Выбор VPN протокола зависит от ваших конкретных потребностей. VLESS отлично 
                подходит для высокоскоростных подключений, VMESS обеспечивает лучший баланс 
                безопасности и функциональности, а WireGuard идеален для мобильных устройств.
              </p>
              <p className="mb-4">
                Не существует &quot;лучшего&quot; протокола — есть наиболее подходящий для конкретной 
                задачи. Экспериментируйте с разными протоколами и выбирайте тот, который 
                лучше всего работает в ваших условиях.
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
                <Link href="/contact">Задать вопрос</Link>
              </Button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}