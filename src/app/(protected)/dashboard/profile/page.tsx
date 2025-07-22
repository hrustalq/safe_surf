import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "./_components/profile-form";
import { AccountInfo } from "./_components/account-info";
import { ActivityHistory } from "./_components/activity-history";
import { SubscriptionOverview } from "./_components/subscription-overview";
import { Card } from "~/components/ui/card";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { User, Calendar, Shield, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Профиль - SafeSurf VPN",
  description: "Ваш профиль пользователя и информация об аккаунте",
};

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch user subscription and activity data
  const userActivity = await api.user.getActivity().catch(() => []);
  const userSubscription = null; // Will be implemented when subscription API is ready

  const user = session.user;
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Профиль</h1>
        <p className="text-muted-foreground mt-2">
          Управляйте информацией профиля и просматривайте активность аккаунта
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Header */}
          <Card className="p-6">
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {user.name ?? "Пользователь"}
              </h2>
              <p className="text-muted-foreground mb-4">{user.email}</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant="outline">
                  Активный пользователь
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  ID: {user.id}
                </div>
              </div>
            </div>
          </Card>

          {/* Account Info */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <User className="h-5 w-5" />
                Информация об аккаунте
              </h3>
            </div>
            <AccountInfo user={{
              id: user.id,
              name: user.name,
              email: user.email,
              emailVerified: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }} />
          </Card>

          {/* Subscription Overview */}
          {userSubscription && (
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Подписка
                </h3>
              </div>
              <SubscriptionOverview subscription={userSubscription} />
            </Card>
          )}
        </div>

        {/* Right Column - Forms and Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Edit Form */}
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground">Редактировать профиль</h3>
              <p className="text-muted-foreground mt-1">
                Обновите информацию вашего профиля
              </p>
            </div>
            <ProfileForm user={{
              id: user.id,
              name: user.name,
              email: user.email,
            }} />
          </Card>

          {/* Activity History */}
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5" />
                История активности
              </h3>
              <p className="text-muted-foreground mt-1">
                Последние действия в вашем аккаунте
              </p>
            </div>
            <ActivityHistory activities={Array.isArray(userActivity) ? userActivity : []} />
          </Card>
        </div>
      </div>
    </div>
  );
}