import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { AdminSidebar } from "./_components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1 min-h-screen overflow-auto p-6 bg-background">
        {children}
      </main>
    </div>
  );
} 