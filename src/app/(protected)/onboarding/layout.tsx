import { TRPCReactProvider } from "~/trpc/react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <TRPCReactProvider>{children}</TRPCReactProvider>;
}
