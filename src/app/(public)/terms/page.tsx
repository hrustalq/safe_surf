import { type Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export const metadata: Metadata = {
  title: "Условия использования - SafeSurf VPN",
  description: "Ознакомьтесь с условиями использования SafeSurf VPN. Права и обязанности пользователей, правила использования сервиса.",
  keywords: "условия использования, пользовательское соглашение, правила VPN, лицензия",
};

export default function TermsOfService() {
  const sections = [
    {
      title: "1. Принятие условий",
      content: `Используя SafeSurf VPN, вы автоматически соглашаетесь с данными условиями использования. Если вы не согласны с какими-либо условиями, пожалуйста, прекратите использование нашего сервиса.

Мы можем обновлять эти условия время от времени. О существенных изменениях мы уведомим по email или через уведомления в приложении.`
    },
    {
      title: "2. Описание сервиса",
      content: `SafeSurf VPN — это сервис виртуальной частной сети, который:
• Шифрует ваш интернет-трафик
• Скрывает ваш реальный IP-адрес
• Обеспечивает безопасное подключение к интернету
• Позволяет обходить географические ограничения
• Защищает данные в публичных Wi-Fi сетях

Мы стремимся обеспечить высокое качество сервиса, но не гарантируем 100% доступность.`
    },
    {
      title: "3. Регистрация и аккаунт",
      content: `Для использования SafeSurf VPN необходимо:
• Создать учётную запись с действующим email
• Выбрать надёжный пароль
• Предоставить точную информацию при регистрации
• Поддерживать конфиденциальность своих учётных данных

Вы несёте ответственность за все действия, совершённые под вашей учётной записью.`
    },
    {
      title: "4. Разрешённое использование",
      content: `SafeSurf VPN можно использовать для:
• Защиты конфиденциальности в интернете
• Безопасного просмотра веб-сайтов
• Защиты данных в публичных сетях
• Обхода географических ограничений (там, где это законно)
• Защиты от цензуры и слежки

Мы поддерживаем свободу интернета и право на конфиденциальность.`
    },
    {
      title: "5. Запрещённое использование",
      content: `Строго ЗАПРЕЩАЕТСЯ использовать SafeSurf VPN для:
• Любых незаконных действий
• Нарушения авторских прав
• Распространения вредоносного ПО
• Спама или фишинга
• Хакерских атак или взлома
• Доступа к детской порнографии
• Торговли наркотиками или оружием
• Любых действий, причиняющих вред другим людям

Мы сотрудничаем с правоохранительными органами при выявлении преступной деятельности.`
    },
    {
      title: "6. Оплата и подписки",
      content: `Условия оплаты:
• Оплата производится заранее за выбранный период
• Цены могут изменяться с уведомлением за 30 дней
• Автоматическое продление можно отключить в настройках
• Возврат средств регулируется нашей политикой возврата
• Мы принимаем различные способы оплаты

При просрочке платежа доступ к сервису может быть приостановлен.`
    },
    {
      title: "7. Конфиденциальность и логи",
      content: `SafeSurf VPN придерживается строгой no-logs политики:
• Мы не сохраняем логи вашей интернет-активности
• Мы не отслеживаваем посещаемые сайты
• Мы не записываем ваши IP-адреса
• Технические логи (для диагностики) не содержат личных данных

Подробности в нашей Политике конфиденциальности.`
    },
    {
      title: "8. Ограничения ответственности",
      content: `SafeSurf VPN предоставляется "как есть":
• Мы не гарантируем постоянную доступность сервиса
• Возможны технические сбои и профилактические работы
• Мы не несём ответственности за действия пользователей
• Максимальная ответственность ограничена стоимостью подписки
• Пользователь несёт ответственность за соблюдение местных законов`
    },
    {
      title: "9. Изменения и прекращение сервиса",
      content: `SafeSurf VPN оставляет за собой право:
• Изменять функциональность сервиса
• Прекращать поддержку устаревших платформ
• Блокировать аккаунты при нарушении условий
• Изменять данные условия использования
• Прекращать предоставление сервиса (с возвратом средств за неиспользованный период)`
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
              Условия использования
            </h1>
            <div className="flex items-center justify-center gap-4 text-muted-foreground">
              <p>Последнее обновление: 1 января 2024 года</p>
              <Badge variant="outline">Действует</Badge>
            </div>
          </div>

          {/* Important Notice */}
          <Card className="p-6 mb-8 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Важно прочитать
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
                  Эти условия составляют юридически обязательное соглашение между вами и SafeSurf VPN. 
                  Пожалуйста, внимательно прочитайте все разделы перед использованием сервиса.
                </p>
              </div>
            </div>
          </Card>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {section.title}
                </h3>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </Card>
            ))}
          </div>

          {/* Contact and Support */}
          <Card className="p-8 mt-12 bg-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Вопросы по условиям использования?
            </h3>
            <p className="text-muted-foreground mb-4">
              Если у вас есть вопросы об условиях использования или нужна правовая консультация:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground"><strong>Правовые вопросы:</strong></p>
                <p className="text-muted-foreground">legal@safesurf.tech</p>
              </div>
              <div>
                <p className="text-muted-foreground"><strong>Общая поддержка:</strong></p>
                <p className="text-muted-foreground">support@safesurf.tech</p>
              </div>
            </div>
          </Card>

          {/* Bottom Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button variant="outline" asChild>
              <Link href="/privacy">Политика конфиденциальности</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/refund">Политика возврата</Link>
            </Button>
            <Button asChild>
              <Link href="/contact">Связаться с нами</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 