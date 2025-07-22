import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar, Clock, CreditCard, CheckCircle } from "lucide-react";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

import { api } from "~/trpc/server";

export async function UserSubscriptionStatus() {
  const subscription = await api.subscription.getUserSubscription();

  if (!subscription) {
    return (
      <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-primary/5 dark:from-blue-950/50 dark:to-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Активная подписка отсутствует
            </h3>
            <p className="text-muted-foreground">
              Выберите подходящий план для защиты вашего соединения
            </p>
          </div>
          <div className="text-right">
            <Badge variant="secondary">Нет подписки</Badge>
          </div>
        </div>
      </Card>
    );
  }

  const isExpired = new Date(subscription.endDate) < new Date();
  const daysLeft = Math.ceil(
    (new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="p-6 mb-8 bg-gradient-to-r from-green-50 to-primary/5 dark:from-green-950/50 dark:to-primary/5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <CheckCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              Активная подписка: {subscription.plan.nameRu}
            </h3>
            <p className="text-sm text-muted-foreground">
              {subscription.plan.descriptionRu}
            </p>
          </div>
        </div>
        <Badge 
          variant={isExpired ? "destructive" : "default"}
          className="ml-2"
        >
          {isExpired ? "Истекла" : "Активна"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Начало</p>
            <p className="text-sm font-medium">
              {format(new Date(subscription.startDate), "d MMM yyyy", { locale: ru })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Окончание</p>
            <p className="text-sm font-medium">
              {format(new Date(subscription.endDate), "d MMM yyyy", { locale: ru })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Стоимость</p>
            <p className="text-sm font-medium">
              ${subscription.plan.price}/мес
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{subscription.plan.maxDevices} устройств</span>
          <span>•</span>
          <span>{subscription.plan.protocols.join(", ")}</span>
        </div>
        
        {!isExpired && (
          <div className="text-right">
            <p className="text-sm font-medium">
              {daysLeft > 0 ? `${daysLeft} дней осталось` : "Истекает сегодня"}
            </p>
          </div>
        )}
      </div>

      {isExpired && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Ваша подписка истекла. Продлите её, чтобы продолжить пользоваться VPN.
          </p>
        </div>
      )}
    </Card>
  );
} 