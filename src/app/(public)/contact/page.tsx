"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Mail, MessageCircle, Clock, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Alert, AlertDescription } from "~/components/ui/alert";

// export const metadata: Metadata = {
//   title: "Контакты - SafeSurf VPN",
//   description: "Свяжитесь с командой SafeSurf VPN. Мы готовы помочь с любыми вопросами о нашем VPN сервисе.",
//   keywords: "контакты, поддержка, помощь, связь, SafeSurf VPN",
// };

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const contactMethods = [
    {
      icon: Mail,
      title: "Email поддержка",
      description: "Получите ответ в течение 24 часов",
      contact: "support@safesurf.tech",
      link: "mailto:support@safesurf.tech",
    },
    {
      icon: MessageCircle,
      title: "Telegram",
      description: "Быстрые ответы в нашем чате",
      contact: "@safesurfvpn",
      link: "https://t.me/safesurfvpn",
    },
    {
      icon: Clock,
      title: "Время работы",
      description: "Мы всегда онлайн",
      contact: "24/7",
      link: null,
    },
  ];

  const subjects = [
    { value: "general", label: "Общий вопрос" },
    { value: "technical", label: "Техническая поддержка" },
    { value: "billing", label: "Вопросы оплаты" },
    { value: "refund", label: "Возврат средств" },
    { value: "partnership", label: "Партнёрство" },
    { value: "other", label: "Другое" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real app, send to API
      console.log("Contact form data:", formData);
      
      setIsSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setError("Произошла ошибка при отправке сообщения. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
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
          <div className="max-w-md mx-auto">
            <Card className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Сообщение отправлено!
              </h1>
              <p className="text-muted-foreground mb-6">
                Мы получили ваше сообщение и ответим в течение 24 часов.
              </p>
              <Button asChild>
                <Link href="/">Вернуться на главную</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
              Свяжитесь с нами
            </h1>
            <p className="text-lg text-muted-foreground">
              Мы всегда готовы помочь и ответить на ваши вопросы
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {contactMethods.map((method, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <method.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{method.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                {method.link ? (
                  <a href={method.link} className="text-primary hover:underline">
                    {method.contact}
                  </a>
                ) : (
                  <p className="text-primary font-semibold">{method.contact}</p>
                )}
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Отправить сообщение</h2>
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Ваше имя</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Иван Иванов"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Тема обращения</Label>
                <Select 
                  value={formData.subject} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тему" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.value} value={subject.value}>
                        {subject.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Сообщение</Label>
                <Textarea
                  id="message"
                  placeholder="Опишите ваш вопрос или проблему..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Отправить сообщение
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Additional Info */}
          <Card className="p-6 mt-8 bg-primary/5 border-primary/20">
            <h3 className="font-semibold text-foreground mb-2">Частые вопросы?</h3>
            <p className="text-muted-foreground mb-4">
              Возможно, ответ на ваш вопрос уже есть в нашем разделе помощи.
            </p>
            <Button variant="outline" asChild>
              <Link href="/help">Перейти в раздел помощи</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}