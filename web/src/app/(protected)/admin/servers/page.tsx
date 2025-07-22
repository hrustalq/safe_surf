import { Suspense } from "react";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { ServersStats } from "./_components/servers-stats";
import { ServersList } from "./_components/servers-list";
import { AddServerForm } from "./_components/add-server-form";
import { HydrateClient } from "~/trpc/server";

export default function AdminServersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Управление Outbound серверами</h1>
        <p className="text-muted-foreground">
          Управление outbound конфигурациями 3X-UI для маршрутизации VPN трафика
        </p>
      </div>

      {/* Servers Stats */}
      <Suspense fallback={<ServersStatsSkeleton />}>
        <ServersStats />
      </Suspense>

      {/* Servers List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Outbound Серверы</h3>
          <HydrateClient>
            <AddServerForm />
          </HydrateClient>
        </div>
        <Suspense fallback={<ServersListSkeleton />}>
          <ServersList />
        </Suspense>
      </Card>
    </div>
  );
}

function ServersStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function ServersListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
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
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
} 