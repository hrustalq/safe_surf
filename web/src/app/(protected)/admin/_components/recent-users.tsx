import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/server";

export async function RecentUsers() {
  const recentUsers = await api.admin.users.getRecent();

  if (!recentUsers.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Нет новых пользователей</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentUsers.map((user) => (
        <div key={user.id} className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-xs">
              {user.name
                ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                : user.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">
                {user.name ?? user.email?.split('@')[0]}
              </p>
              <Badge 
                variant={user.role === "ADMIN" ? "default" : "secondary"}
                className="text-xs"
              >
                {user.role === "ADMIN" ? "Админ" : "Пользователь"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(user.createdAt), "d MMM yyyy", { locale: ru })}
            </p>
          </div>

          <div className="text-right">
            <Badge variant={user.subscriptions.length > 0 ? "default" : "secondary"}>
              {user.subscriptions.length > 0 ? "Подписан" : "Без подписки"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
} 