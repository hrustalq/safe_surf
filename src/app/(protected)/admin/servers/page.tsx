import { Suspense } from "react";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { ServersStats } from "./_components/servers-stats";
import { ServersList } from "./_components/servers-list";
import { AddServerForm } from "./_components/add-server-form";
import { ProvisionServerForm } from "./_components/provision-server-form";
import { ProvisionedServersList } from "./_components/provisioned-servers-list";
import { HydrateClient } from "~/trpc/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Server, Cloud } from "lucide-react";

export default function AdminServersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Управление серверами</h1>
        <p className="text-muted-foreground">
          Управление outbound серверами для маршрутизации VPN трафика и автоматическое провизионирование
        </p>
      </div>

      {/* Servers Stats */}
      <Suspense fallback={<ServersStatsSkeleton />}>
        <ServersStats />
      </Suspense>

      {/* Server Management Tabs */}
      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Ручные серверы
          </TabsTrigger>
          <TabsTrigger value="provisioned" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Digital Ocean
          </TabsTrigger>
        </TabsList>

        {/* Manual Servers Tab */}
        <TabsContent value="manual" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Ручные Outbound серверы</h3>
                <p className="text-sm text-muted-foreground">
                  Серверы, добавленные вручную через конфигурацию 3X-UI
                </p>
              </div>
              <HydrateClient>
                <AddServerForm />
              </HydrateClient>
            </div>
            <Suspense fallback={<ServersListSkeleton />}>
              <ServersList />
            </Suspense>
          </Card>
        </TabsContent>

        {/* Digital Ocean Provisioned Servers Tab */}
        <TabsContent value="provisioned" className="space-y-6">
          {/* Provision Server Form */}
          <HydrateClient>
            <ProvisionServerForm />
          </HydrateClient>

          {/* Provisioned Servers List */}
          <Suspense fallback={<ProvisionedServersListSkeleton />}>
            <ProvisionedServersList />
          </Suspense>
        </TabsContent>
      </Tabs>
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
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-5 w-5 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProvisionedServersListSkeleton() {
  return (
    <Card>
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-3 w-40 mt-1" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
} 