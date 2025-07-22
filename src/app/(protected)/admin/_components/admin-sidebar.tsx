import Link from "next/link";
import {
  BarChart3,
  Users,
  CreditCard,
  Settings,
  Server,
  Shield,
  Database,
  UserCheck,
  Monitor,
  TrendingUp,
} from "lucide-react";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

const adminNavItems = [
  {
    title: "Обзор",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Пользователи",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Подписки",
    href: "/admin/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Серверы",
    href: "/admin/servers",
    icon: Server,
  },
  {
    title: "3X-UI Панель",
    href: "/admin/panels",
    icon: Monitor,
  },
  {
    title: "Трафик",
    href: "/admin/traffic",
    icon: TrendingUp,
  },
  {
    title: "VPN Планы",
    href: "/admin/plans",
    icon: Shield,
  },
  {
    title: "Системные логи",
    href: "/admin/logs",
    icon: Database,
  },
  {
    title: "Настройки",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  return (
    <Card className="w-64 min-h-screen rounded-none border-r border-l-0 border-t-0 border-b-0 flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">Админ панель</h2>
        </div>
        <Badge variant="secondary" className="mt-2 text-xs">
          SafeSurf Admin
        </Badge>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {adminNavItems.map((item) => (
            <li key={item.href}>
              <AdminNavLink
                href={item.href}
                icon={item.icon}
                title={item.title}
              />
            </li>
          ))}
        </ul>
      </nav>
    </Card>
  );
}

function AdminNavLink({
  href,
  icon: Icon,
  title,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  // For server component, we can't use usePathname directly
  // We'll handle active state with CSS or separate client component if needed
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
    >
      <Icon className="h-4 w-4" />
      <span>{title}</span>
    </Link>
  );
} 