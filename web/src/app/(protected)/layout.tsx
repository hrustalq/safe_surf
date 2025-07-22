import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=%2Fdashboard');
  }
  return (<SessionProvider session={session}>
		<TRPCReactProvider>
		{children}
		</TRPCReactProvider>
	</SessionProvider>);
}
