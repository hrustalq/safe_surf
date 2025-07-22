"use client";

import { Home, Settings, Shield, User, LogOut, UserCog } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export function AppSidebar() {
  const { data: session } = useSession();

  const baseMenuItems = [
    {
      title: "Главная",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Подписки",
      url: "/subscriptions",
      icon: Shield,
    },
    {
      title: "Профиль",
      url: "/dashboard/profile",
      icon: User,
    },
    {
      title: "Настройки",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const adminMenuItems = [
    {
      title: "Админ панель",
      url: "/admin",
      icon: UserCog,
    },
  ];

  // Add admin items if user is admin or super admin
  const menuItems = [
    ...baseMenuItems,
    ...(session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN" ? adminMenuItems : [])
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">SafeSurf</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        {session?.user && (
          <div className="p-2">
            <div className="flex items-center gap-2 pb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image ?? ""} />
                <AvatarFallback>
                  {session.user.name?.charAt(0)?.toUpperCase() ?? "У"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium truncate">
                  {session.user.name}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {session.user.email}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
} 