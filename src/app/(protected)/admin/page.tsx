import { Suspense } from "react";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { AdminStats } from "./_components/admin-stats";
import { RecentUsers } from "./_components/recent-users";
import { SystemOverview } from "./_components/system-overview";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Админ панель</h1>
        <p className="text-muted-foreground">
          Обзор системы и управление SafeSurf VPN
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <AdminStats />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Overview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Обзор системы</h3>
          <Suspense fallback={<SystemOverviewSkeleton />}>
            <SystemOverview />
          </Suspense>
        </Card>

        {/* Recent Users */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Новые пользователи</h3>
          <Suspense fallback={<RecentUsersSkeleton />}>
            <RecentUsers />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

function SystemOverviewSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

function RecentUsersSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
} 