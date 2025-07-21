"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Mail, MessageCircle, Globe } from "lucide-react";

const navigation = {
  product: [
    { name: "Возможности", href: "/#features" },
    { name: "Тарифы", href: "/#pricing" },
    { name: "Серверы", href: "/servers" },
    { name: "Приложения", href: "/download" },
  ],
  support: [
    { name: "Помощь", href: "/help" },
    { name: "Документация", href: "/docs" },
    { name: "Контакты", href: "/contact" },
    { name: "Статус сервисов", href: "/status" },
  ],
  company: [
    { name: "О нас", href: "/about" },
    { name: "Блог", href: "/blog" },
    { name: "Пресс-кит", href: "/press" },
    { name: "Карьера", href: "/careers" },
  ],
  legal: [
    { name: "Политика конфиденциальности", href: "/privacy" },
    { name: "Условия использования", href: "/terms" },
    { name: "Политика возврата", href: "/refund" },
    { name: "Политика логов", href: "/no-logs" },
  ],
};

const socialMedia = [
  {
    name: "Telegram",
    href: "https://t.me/safesurfvpn",
    icon: MessageCircle,
  },
  {
    name: "Email",
    href: "mailto:support@safesurf.tech",
    icon: Mail,
  },
];

export function Footer() {
  return (
    <footer className="bg-muted/20 border-t">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/" className="flex items-center gap-2 mb-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Shield className="h-8 w-8 text-primary" />
                </motion.div>
                <span className="font-bold text-xl text-foreground">SafeSurf</span>
              </Link>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Премиальный VPN сервис с современными протоколами для полной анонимности 
                и безопасности в интернете. Защитите свои данные уже сегодня.
              </p>
              
              {/* Social Media */}
              <div className="flex space-x-4">
                {socialMedia.map((item) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Navigation sections */}
          <div className="col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-4">Продукт</h3>
              <ul className="space-y-3">
                {navigation.product.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-4">Поддержка</h3>
              <ul className="space-y-3">
                {navigation.support.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-4">Компания</h3>
              <ul className="space-y-3">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-4">Правовая информация</h3>
              <ul className="space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom section */}
        <motion.div
          className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <p>&copy; 2024 SafeSurf VPN. Все права защищены.</p>
            <div className="hidden sm:flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span>Русский</span>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 text-xs text-muted-foreground">
            <p>Сделано с ❤️ для свободного интернета</p>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-8 text-xs text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>No-Logs</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>AES-256</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>OpenSource</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>30-день гарантия</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
} 