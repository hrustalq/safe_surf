import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsForm } from "./_components/settings-form";
import { PasswordChangeForm } from "./_components/password-change-form";
import { DeleteAccountForm } from "./_components/delete-account-form";
import { NotificationSettings } from "./_components/notification-settings";
import { SecuritySettings } from "./_components/security-settings";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { User, Lock, Bell, Shield, Trash2 } from "lucide-react";
import { auth } from "~/server/auth";

export const metadata: Metadata = {
  title: "Настройки - SafeSurf VPN",
  description: "Управление настройками аккаунта и безопасности",
};

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Настройки</h1>
        <p className="text-muted-foreground mt-2">
          Управляйте настройками вашего аккаунта и предпочтениями
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Общие
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Безопасность
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Пароль
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Удаление
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">Общие настройки</h2>
              <p className="text-muted-foreground mt-1">
                Управляйте основной информацией вашего аккаунта
              </p>
            </div>
            <SettingsForm user={session.user} />
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">Настройки безопасности</h2>
              <p className="text-muted-foreground mt-1">
                Управляйте параметрами безопасности вашего аккаунта
              </p>
            </div>
            <SecuritySettings user={session.user} />
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-6">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">Изменение пароля</h2>
              <p className="text-muted-foreground mt-1">
                Обновите пароль для обеспечения безопасности аккаунта
              </p>
            </div>
            <PasswordChangeForm />
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">Настройки уведомлений</h2>
              <p className="text-muted-foreground mt-1">
                Выберите, какие уведомления вы хотите получать
              </p>
            </div>
            <NotificationSettings />
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-6">
          <Card className="p-6 border-red-200 dark:border-red-800">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Опасная зона</h2>
              <p className="text-muted-foreground mt-1">
                Необратимые действия с вашим аккаунтом
              </p>
            </div>
            <DeleteAccountForm />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}