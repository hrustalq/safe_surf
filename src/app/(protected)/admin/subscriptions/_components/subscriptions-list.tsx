import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/server";
import { SubscriptionActions } from "./subscription-actions";

export async function SubscriptionsList() {
  const subscriptions = await api.admin.subscriptions.getAll();

  if (!subscriptions.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Подписки не найдены</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => {
        const isExpired = new Date(subscription.endDate) < new Date();
        const daysLeft = Math.ceil(
          (new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        return (
          <div key={subscription.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <Avatar className="h-10 w-10">
              <AvatarImage src={subscription.user.image ?? undefined} />
              <AvatarFallback>
                {subscription.user.name
                  ? subscription.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  : subscription.user.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">
                  {subscription.user.name ?? subscription.user.email?.split('@')[0]}
                </h4>
                <Badge 
                  variant={subscription.status === "ACTIVE" && !isExpired ? "default" : 
                          subscription.status === "EXPIRED" || isExpired ? "destructive" :
                          subscription.status === "PENDING" ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {subscription.status === "ACTIVE" && !isExpired ? "Активна" :
                   subscription.status === "EXPIRED" || isExpired ? "Истекла" :
                   subscription.status === "PENDING" ? "Ожидает" : subscription.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {subscription.user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                План: {subscription.plan.nameRu} • ${subscription.plan.price.toString()}/мес
              </p>
            </div>

            <div className="text-right min-w-0">
              <p className="text-sm font-medium mb-1">
                {format(new Date(subscription.startDate), "d MMM", { locale: ru })} - {format(new Date(subscription.endDate), "d MMM yyyy", { locale: ru })}
              </p>
              <p className="text-xs text-muted-foreground">
                {!isExpired ? `${daysLeft > 0 ? daysLeft : 0} дней осталось` : "Истекла"}
              </p>
              <p className="text-xs text-muted-foreground">
                {subscription.plan.maxDevices} устройств
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold">
                ${subscription.plan.price.toString()}
              </p>
              <p className="text-xs text-muted-foreground">
                за месяц
              </p>
            </div>

            <SubscriptionActions 
              subscriptionId={subscription.id} 
              currentStatus={subscription.status}
              isExpired={isExpired}
            />
          </div>
        );
      })}
    </div>
  );
} 