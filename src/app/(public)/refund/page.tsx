import { type Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export const metadata: Metadata = {
  title: "Политика возврата средств - SafeSurf VPN",
  description: "30-дневная гарантия возврата средств SafeSurf VPN. Узнайте условия возврата и как получить возмещение.",
  keywords: "возврат средств, гарантия возврата денег, возмещение, VPN гарантия",
};

export default function RefundPolicy() {
  const guaranteeFeatures = [
    "30 дней на тестирование сервиса",
    "Полный возврат без вопросов",
    "Автоматическая обработка в течение 5 рабочих дней",
    "Возврат на тот же способ оплаты",
    "Возврат для всех тарифных планов",
  ];

  const eligibleScenarios = [
    {
      title: "Технические проблемы",
      description: "Сервис не работает на вашем устройстве или в вашем регионе",
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Неудовлетворительная скорость",
      description: "Значительное снижение скорости интернета при подключении",
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Несовместимость",
      description: "VPN не совместим с необходимыми вам сервисами",
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Простое желание",
      description: "Сервис не подошёл по любым причинам (в течение 30 дней)",
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400"
    }
  ];

  const ineligibleScenarios = [
    {
      title: "Нарушение условий",
      description: "Использование VPN для запрещённой деятельности",
      icon: XCircle,
      color: "text-red-600 dark:text-red-400"
    },
    {
      title: "Превышение срока",
      description: "Прошло более 30 дней с момента покупки",
      icon: XCircle,
      color: "text-red-600 dark:text-red-400"
    },
    {
      title: "Злоупотребление",
      description: "Многократные запросы возврата от одного пользователя",
      icon: XCircle,
      color: "text-red-600 dark:text-red-400"
    }
  ];

  const refundProcess = [
    {
      step: 1,
      title: "Отправьте запрос",
      description: "Напишите нам на refunds@safesurf.tech или через форму поддержки"
    },
    {
      step: 2,
      title: "Подтверждение",
      description: "Мы подтвердим получение запроса в течение 24 часов"
    },
    {
      step: 3,
      title: "Обработка",
      description: "Возврат будет обработан в течение 5 рабочих дней"
    },
    {
      step: 4,
      title: "Получение средств",
      description: "Деньги поступят на ваш счёт в зависимости от способа оплаты"
    }
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
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Политика возврата средств
            </h1>
            <p className="text-lg text-muted-foreground">
              30-дневная гарантия возврата денег — без вопросов и сложностей
            </p>
          </div>

          {/* 30-Day Guarantee */}
          <Card className="p-8 mb-12 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-6">
                <CreditCard className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                30-дневная гарантия возврата денег
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Мы настолько уверены в качестве SafeSurf VPN, что даём вам целый месяц на тестирование. 
                Если сервис вам не подойдёт по любой причине — мы вернём деньги полностью.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {guaranteeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* When You Can Get Refund */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                Когда доступен возврат
              </h3>
              <div className="space-y-4">
                {eligibleScenarios.map((scenario, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <scenario.icon className={`h-5 w-5 ${scenario.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{scenario.title}</h4>
                      <p className="text-muted-foreground text-xs">{scenario.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                Когда возврат недоступен
              </h3>
              <div className="space-y-4">
                {ineligibleScenarios.map((scenario, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <scenario.icon className={`h-5 w-5 ${scenario.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{scenario.title}</h4>
                      <p className="text-muted-foreground text-xs">{scenario.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Refund Process */}
          <Card className="p-8 mb-8">
            <h3 className="text-2xl font-semibold text-foreground mb-8 text-center">
              Как получить возврат средств
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {refundProcess.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                    <span className="font-bold text-primary">{item.step}</span>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Processing Times */}
          <Card className="p-6 mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Сроки обработки возврата
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Банковские карты</h4>
                <p className="text-muted-foreground">3-5 рабочих дней</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">PayPal</h4>
                <p className="text-muted-foreground">1-2 рабочих дня</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Криптовалюты</h4>
                <p className="text-muted-foreground">В течение 24 часов</p>
              </div>
            </div>
          </Card>

          {/* Contact for Refund */}
          <Card className="p-8 bg-primary/5 border-primary/20">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Нужен возврат средств?
              </h3>
              <p className="text-muted-foreground mb-6">
                Свяжитесь с нами любым удобным способом — мы обработаем ваш запрос быстро и без лишних вопросов.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <a href="mailto:refunds@safesurf.tech">
                    <CreditCard className="h-4 w-4 mr-2" />
                    refunds@safesurf.tech
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/contact">Форма поддержки</Link>
                </Button>
              </div>
            </div>
          </Card>

          {/* Bottom Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button variant="outline" asChild>
              <Link href="/terms">Условия использования</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pricing">Посмотреть тарифы</Link>
            </Button>
            <Button asChild>
              <Link href="/#pricing">Попробовать сейчас</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 