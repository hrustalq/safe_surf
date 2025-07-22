"use client";

import { motion } from "framer-motion";
import { CheckCircle, Star, Zap } from "lucide-react";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface Plan {
  id: string;
  nameRu: string;
  descriptionRu: string;
  price: number;
  currency: string;
  durationDays: number;
  maxDevices: number;
  maxBandwidth: bigint | null;
  featuresRu: string[];
  protocols: string[];
  isPopular?: boolean;
}

interface PricingSectionClientProps {
  plans: Plan[];
}

export function PricingSectionClient({ plans }: PricingSectionClientProps) {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-muted/20 to-background">
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
            Тарифы
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Выберите подходящий план
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Прозрачные цены без скрытых платежей. Все планы включают 30-дневную гарантию возврата денег.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.isPopular && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                  viewport={{ once: true }}
                >
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="h-4 w-4 mr-1" />
                    Популярный
                  </Badge>
                </motion.div>
              )}
              
              <Card 
                className={`p-8 h-full flex flex-col ${
                  plan.isPopular 
                    ? 'border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10' 
                    : 'bg-card border border-border'
                } hover:shadow-xl hover:border-primary/30 transition-all duration-300`}
              >
                <div className="flex-grow">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-foreground mb-3">
                      {plan.nameRu}
                    </h3>
                    <p className="text-muted-foreground text-base mb-6 leading-relaxed">
                      {plan.descriptionRu}
                    </p>
                    
                    {/* Price */}
                    <div className="mb-6">
                      <motion.div
                        className="text-5xl font-bold text-foreground mb-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        RUB{plan.price}
                        <span className="text-xl text-muted-foreground font-normal ml-1">
                          /месяц
                        </span>
                      </motion.div>
                      <p className="text-base text-muted-foreground">
                        {plan.maxDevices} {plan.maxDevices === 1 ? 'устройство' : 
                         plan.maxDevices <= 4 ? 'устройства' : 'устройств'}
                      </p>
                    </div>
                    
                    {/* Protocols */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                      {plan.protocols.map((protocol) => (
                        <Badge key={protocol} variant="secondary" className="text-sm font-medium px-3 py-1">
                          {protocol}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.featuresRu.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.2 + idx * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-base text-foreground leading-relaxed">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* CTA Button - Always at bottom */}
                <div className="mt-auto pt-6 border-t border-border">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      className={`w-full h-12 text-base font-semibold ${
                        plan.isPopular 
                          ? 'bg-primary hover:bg-primary/90 shadow-lg' 
                          : ''
                      }`}
                      variant={plan.isPopular ? 'default' : 'outline'}
                      size="lg"
                      asChild
                    >
                      <Link href={`/auth/signup?plan=${plan.id}`}>
                        {plan.isPopular && <Zap className="h-5 w-5 mr-2" />}
                        Выбрать план
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-bold text-foreground mb-3 text-lg">30-дневная гарантия</h4>
              <p className="text-base text-muted-foreground leading-relaxed">
                Полный возврат средств в течение 30 дней
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-bold text-foreground mb-3 text-lg">Мгновенная активация</h4>
              <p className="text-base text-muted-foreground leading-relaxed">
                Подключение к VPN через 2 минуты после оплаты
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-bold text-foreground mb-3 text-lg">Без логов</h4>
              <p className="text-base text-muted-foreground leading-relaxed">
                Мы не ведём логи вашей активности
              </p>
            </div>
          </div>

          <div className="mt-16 p-8 bg-primary/10 rounded-xl">
            <p className="text-base text-muted-foreground leading-relaxed">
              Все планы включают: неограниченный трафик, Kill Switch, DNS защиту, 
              поддержку всех устройств и 24/7 техническую поддержку
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 