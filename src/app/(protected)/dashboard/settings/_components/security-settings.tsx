"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { 
  Shield, 
  Smartphone, 
  Key, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { api } from "~/trpc/react";

interface SecuritySettingsProps {
  user: {
    id: string;
    email?: string | null;
    emailVerified?: Date | null;
    // Add other user properties as needed
  };
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const resendVerificationEmail = api.user.resendVerificationEmail.useMutation({
    onSuccess: () => {
      toast.success("Письмо подтверждения отправлено");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при отправке письма");
    },
  });

  const enable2FA = api.user.enable2FA.useMutation({
    onSuccess: () => {
      setTwoFactorEnabled(true);
      toast.success("Двухфакторная аутентификация включена");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при включении 2FA");
    },
  });

  const disable2FA = api.user.disable2FA.useMutation({
    onSuccess: () => {
      setTwoFactorEnabled(false);
      toast.success("Двухфакторная аутентификация отключена");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при отключении 2FA");
    },
  });

  const revokeAllSessions = api.user.revokeAllSessions.useMutation({
    onSuccess: () => {
      toast.success("Все сессии отозваны");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при отзыве сессий");
    },
  });

  return (
    <div className="space-y-6">
      {/* Email Verification */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium">Подтверждение email</h4>
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.emailVerified ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Подтвержден
              </Badge>
            ) : (
              <>
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Не подтвержден
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resendVerificationEmail.mutate()}
                  disabled={resendVerificationEmail.isPending}
                >
                  {resendVerificationEmail.isPending ? "Отправка..." : "Подтвердить"}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-medium">Двухфакторная аутентификация</h4>
              <p className="text-sm text-muted-foreground">
                Дополнительная защита для входа в аккаунт
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  enable2FA.mutate();
                } else {
                  disable2FA.mutate();
                }
              }}
              disabled={enable2FA.isPending || disable2FA.isPending}
            />
          </div>
        </div>
      </Card>

      {/* API Keys */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Key className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium">API ключи</h4>
              <p className="text-sm text-muted-foreground">
                Управление ключами для доступа к API
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline">
            Управлять
          </Button>
        </div>
      </Card>

      {/* Active Sessions */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="font-medium">Активные сессии</h4>
              <p className="text-sm text-muted-foreground">
                Устройства, с которых вы входили в аккаунт
              </p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline">
                Отозвать все
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Отозвать все сессии
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие завершит все активные сессии на всех устройствах. 
                  Вам потребуется войти в систему заново.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => revokeAllSessions.mutate()}
                  disabled={revokeAllSessions.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {revokeAllSessions.isPending ? "Отзыв..." : "Отозвать все"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>

      {/* Security Recommendations */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Рекомендации по безопасности
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Используйте уникальный и сложный пароль</li>
          <li>• Включите двухфакторную аутентификацию</li>
          <li>• Регулярно проверяйте активные сессии</li>
          <li>• Не делитесь данными доступа с другими</li>
        </ul>
      </Card>
    </div>
  );
}