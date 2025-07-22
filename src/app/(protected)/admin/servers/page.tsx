import { Suspense } from "react";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { CheckCircle, XCircle, Activity } from "lucide-react";
import { api } from "~/trpc/server";

export default function AdminServersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Управление серверами</h1>
        <p className="text-muted-foreground">
          Мониторинг и управление VPN серверами
        </p>
      </div>

      <Suspense fallback={<ServersListSkeleton />}>
        <ServersList />
      </Suspense>
    </div>
  );
}

async function ServersList() {
  const servers = await api.admin.servers.getAll();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">VPN Серверы</h3>
      </div>

      {servers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Серверы не настроены</p>
          <p className="text-sm mt-2">Добавьте серверы для работы VPN сервиса</p>
        </div>
      ) : (
        <div className="space-y-4">
          {servers.map((server) => (
            <div key={server.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                {server.isActive ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{server.name}</h4>
                  <Badge variant={server.isActive ? "default" : "secondary"}>
                    {server.isActive ? "Активный" : "Неактивный"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {server.locationRu} • {server.host}:{server.port}
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {server.currentLoad}/{server.maxClients}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Нагрузка: {Math.round((server.currentLoad / server.maxClients) * 100)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ServersListSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 