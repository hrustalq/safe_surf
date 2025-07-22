"use client";

import { Badge } from "~/components/ui/badge";
import { 
  Calendar, 
  Mail, 
  User, 
  Shield, 
  CheckCircle, 
  XCircle,
  Clock
} from "lucide-react";

interface AccountInfoProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    emailVerified?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    // Add other user properties as needed
  };
}

export function AccountInfo({ user }: AccountInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">ID пользователя</p>
          <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Email</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.emailVerified ? (
              <Badge variant="success" className="gap-1 text-xs">
                <CheckCircle className="h-3 w-3" />
                Подтвержден
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1 text-xs">
                <XCircle className="h-3 w-3" />
                Не подтвержден
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
          <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Дата регистрации</p>
          <p className="text-sm text-muted-foreground">
            {new Date(user.createdAt).toLocaleDateString("ru-RU", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
          <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Последнее обновление</p>
          <p className="text-sm text-muted-foreground">
            {new Date(user.updatedAt).toLocaleDateString("ru-RU", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
          <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Статус аккаунта</p>
          <Badge variant="success" className="mt-1">
            Активен
          </Badge>
        </div>
      </div>
    </div>
  );
}