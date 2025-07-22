import { type Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, Users, Globe, Lock, Zap } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export const metadata: Metadata = {
  title: "О нас - SafeSurf VPN",
  description: "Узнайте больше о SafeSurf VPN - команде, которая защищает вашу приватность и свободу в интернете с помощью современных технологий.",
  keywords: "о компании, команда, миссия, SafeSurf VPN, приватность, безопасность",
};

export default function AboutPage() {
  const stats = [
    { value: "1M+", label: "Активных пользователей" },
    { value: "50+", label: "Серверов по миру" },
    { value: "99.9%", label: "Время работы" },
    { value: "24/7", label: "Поддержка" },
  ];

  const values = [
    {
      icon: Lock,
      title: "Приватность превыше всего",
      description: "Мы не храним логи и не отслеживаем вашу активность. Ваши данные принадлежат только вам.",
    },
    {
      icon: Globe,
      title: "Свобода интернета",
      description: "Боремся за открытый и свободный интернет без цензуры и ограничений.",
    },
    {
      icon: Zap,
      title: "Инновации и скорость",
      description: "Используем передовые протоколы VLESS и VMESS для максимальной скорости и безопасности.",
    },
    {
      icon: Users,
      title: "Сообщество в приоритете",
      description: "Прислушиваемся к пользователям и постоянно улучшаем сервис на основе обратной связи.",
    },
  ];

  const team = [
    {
      name: "Александр Петров",
      role: "CEO & Основатель",
      bio: "Эксперт в области кибербезопасности с 15-летним опытом",
    },
    {
      name: "Мария Иванова",
      role: "CTO",
      bio: "Ведущий разработчик протоколов шифрования",
    },
    {
      name: "Дмитрий Сидоров",
      role: "Head of Security",
      bio: "Специалист по сетевой безопасности и защите данных",
    },
    {
      name: "Елена Козлова",
      role: "Head of Support",
      bio: "Обеспечивает лучший опыт поддержки для наших пользователей",
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
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Защищаем вашу свободу в интернете
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              SafeSurf VPN создан командой экспертов в области кибербезопасности, 
              которые верят в право каждого на приватность и свободный доступ к информации.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Mission */}
          <Card className="p-8 mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4">Наша миссия</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Мы создали SafeSurf VPN с одной целью — обеспечить каждому пользователю интернета 
              возможность безопасно и свободно пользоваться сетью без страха слежки, цензуры или утечки данных.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              В эпоху цифровых технологий приватность становится роскошью. Мы делаем её доступной каждому, 
              используя передовые технологии шифрования и современные протоколы передачи данных.
            </p>
          </Card>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-foreground mb-8">Наши ценности</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-foreground mb-8">Наша команда</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {team.map((member, index) => (
                <Card key={index} className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{member.name}</h3>
                  <p className="text-primary mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Story */}
          <Card className="p-8 mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4">Наша история</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              SafeSurf VPN начался в 2020 году как небольшой проект группы энтузиастов, 
              обеспокоенных растущими проблемами приватности в интернете. То, что начиналось 
              как эксперимент, быстро переросло в полноценный сервис.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Сегодня мы обслуживаем более миллиона пользователей по всему миру, предоставляя 
              им доступ к безопасному и свободному интернету через наши высокоскоростные серверы.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Мы продолжаем развиваться, внедряя новые технологии и расширяя нашу инфраструктуру, 
              чтобы оставаться на шаг впереди в борьбе за вашу приватность.
            </p>
          </Card>

          {/* CTA */}
          <Card className="p-8 bg-primary/5 border-primary/20 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Присоединяйтесь к нам
            </h3>
            <p className="text-muted-foreground mb-6">
              Станьте частью сообщества, которое ценит приватность и свободу в интернете
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/auth/signup">Начать использовать</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Связаться с нами</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}