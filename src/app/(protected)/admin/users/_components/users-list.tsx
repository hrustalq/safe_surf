import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/server";
import { UserActions } from "./user-actions";

export async function UsersList() {
  const users = await api.admin.users.getAll();

  if (!users.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Пользователи не найдены</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback>
              {user.name
                ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                : user.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">
                {user.name ?? user.email?.split('@')[0]}
              </h4>
              <Badge 
                variant={user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? "default" : "secondary"}
                className="text-xs"
              >
                {user.role === "ADMIN" ? "Админ" : user.role === "SUPER_ADMIN" ? "Супер админ" : "Пользователь"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
            <p className="text-xs text-muted-foreground">
              Регистрация: {format(new Date(user.createdAt), "d MMM yyyy", { locale: ru })}
            </p>
          </div>

          <div className="text-right min-w-0">
            <Badge 
              variant={user._count.subscriptions > 0 ? "default" : "secondary"}
              className="mb-2"
            >
              {user._count.subscriptions > 0 ? `${user._count.subscriptions} подписок` : "Без подписки"}
            </Badge>
            {user.subscriptions.length > 0 && (
              <div className="text-xs text-muted-foreground">
                План: {user.subscriptions[0]?.plan.nameRu}
              </div>
            )}
          </div>

          <UserActions userId={user.id} currentRole={user.role} />
        </div>
      ))}
    </div>
  );
} 