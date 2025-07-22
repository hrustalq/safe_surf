import { CheckCircle, ArrowRight, Download, Shield } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">
            Платёж успешно обработан!
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Ваша подписка на SafeSurf VPN активирована. 
            Теперь вы можете пользоваться всеми преимуществами защищённого интернета.
          </p>
        </div>

        <Card className="p-8 mb-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Подписка активирована</h3>
                <p className="text-sm text-muted-foreground">
                  Ваш аккаунт готов к использованию
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Конфигурация готова</h3>
                <p className="text-sm text-muted-foreground">
                  VPN конфигурации будут доступны в личном кабинете
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Link href="/dashboard">
            <Button size="lg" className="w-full">
              Перейти в личный кабинет
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>

          <Link href="/download">
            <Button variant="outline" size="lg" className="w-full">
              Скачать приложения
              <Download className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Что дальше?</strong> Перейдите в личный кабинет для получения конфигураций VPN 
            и инструкций по настройке на ваших устройствах.
          </p>
        </div>
      </div>
    </div>
  );
} 