import { Search, Home, ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export default function NotFound() {
  const helpfulLinks = [
    { href: "/", label: "Главная страница", icon: Home },
    { href: "/#pricing", label: "Тарифы", icon: Shield },
    { href: "/#features", label: "Возможности", icon: Search },
    { href: "/contact", label: "Связаться с нами", icon: ArrowLeft },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/10 p-4">
      <Card className="w-full max-w-lg p-8 text-center">
        <div className="mb-8">
          {/* Animated 404 */}
          <div className="relative mb-6">
            <div className="text-8xl font-bold text-primary/20 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="h-12 w-12 text-primary animate-pulse" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-3">
            Страница не найдена
          </h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            К сожалению, запрашиваемая страница не существует или была перемещена. 
            Но не беспокойтесь — ваша безопасность по-прежнему под защитой!
          </p>
        </div>

        {/* Helpful Navigation */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Полезные ссылки:
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {helpfulLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                variant="outline"
                size="sm"
                className="justify-start text-left"
              >
                <Link href={link.href}>
                  <link.icon className="h-4 w-4 mr-2" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Main Action */}
        <Button asChild className="w-full" size="lg">
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Вернуться на главную
          </Link>
        </Button>

        {/* Search Suggestion */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Искали что-то конкретное?{" "}
            <Link 
              href="/contact" 
              className="text-primary hover:underline"
            >
              Напишите нам
            </Link>
            {" "}— мы поможем найти нужную информацию.
          </p>
        </div>

        {/* Fun VPN Fact */}
        <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Знали ли вы?</strong> SafeSurf VPN шифрует ваш трафик даже на несуществующих страницах!
          </p>
        </div>
      </Card>
    </div>
  );
} 