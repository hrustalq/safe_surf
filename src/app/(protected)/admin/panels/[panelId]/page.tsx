import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, Activity, Users, Server, Settings, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/server";
import { HydrateClient } from "~/trpc/server";
import { PanelOverview } from "./_components/panel-overview";
import { PanelInbounds } from "./_components/panel-inbounds";
import { PanelClients } from "./_components/panel-clients";
import { PanelServerStatus } from "./_components/panel-server-status";
import { PanelServerLogs } from "./_components/panel-server-logs";
import { PanelConfiguration } from "./_components/panel-configuration";

interface PanelDetailPageProps {
  params: Promise<
	{
    panelId: string;
  }>;
}

export default async function PanelDetailPage({ params }: PanelDetailPageProps) {
  try {
    const { panelId } = await params;

    const panelData = await api.admin.panels.getDetailedInfo({ id: panelId });

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/panels">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к панелям
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{panelData.panel.name}</h1>
              <Badge 
                variant={panelData.connectionStatus ? "default" : "destructive"}
                className="text-xs"
              >
                {panelData.connectionStatus ? "Подключена" : "Не подключена"}
              </Badge>
              <Badge 
                variant={panelData.panel.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {panelData.panel.isActive ? "Активная" : "Неактивная"}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {panelData.panel.apiUrl}
            </p>
          </div>
        </div>

        {/* Overview Cards */}
        <Suspense fallback={<OverviewSkeleton />}>
          <PanelOverview panelData={panelData} />
        </Suspense>

        {/* Main Content Tabs */}
        <Tabs defaultValue="inbounds" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="inbounds" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Inbound&apos;ы
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Клиенты
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Статус сервера
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Логи сервера
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Конфигурация
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbounds">
            <HydrateClient>
              <Suspense fallback={<ContentSkeleton />}>
                <PanelInbounds panelId={panelId} />
              </Suspense>
            </HydrateClient>
          </TabsContent>

          <TabsContent value="clients">
            <HydrateClient>
              <Suspense fallback={<ContentSkeleton />}>
                <PanelClients panelId={panelId} />
              </Suspense>
            </HydrateClient>
          </TabsContent>

          <TabsContent value="status">
            <Suspense fallback={<ContentSkeleton />}>
              <PanelServerStatus panelData={panelData} />
            </Suspense>
          </TabsContent>

          <TabsContent value="logs">
            <Suspense fallback={<ContentSkeleton />}>
              <PanelServerLogs serverLogs={panelData.serverLogs} />
            </Suspense>
          </TabsContent>

          <TabsContent value="config">
            <Suspense fallback={<ContentSkeleton />}>
              <PanelConfiguration panel={panelData.panel} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error("Panel not found:", error);
    notFound();
  }
}

function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-12" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 