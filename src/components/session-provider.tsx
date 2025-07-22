import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { auth } from "~/server/auth";

export default async function SessionProvider({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>;
}
