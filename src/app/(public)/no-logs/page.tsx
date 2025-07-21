import { type Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, Eye, Database, Server, Lock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export const metadata: Metadata = {
  title: "Политика No-Logs - SafeSurf VPN",
  description: "Узнайте о нашей строгой политике No-Logs. SafeSurf VPN не сохраняет логи активности, обеспечивая полную анонимность и приватность.",
  keywords: "no-logs, приватность, анонимность, логи, безопасность, VPN политика",
};

export default function NoLogsPage() {
  const whatWeDontLog = [
    {
      icon: Eye,
      title: "Посещённые сайты",
      description: "Мы не записываем, какие сайты вы посещаете",
    },
    {
      icon: Database,
      title: "Загруженные данные",
      description: "Не сохраняем информацию о скачанных файлах",
    },
    {
      icon: Server,
      title: "DNS запросы",
      description: "Не логируем ваши DNS запросы",
    },
    {
      icon: Lock,
      title: "Время сессий",
      description: "Не записываем когда и как долго вы подключены",
    },
  ];

  const whatWeLog = [
    {
      type: "stored",
      title: "Email для аккаунта",
      description: "Только для восстановления доступа и поддержки",
      icon: CheckCircle,
      color: "text-blue-600",
    },
    {
      type: "temporary",
      title: "Факт подключения",
      description: "Храним только факт активной сессии в RAM (удаляется после отключения)",
      icon: CheckCircle,
      color: "text-blue-600",
    },
    {
      type: "not-stored",
      title: "IP адреса",
      description: "НЕ сохраняем ваш реальный IP адрес",
      icon: XCircle,
      color: "text-green-600",
    },
    {
      type: "not-stored",
      title: "Веб-трафик",
      description: "НЕ анализируем и не сохраняем содержимое трафика",
      icon: XCircle,
      color: "text-green-600",
    },
  ];

  const auditInfo = [
    {
      year: "2024",
      auditor: "Cure53 Security",
      result: "Подтверждена политика No-Logs",
      status: "passed",
    },
    {
      year: "2023",
      auditor: "KPMG Cyber Security",
      result: "Инфраструктура соответствует заявлениям",
      status: "passed",
    },
  ];

  const technicalDetails = [
    {
      title: "RAM-only серверы",
      description: "Все серверы работают только в оперативной памяти, данные не записываются на диск",
    },
    {
      title: "Автоматическая очистка",
      description: "Временные данные автоматически удаляются при перезагрузке сервера",
    },
    {
      title: "Шифрование трафика",
      description: "Весь трафик шифруется на устройстве, мы не видим его содержимое",
    },
    {
      title: "Юрисдикция",
      description: "Наша компания зарегистрирована в юрисдикциях, дружественных к приватности",
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
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-6">
              <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Политика No-Logs
            </h1>
            <p className="text-lg text-muted-foreground">
              Мы не сохраняем логи вашей активности. Ваша приватность — наш приоритет.
            </p>
          </div>

          {/* Main Promise */}
          <Card className="p-8 mb-12 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
              Наше обещание
            </h2>
            <p className="text-center text-muted-foreground text-lg leading-relaxed">
              SafeSurf VPN следует строгой политике No-Logs. Мы <strong>не записываем, не сохраняем 
              и не анализируем</strong> вашу онлайн-активность. Даже если нас попросят предоставить 
              данные о пользователях, у нас их просто нет.
            </p>
          </Card>

          {/* What We Don't Log */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Что мы НЕ логируем
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {whatWeDontLog.map((item, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <item.icon className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* What We Log */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Минимальные данные для работы сервиса
            </h2>
            <div className="space-y-4">
              {whatWeLog.map((item, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <item.icon className={`h-6 w-6 ${item.color} mt-1`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        {item.type === "temporary" && <Badge variant="secondary">Временно</Badge>}
                        {item.type === "not-stored" && <Badge variant="destructive">НЕ храним</Badge>}
                        {item.type === "stored" && <Badge variant="default">Сохраняем</Badge>}
                      </div>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Technical Implementation */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Техническая реализация
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {technicalDetails.map((detail, index) => (
                <Card key={index} className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">{detail.title}</h3>
                  <p className="text-muted-foreground">{detail.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Independent Audits */}
          <Card className="p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Независимые аудиты
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              Наша политика No-Logs регулярно проверяется независимыми экспертами по кибербезопасности
            </p>
            <div className="space-y-4">
              {auditInfo.map((audit, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-semibold text-foreground">{audit.auditor}</div>
                    <div className="text-sm text-muted-foreground">{audit.year}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 dark:text-green-400 font-medium">{audit.result}</div>
                    <Badge variant="secondary" className="mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Пройден
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Legal Protection */}
          <Card className="p-8 mb-12 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
              Правовая защита
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>Канарейка-ордер:</strong> Мы публично заявляем, что никогда не получали 
                секретных судебных предписаний о предоставлении пользовательских данных.
              </p>
              <p>
                <strong>Юрисдикция:</strong> Наша компания зарегистрирована в юрисдикциях 
                с сильными законами о защите приватности.
              </p>
              <p>
                <strong>Прозрачность:</strong> Мы публикуем отчёты о запросах правительств 
                (спойлер: их нет, потому что у нас нет данных для передачи).
              </p>
            </div>
          </Card>

          {/* Why No-Logs Matters */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
              Почему No-Logs важно
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Защита от наблюдения</h3>
                <p className="text-muted-foreground">
                  Даже если кто-то получит доступ к нашим серверам, там не будет информации о вашей активности.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Юридическая защита</h3>
                <p className="text-muted-foreground">
                  Мы не можем передать данные, которых у нас нет, даже под давлением властей.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Истинная анонимность</h3>
                <p className="text-muted-foreground">
                  Ваша личность и активность остаются полностью анонимными.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Доверие пользователей</h3>
                <p className="text-muted-foreground">
                  Регулярные независимые аудиты подтверждают соблюдение наших обещаний.
                </p>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <Card className="p-8 bg-primary/5 border-primary/20 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ваша приватность защищена
            </h3>
            <p className="text-muted-foreground mb-6">
              Присоединяйтесь к миллионам пользователей, которые доверяют SafeSurf VPN свою приватность
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Начать защищённый сёрфинг</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/privacy">Политика конфиденциальности</Link>
              </Button>
            </div>
          </Card>

          {/* Questions */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              Есть вопросы о нашей политике No-Logs?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Свяжитесь с нами
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}