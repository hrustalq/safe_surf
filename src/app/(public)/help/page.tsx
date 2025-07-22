"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Search, ChevronDown, ChevronRight, MessageCircle, Book, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Badge } from "~/components/ui/badge";

// export const metadata: Metadata = {
//   title: "Помощь и FAQ - SafeSurf VPN",
//   description: "Ответы на часто задаваемые вопросы о SafeSurf VPN. Узнайте, как настроить и использовать VPN эффективно.",
//   keywords: "FAQ, помощь, поддержка, инструкции, настройка VPN, вопросы",
// };

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<number[]>([]);

  const categories = [
    {
      title: "Начало работы",
      icon: "🚀",
      faqs: [
        {
          question: "Как создать аккаунт и начать пользоваться?",
          answer: "Перейдите на страницу регистрации, введите email и пароль. После подтверждения email выберите тарифный план и скачайте приложение для вашего устройства.",
        },
        {
          question: "Какие устройства поддерживаются?",
          answer: "SafeSurf VPN поддерживает Windows, macOS, Linux, iOS, Android. Также возможна ручная настройка на роутерах и других устройствах.",
        },
        {
          question: "Сколько устройств можно подключить одновременно?",
          answer: "Количество зависит от тарифа: Basic - 3 устройства, Premium - 5 устройств, Professional - 10 устройств.",
        },
      ],
    },
    {
      title: "Подключение и настройка",
      icon: "⚙️",
      faqs: [
        {
          question: "VPN не подключается, что делать?",
          answer: "Проверьте интернет-соединение, попробуйте другой сервер, перезапустите приложение. Если проблема сохраняется, свяжитесь с поддержкой.",
        },
        {
          question: "Как выбрать лучший сервер?",
          answer: "Выбирайте ближайший к вам сервер с низкой нагрузкой. Для стриминга используйте серверы в нужной стране. Приложение может выбрать сервер автоматически.",
        },
        {
          question: "Что такое Kill Switch и как его включить?",
          answer: "Kill Switch автоматически блокирует интернет, если VPN отключится. Включите его в настройках приложения для максимальной безопасности.",
        },
        {
          question: "Как настроить VPN на роутере?",
          answer: "Зайдите в настройки роутера, найдите раздел VPN, выберите протокол (рекомендуем VLESS), введите данные сервера. Подробные инструкции в разделе документации.",
        },
      ],
    },
    {
      title: "Скорость и производительность",
      icon: "⚡",
      faqs: [
        {
          question: "Почему интернет стал медленным с VPN?",
          answer: "Небольшое снижение скорости нормально. Попробуйте ближайший сервер с низкой нагрузкой, проверьте протокол подключения (VLESS обычно быстрее).",
        },
        {
          question: "Какой протокол выбрать для максимальной скорости?",
          answer: "VLESS обеспечивает лучшую скорость и надёжность. VMESS более универсален. В приложении протокол выбирается автоматически.",
        },
        {
          question: "Влияет ли VPN на пинг в играх?",
          answer: "Да, пинг может увеличиться. Для игр выбирайте ближайшие серверы с низким пингом или отключайте VPN в играх, где не требуется защита.",
        },
      ],
    },
    {
      title: "Безопасность и приватность",
      icon: "🔒",
      faqs: [
        {
          question: "Сохраняете ли вы логи активности?",
          answer: "Нет, мы следуем строгой политике No-Logs. Мы не сохраняем информацию о ваших посещённых сайтах, загрузках или онлайн-активности.",
        },
        {
          question: "Какое шифрование используется?",
          answer: "Мы используем военное шифрование AES-256 для защиты всего трафика. Дополнительно применяются современные протоколы VLESS и VMESS.",
        },
        {
          question: "Безопасно ли использовать VPN для банкинга?",
          answer: "Да, но рекомендуем использовать серверы в той же стране, что и ваш банк, чтобы избежать блокировки транзакций системой безопасности банка.",
        },
        {
          question: "Защищает ли VPN от вирусов и рекламы?",
          answer: "VPN шифрует трафик, но не блокирует вирусы. В наших приложениях есть встроенная защита от рекламы и вредоносных сайтов.",
        },
      ],
    },
    {
      title: "Оплата и аккаунт",
      icon: "💳",
      faqs: [
        {
          question: "Какие способы оплаты доступны?",
          answer: "Принимаем банковские карты, PayPal, криптовалюты (Bitcoin, Ethereum), Apple Pay, Google Pay. Все платежи защищены.",
        },
        {
          question: "Можно ли вернуть деньги?",
          answer: "Да, действует 30-дневная гарантия возврата денег без вопросов. Просто напишите в поддержку в течение 30 дней после покупки.",
        },
        {
          question: "Как отменить подписку?",
          answer: "Зайдите в настройки аккаунта и нажмите 'Отменить подписку'. Доступ сохранится до окончания оплаченного периода.",
        },
        {
          question: "Что происходит после окончания подписки?",
          answer: "Доступ к VPN прекращается, но аккаунт сохраняется. Вы можете продлить подписку в любое время без потери настроек.",
        },
      ],
    },
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.faqs.length > 0);

  const toggleItem = (categoryIndex: number, faqIndex: number) => {
    const itemId = categoryIndex * 100 + faqIndex;
    setOpenItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const quickLinks = [
    { title: "Скачать приложения", href: "/download", icon: "📱" },
    { title: "Наши серверы", href: "/servers", icon: "🌍" },
    { title: "Документация", href: "/docs", icon: "📚" },
    { title: "Связаться с поддержкой", href: "/contact", icon: "💬" },
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
              Центр помощи
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Найдите ответы на часто задаваемые вопросы
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Найти в FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {quickLinks.map((link, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                <Link href={link.href} className="block text-center">
                  <div className="text-2xl mb-2">{link.icon}</div>
                  <div className="font-medium text-foreground">{link.title}</div>
                </Link>
              </Card>
            ))}
          </div>

          {/* FAQ Categories */}
          <div className="space-y-6">
            {filteredCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{category.icon}</span>
                  <h2 className="text-xl font-semibold text-foreground">{category.title}</h2>
                  <Badge variant="secondary">{category.faqs.length}</Badge>
                </div>

                <div className="space-y-3">
                  {category.faqs.map((faq, faqIndex) => {
                    const itemId = categoryIndex * 100 + faqIndex;
                    const isOpen = openItems.includes(itemId);

                    return (
                      <Collapsible key={faqIndex} open={isOpen} onOpenChange={() => toggleItem(categoryIndex, faqIndex)}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors">
                          <span className="font-medium text-foreground pr-4">
                            {faq.question}
                          </span>
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 py-3 text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>

          {searchQuery && filteredCategories.length === 0 && (
            <Card className="p-8 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Ничего не найдено
              </h3>
              <p className="text-muted-foreground mb-4">
                Попробуйте изменить запрос или обратитесь в поддержку
              </p>
              <Button asChild>
                <Link href="/contact">Связаться с поддержкой</Link>
              </Button>
            </Card>
          )}

          {/* Contact Support */}
          <Card className="p-8 mt-12 bg-primary/5 border-primary/20 text-center">
            <div className="flex justify-center mb-4">
              <MessageCircle className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Не нашли ответ?
            </h3>
            <p className="text-muted-foreground mb-6">
              Наша команда поддержки работает 24/7 и готова помочь с любыми вопросами
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/contact">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Написать в поддержку
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://t.me/safesurfvpn" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Telegram чат
                </a>
              </Button>
            </div>
          </Card>

          {/* Additional Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Book className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-foreground">Документация</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Подробные инструкции по настройке и использованию VPN
              </p>
              <Button variant="outline" asChild>
                <Link href="/docs">Перейти к документации</Link>
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-foreground">Сообщество</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Общайтесь с другими пользователями и получайте советы
              </p>
              <Button variant="outline" asChild>
                <a href="https://t.me/safesurfvpn" target="_blank" rel="noopener noreferrer">
                  Присоединиться
                </a>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}