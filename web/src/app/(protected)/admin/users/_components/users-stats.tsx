import { Users, UserCheck, UserX } from "lucide-react";
import { Card } from "~/components/ui/card";
import { api } from "~/trpc/server";

export async function UsersStats() {
  const [
    totalUsers,
    usersWithSubscriptions,
    usersWithoutSubscriptions
  ] = await Promise.all([
    api.admin.users.getTotalCount(),
    api.admin.users.getWithSubscriptions(),
    api.admin.users.getWithoutSubscriptions(),
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Всего пользователей"
        value={totalUsers.toString()}
        icon={Users}
        description="Общее количество"
      />
      
      <StatCard
        title="С подписками"
        value={usersWithSubscriptions.toString()}
        icon={UserCheck}
        description="Активные подписчики"
      />
      
      <StatCard
        title="Без подписок"
        value={usersWithoutSubscriptions.toString()}
        icon={UserX}
        description="Потенциальные клиенты"
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  );
} 