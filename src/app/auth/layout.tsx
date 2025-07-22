import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Авторизация - SafeSurf VPN",
  description: "Войти в личный кабинет SafeSurf VPN",
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  // Check if user is already authenticated - redirect to dashboard if they are
  const session = await auth();
  if (session?.user) {
    redirect('/dashboard');
  }

  return <SessionProvider session={session}>{children}</SessionProvider>;
} 
