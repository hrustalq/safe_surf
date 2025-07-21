import { type Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export const metadata: Metadata = {
  title: "Политика конфиденциальности - SafeSurf VPN",
  description: "Узнайте, как SafeSurf VPN защищает вашу конфиденциальность и обрабатывает персональные данные. Полная прозрачность в вопросах безопасности.",
  keywords: "конфиденциальность, приватность, защита данных, VPN безопасность, no-logs",
};

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Общие положения",
      content: `SafeSurf VPN серьёзно относится к защите вашей конфиденциальности. Мы создали этот VPN-сервис с единственной целью — обеспечить максимальную защиту ваших данных и анонимность в интернете. Данная политика объясняет, какую информацию мы собираем, как используем и защищаем ваши данные.`
    },
    {
      title: "2. No-Logs политика",
      content: `SafeSurf VPN придерживается строгой политики отсутствия логов:
      • Мы НЕ ведём логи вашей интернет-активности
      • Мы НЕ сохраняем информацию о посещённых сайтах
      • Мы НЕ отслеживаваем время подключений и отключений
      • Мы НЕ записываем ваш IP-адрес во время VPN-сессий
      • Мы НЕ сохраняем информацию о передаваемых данных`
    },
    {
      title: "3. Информация, которую мы собираем",
      content: `Для работы сервиса нам необходимо собрать минимальное количество данных:
      
      Учётная запись:
      • Email адрес (для регистрации и связи)
      • Зашифрованный пароль
      • Дата регистрации
      
      Платёжная информация:
      • Данные об оплаченных тарифах
      • Статус подписки
      • Методы оплаты обрабатываются через защищённые платёжные шлюзы`
    },
    {
      title: "4. Техническая информация",
      content: `Для обеспечения качества сервиса мы собираем:
      • Общую статистику использования серверов (без привязки к пользователям)
      • Информацию о производительности сети
      • Данные для диагностики технических проблем
      • Агрегированную аналитику трафика (без персональных данных)`
    },
    {
      title: "5. Использование информации",
      content: `Мы используем собранную информацию исключительно для:
      • Предоставления VPN-сервиса
      • Обработки платежей и управления подписками
      • Технической поддержки пользователей
      • Улучшения качества сервиса
      • Соблюдения правовых требований`
    },
    {
      title: "6. Передача данных третьим лицам",
      content: `SafeSurf VPN НЕ продаёт, не сдаёт в аренду и не передаёт ваши персональные данные третьим лицам, за исключением:
      • Платёжных провайдеров для обработки платежей
      • Случаев, предусмотренных законодательством
      • Защиты прав и безопасности нашего сервиса`
    },
    {
      title: "7. Безопасность данных",
      content: `Мы применяем современные меры безопасности:
      • Шифрование AES-256 для всех данных
      • Безопасное хранение паролей (bcrypt)
      • Регулярные аудиты безопасности
      • Ограниченный доступ к серверам
      • Физическая защита дата-центров`
    },
    {
      title: "8. Ваши права",
      content: `Вы имеете право:
      • Запросить копию ваших персональных данных
      • Исправить неточные данные
      • Удалить свою учётную запись
      • Отозвать согласие на обработку данных
      • Получить данные в машиночитаемом формате`
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
              Политика конфиденциальности
            </h1>
            <p className="text-lg text-muted-foreground">
              Последнее обновление: 1 января 2024 года
            </p>
          </div>

          {/* Introduction */}
          <Card className="p-8 mb-8 border-primary/20">
            <div className="flex items-start gap-4">
              <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  Наши принципы
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  SafeSurf VPN построен на принципах максимальной конфиденциальности и защиты пользователей. 
                  Мы считаем, что интернет должен быть свободным и приватным пространством для каждого. 
                  Ваша конфиденциальность — это не товар, это ваше фундаментальное право.
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

          {/* Contact Information */}
          <Card className="p-8 mt-12 bg-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Контакты по вопросам конфиденциальности
            </h3>
            <p className="text-muted-foreground mb-4">
              Если у вас есть вопросы о данной политике конфиденциальности или обработке ваших данных, 
              свяжитесь с нами:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Email:</strong> privacy@safesurf.tech</p>
              <p><strong>Поддержка:</strong> support@safesurf.tech</p>
              <p><strong>Время ответа:</strong> в течение 24 часов</p>
            </div>
          </Card>

          {/* Bottom Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button variant="outline" asChild>
              <Link href="/terms">Условия использования</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/no-logs">Политика логов</Link>
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