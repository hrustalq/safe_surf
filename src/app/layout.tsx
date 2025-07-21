import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "~/components/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL('https://safesurf.tech'),
  title: "SafeSurf VPN - Защищённый интернет с современными протоколами",
  description: "Премиальный VPN сервис с поддержкой современных протоколов VLESS и VMESS на базе V2Ray. Полная анонимность, высокие скорости, безлимитный трафик.",
  keywords: "VPN, VLESS, VMESS, V2Ray, защита, анонимность, безопасность, интернет, Россия",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "SafeSurf VPN - Защищённый интернет с современными протоколами",
    description: "Премиальный VPN сервис с поддержкой современных протоколов VLESS и VMESS на базе V2Ray",
    url: "https://safesurf.tech",
    siteName: "SafeSurf VPN",
    locale: "ru_RU",
    type: "website",
  },
};

const inter = Inter({
  subsets: ["latin", "cyrillic-ext"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SafeSurf VPN",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": ["Windows", "macOS", "Linux", "iOS", "Android"],
    "description": "Премиальный VPN сервис с поддержкой современных протоколов VLESS и VMESS на базе V2Ray. Полная анонимность, высокие скорости, безлимитный трафик.",
    "url": "https://safesurf.tech",
    "downloadUrl": "https://safesurf.tech/download",
    "softwareVersion": "1.0",
    "datePublished": "2024-01-01",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "5.99",
      "highPrice": "19.99",
      "priceCurrency": "USD",
      "offerCount": "3"
    },
    "provider": {
      "@type": "Organization",
      "name": "SafeSurf Team",
      "url": "https://safesurf.tech",
      "logo": "https://safesurf.tech/logo.png"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "10000",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": [
      "VLESS протокол",
      "VMESS протокол", 
      "V2Ray поддержка",
      "50+ серверов",
      "25+ стран",
      "Kill Switch",
      "DNS защита",
      "No-logs политика",
      "AES-256 шифрование"
    ]
  };

  return (
    <html lang="ru" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
