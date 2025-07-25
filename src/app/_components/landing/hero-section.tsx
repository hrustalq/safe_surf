"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Globe, Lock } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

// Smooth scroll function for anchor links
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

const stats = [
  { label: "Высокоскоростной сервер", value: "1" },
  { label: "Времени безотказной работы", value: "99.9%" },
  { label: "Современных протоколов", value: "3" },
  { label: "Скорость подключения", value: "До 1 Гбит/с" },
];

const protocols = [
  { name: "VLESS", description: "Самый современный протокол" },
  { name: "VMESS", description: "Надёжный и быстрый" },
  { name: "V2Ray", description: "Проверенная основа" },
];

export function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 pt-24 pb-16">
      {/* Background elements */}
      <div className="absolute inset-0 -z-20 pointer-events-none">
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-background shadow-xl shadow-primary/10 ring-1 ring-primary/5 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2 lg:items-center">
            <div>
              <motion.h1
                className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Свободный{" "}
                <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text">
                  интернет
                </span>{" "}
                без границ
              </motion.h1>
              
              <motion.p
                className="mt-6 text-lg leading-8 text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Надёжный VPN сервис с высокоскоростным сервером и современными протоколами VLESS и VMESS. 
                Обходите блокировки, защищайте свои данные и наслаждайтесь быстрым и стабильным интернетом.
              </motion.p>
              
              <motion.div
                className="mt-10 flex items-center gap-x-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button 
                  size="lg" 
                  className="px-8 py-3 text-base font-semibold" 
                  onClick={() => scrollToSection('pricing')}
                >
                  Начать сейчас
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-3 text-base font-semibold" 
                  onClick={() => scrollToSection('features')}
                >
                  Узнать больше
                </Button>
              </motion.div>
              
              {/* Protocol badges */}
              <motion.div
                className="mt-8 flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {protocols.map((protocol, index) => (
                  <motion.div
                    key={protocol.name}
                    className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  >
                    <Shield className="h-4 w-4 text-primary" />
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {protocol.name}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {protocol.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            
            {/* Right side with features cards */}
            <div className="lg:pl-8">
              <motion.div
                className="grid grid-cols-1 gap-6 sm:grid-cols-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="p-6 bg-card/60 backdrop-blur border border-border hover:border-primary/30 transition-all duration-300">
                  <motion.div
                    className="flex items-center gap-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="rounded-xl bg-primary/10 p-3">
                      <Zap className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base">Высокая скорость</h3>
                      <p className="text-sm text-muted-foreground mt-1">До 1 Гбит/с</p>
                    </div>
                  </motion.div>
                </Card>
                
                <Card className="p-6 bg-card/60 backdrop-blur border border-border hover:border-primary/30 transition-all duration-300">
                  <motion.div
                    className="flex items-center gap-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="rounded-xl bg-primary/10 p-3">
                      <Globe className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base">Один надёжный сервер</h3>
                      <p className="text-sm text-muted-foreground mt-1">Оптимальная настройка</p>
                    </div>
                  </motion.div>
                </Card>
                
                <Card className="p-6 bg-card/60 backdrop-blur border border-border hover:border-primary/30 transition-all duration-300">
                  <motion.div
                    className="flex items-center gap-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="rounded-xl bg-primary/10 p-3">
                      <Lock className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base">Шифрование</h3>
                      <p className="text-sm text-muted-foreground mt-1">AES-256 защита</p>
                    </div>
                  </motion.div>
                </Card>
                
                <Card className="p-6 bg-card/60 backdrop-blur border border-border hover:border-primary/30 transition-all duration-300">
                  <motion.div
                    className="flex items-center gap-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="rounded-xl bg-primary/10 p-3">
                      <Shield className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base">Анонимность</h3>
                      <p className="text-sm text-muted-foreground mt-1">Полная конфиденциальность</p>
                    </div>
                  </motion.div>
                </Card>
              </motion.div>
            </div>
          </div>
          
          {/* Stats */}
          <motion.div
            className="mt-20 grid grid-cols-2 gap-8 sm:mt-24 sm:grid-cols-4 lg:mt-32"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + index * 0.1 }}
              >
                <motion.div
                  className="text-3xl font-bold text-primary sm:text-4xl"
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.value}
                </motion.div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
} 