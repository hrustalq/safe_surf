import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";

const inter = Inter({
  subsets: ["latin", "cyrillic-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Панель управления - SafeSurf VPN",
  description: "Управляйте вашими VPN подключениями, подписками и настройками безопасности",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
						<SidebarTrigger className="-ml-1" />
						<div className="flex-1">
							<h1 className="text-lg font-semibold">SafeSurf VPN</h1>
						</div>
					</header>
					<main className="flex-1 overflow-auto p-4">
						{children}
					</main>
				</SidebarInset>
			</SidebarProvider>
    </div>
  );
} 