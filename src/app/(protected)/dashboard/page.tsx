import { type Metadata } from "next";
import { DashboardStats } from "./_components/dashboard-stats";
import { ConnectionStatus } from "./_components/connection-status";
import { RecentActivity } from "./_components/recent-activity";
import { SubscriptionUrl } from "./_components/subscription-url";

export const metadata: Metadata = {
  title: "Панель управления - SafeSurf VPN",
  description: "Обзор ваших VPN подключений, подписок и статистики использования",
};

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
        <p className="text-muted-foreground">
          Обзор вашего VPN подключения и статистики использования
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Connection Status */}
      <ConnectionStatus />

      {/* VPN Configuration */}
      <SubscriptionUrl />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
} 