import { type Metadata } from "next";
import { Suspense } from "react";
import { HeroSection } from "~/app/_components/landing/hero-section";
import { FeaturesSection } from "~/app/_components/landing/features-section";
import { PricingSection } from "~/app/_components/landing/pricing-section";
import { Header } from "~/app/_components/landing/header";
import { Footer } from "~/app/_components/landing/footer";
import { LoadingSection } from "~/components/ui/loading-spinner";

export const metadata: Metadata = {
  title: "SafeSurf VPN - Надёжный VPN с высокой скоростью",
  description: "Надёжный VPN сервис с высокоскоростным сервером и поддержкой современных протоколов VLESS и VMESS. Быстрый и стабильный интернет, безлимитный трафик.",
  keywords: "VPN, VLESS, VMESS, V2Ray, защита, анонимность, безопасность, интернет, Россия",
  authors: [{ name: "SafeSurf Team" }],
  creator: "SafeSurf",
  publisher: "SafeSurf",
  openGraph: {
    title: "SafeSurf VPN - Надёжный VPN с высокой скоростью",
    description: "Надёжный VPN сервис с высокоскоростным сервером и современными протоколами VLESS и VMESS",
    url: "https://safesurf.tech",
    siteName: "SafeSurf VPN",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SafeSurf VPN - Защищённый интернет",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SafeSurf VPN - Надёжный VPN с высокой скоростью",
    description: "Надёжный VPN сервис с высокоскоростным сервером",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mt-14">
        <HeroSection />
        <FeaturesSection />
        <Suspense fallback={<LoadingSection />}>
          <PricingSection />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
