import { Suspense } from "react";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { PanelsStats } from "./_components/panels-stats";
import { PanelsList } from "./_components/panels-list";
import { AddPanelForm } from "./_components/add-panel-form";
import { HydrateClient } from "~/trpc/server";

export default function AdminPanelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Управление 3X-UI панелями</h1>
        <p className="text-muted-foreground">
          Настройка и управление панелями 3X-UI для централизованного контроля outbound серверов
        </p>
      </div>

      {/* Panels Stats */}
      <Suspense fallback={<PanelsStatsSkeleton />}>
        <PanelsStats />
      </Suspense>

      {/* Panels List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">3X-UI Панели</h3>
          <HydrateClient>
            <AddPanelForm />
          </HydrateClient>
        </div>
        <Suspense fallback={<PanelsListSkeleton />}>
          <PanelsList />
        </Suspense>
      </Card>
    </div>
  );
}

function PanelsStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
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

function PanelsListSkeleton() {
  return (
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
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
} 