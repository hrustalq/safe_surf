"use client";

import { motion } from "framer-motion";
import { 
  Shield, 
  Zap, 
  Globe, 
  Lock, 
  Wifi, 
  Server, 
  Smartphone, 
  Eye, 
  Clock, 
  CheckCircle,
  Star
} from "lucide-react";

import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

const mainFeatures = [
  {
    title: "Современные протоколы",
    description: "Поддержка VLESS и VMESS обеспечивает максимальную безопасность и скорость подключения.",
    icon: Shield,
    highlights: ["VLESS", "VMESS", "V2Ray", "Shadowsocks"],
  },
  {
    title: "Глобальная сеть серверов",
    description: "50+ серверов в 25 странах мира для быстрого и стабильного подключения.",
    icon: Globe,
    highlights: ["25 стран", "50+ серверов", "99.9% аптайм", "Низкий пинг"],
  },
  {
    title: "Максимальная скорость",
    description: "Наши серверы поддерживают скорости до 1 Гбит/с без ограничений трафика.",
    icon: Zap,
    highlights: ["До 1 Гбит/с", "Безлимитный трафик", "Без дросселирования", "CDN оптимизация"],
  },
];

const additionalFeatures = [
  {
    title: "Военное шифрование",
    description: "AES-256 шифрование защищает ваши данные",
    icon: Lock,
  },
  {
    title: "Kill Switch",
    description: "Автоматическое отключение при потере VPN",
    icon: Wifi,
  },
  {
    title: "DNS защита",
    description: "Блокировка рекламы и вредоносного ПО",
    icon: Server,
  },
  {
    title: "Мульти-устройства",
    description: "До 10 одновременных подключений",
    icon: Smartphone,
  },
  {
    title: "No-Log политика",
    description: "Мы не ведём логи вашей активности",
    icon: Eye,
  },
  {
    title: "24/7 поддержка",
    description: "Круглосуточная техническая поддержка",
    icon: Clock,
  },
];

const protocols = [
  {
    name: "VLESS",
    description: "Новейший протокол с минимальными накладными расходами",
    features: ["Без шифрования на уровне протокола", "Максимальная производительность", "Поддержка TLS 1.3"],
    icon: "🔥",
  },
  {
    name: "VMESS",
    description: "Проверенный протокол с динамическим портом",
    features: ["Встроенное шифрование", "Динамическая смена портов", "Обфускация трафика"],
    icon: "⚡",
  },
  {
    name: "V2Ray",
    description: "Мощная платформа для обхода блокировок",
    features: ["Маскировка под обычный трафик", "Множественная маршрутизация", "Гибкие правила"],
    icon: "🛡️",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-4" variant="outline">
            Возможности
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Почему выбирают SafeSurf?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Передовые технологии и максимальная безопасность для вашего интернета
          </p>
        </motion.div>

        {/* Main Features */}
        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full bg-card hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/30 flex flex-col">
                <div className="flex-grow">
                  <motion.div
                    className="flex items-start gap-4 mb-6"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="rounded-xl bg-primary/10 p-4 shrink-0">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-base leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex flex-wrap gap-2">
                    {feature.highlights.map((highlight, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm font-medium px-3 py-1">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Protocol Section */}
        <div className="mt-32">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-foreground mb-6">
              Современные протоколы
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Используем самые передовые технологии для максимальной безопасности
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {protocols.map((protocol, index) => (
              <motion.div
                key={protocol.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 text-center bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/30 h-full flex flex-col">
                  <div className="flex-grow">
                    <motion.div
                      className="text-5xl mb-6"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.6 }}
                    >
                      {protocol.icon}
                    </motion.div>
                    <h4 className="text-2xl font-bold text-foreground mb-4">
                      {protocol.name}
                    </h4>
                    <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                      {protocol.description}
                    </p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-border">
                    <div className="space-y-3">
                      {protocol.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm justify-center">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="mt-32">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-foreground mb-6">
              Дополнительные возможности
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Всё что нужно для безопасного и комфортного интернета
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 bg-card/60 backdrop-blur hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/20 h-full">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 shrink-0">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-base mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-3">
            <Star className="h-5 w-5 text-primary fill-primary" />
            <span className="font-semibold text-foreground">Высокие рейтинги</span>
            <span className="text-muted-foreground">• Проверенное качество</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 