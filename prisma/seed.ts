import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with VPN plans...');

  // Clear existing plans
  await db.vpnPlan.deleteMany();

  // Create VPN plans
  const plans = [
    {
      name: "Trial",
      nameRu: "Пробный",
      description: "7-day free trial to test our service",
      descriptionRu: "7-дневная бесплатная пробная версия",
      features: JSON.stringify([
        "2 simultaneous connections",
        "5GB monthly traffic",
        "High-speed server access",
        "VLESS & VMESS support",
        "Basic support",
      ]),
      featuresRu: JSON.stringify([
        "2 одновременных подключения",
        "5ГБ месячного трафика",
        "Доступ к высокоскоростному серверу",
        "VLESS & VMESS поддержка",
        "Базовая поддержка",
      ]),
      price: 0.00,
      currency: "USD",
      durationDays: 7,
      maxDevices: 2,
      maxBandwidth: 5368709120, // 5GB in bytes
      protocols: JSON.stringify(["VLESS", "VMESS"]),
      isActive: true,
      sortOrder: 0,
    },
    {
      name: "Basic",
      nameRu: "Базовый",
      description: "Perfect for personal use",
      descriptionRu: "Идеально для личного использования",
      features: JSON.stringify([
        "3 simultaneous connections",
        "Unlimited bandwidth",
        "High-speed server access", 
        "VLESS & VMESS support",
        "DNS protection",
        "Configuration files",
      ]),
      featuresRu: JSON.stringify([
        "3 одновременных подключения",
        "Неограниченный трафик",
        "Доступ к высокоскоростному серверу",
        "VLESS & VMESS поддержка",
        "DNS защита",
        "Файлы конфигурации",
      ]),
      price: 150.00,
      currency: "RUB",
      durationDays: 30,
      maxDevices: 3,
      maxBandwidth: null,
      protocols: JSON.stringify(["VLESS", "VMESS", "V2Ray"]),
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "Premium",
      nameRu: "Премиум",
      description: "Best choice for families",
      descriptionRu: "Лучший выбор для семьи",
      features: JSON.stringify([
        "7 simultaneous connections",
        "Unlimited bandwidth",
        "Premium server access",
        "All protocols",
        "DNS protection",
        "Priority support",
        "Optimized for streaming",
        "QR codes for easy setup",
      ]),
      featuresRu: JSON.stringify([
        "7 одновременных подключений",
        "Неограниченный трафик", 
        "Премиум доступ к серверу",
        "Все протоколы",
        "DNS защита",
        "Приоритетная поддержка",
        "Оптимизация для стриминга",
        "QR коды для простой настройки",
      ]),
      price: 300.00,
      currency: "RUB",
      durationDays: 30,
      maxDevices: 7,
      maxBandwidth: null,
      protocols: JSON.stringify(["VLESS", "VMESS", "V2Ray", "Shadowsocks"]),
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "Business",
      nameRu: "Корпоративный",
      description: "For teams and businesses",
      descriptionRu: "Для команд и бизнеса",
      features: JSON.stringify([
        "20 simultaneous connections",
        "Unlimited bandwidth",
        "Dedicated server resources",
        "All protocols",
        "Custom configurations",
        "SLA 99.99%",
        "Priority support",
        "Personal manager",
        "Advanced routing",
      ]),
      featuresRu: JSON.stringify([
        "20 одновременных подключений",
        "Неограниченный трафик",
        "Выделенные ресурсы сервера",
        "Все протоколы",
        "Кастомные конфигурации",
        "SLA 99.99%",
        "Приоритетная поддержка",
        "Персональный менеджер",
        "Продвинутая маршрутизация",
      ]),
      price: 500.00,
      currency: "RUB",
      durationDays: 30,
      maxDevices: 20,
      maxBandwidth: null,
      protocols: JSON.stringify(["VLESS", "VMESS", "V2Ray", "Shadowsocks", "Trojan"]),
      isActive: true,
      sortOrder: 3,
    },
    {
      name: "Ultimate",
      nameRu: "Ультимейт",
      description: "Maximum performance and features for power users",
      descriptionRu: "Максимальная производительность и возможности для продвинутых пользователей",
      features: JSON.stringify([
        "Unlimited simultaneous connections",
        "Unlimited bandwidth",
        "Exclusive server resources",
        "All protocols + experimental",
        "Private dedicated access",
        "Advanced routing chains",
        "Custom port forwarding",
        "API access for automation",
        "Advanced routing rules",
        "White-label configurations",
        "24/7 technical support",
        "Load balancing optimization",
        "Custom DNS servers",
        "Content unblocking optimization",
        "Zero-log guarantee",
      ]),
      featuresRu: JSON.stringify([
        "Неограниченное количество подключений",
        "Неограниченный трафик",
        "Эксклюзивные ресурсы сервера",
        "Все протоколы + экспериментальные",
        "Приватный выделенный доступ",
        "Продвинутые цепи маршрутизации",
        "Настраиваемая переадресация портов",
        "API доступ для автоматизации",
        "Продвинутые правила маршрутизации",
        "Белые конфигурации под брендом",
        "Техническая поддержка 24/7",
        "Оптимизация балансировки нагрузки",
        "Кастомные DNS серверы",
        "Оптимизация разблокировки контента",
        "Гарантия отсутствия логов",
      ]),
      price: 800.00,
      currency: "RUB",
      durationDays: 30,
      maxDevices: 999, // Unlimited (large number)
      maxBandwidth: null,
      protocols: JSON.stringify(["VLESS", "VMESS", "V2Ray", "Shadowsocks", "Trojan", "WireGuard", "Hysteria2"]),
      isActive: true,
      sortOrder: 4,
    }
  ];

  for (const plan of plans) {
    const created = await db.vpnPlan.create({
      data: plan,
    });
    console.log(`✅ Created plan: ${created.nameRu} (${created.id})`);
  }

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(() => {
    void db.$disconnect();
  }); 