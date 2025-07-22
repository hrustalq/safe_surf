import { type Metadata } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";
import { ThemeProvider } from "~/components/theme-provider";

const inter = Inter({
  subsets: ["latin", "cyrillic-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SafeSurf VPN - Защищённый интернет с современными протоколами",
  description: "Премиальный VPN сервис с поддержкой современных протоколов VLESS и VMESS на базе V2Ray. Полная анонимность, высокие скорости, безлимитный трафик.",
  keywords: "VPN, VLESS, VMESS, V2Ray, защита, анонимность, безопасность, интернет, Россия",
  authors: [{ name: "SafeSurf Team" }],
  creator: "SafeSurf",
  publisher: "SafeSurf",
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
  openGraph: {
    title: "SafeSurf VPN - Защищённый интернет с современными протоколами",
    description: "Премиальный VPN сервис с поддержкой современных протоколов VLESS и VMESS на базе V2Ray",
    url: "https://safesurf.tech",
    siteName: "SafeSurf VPN",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SafeSurf VPN - Защищённый интернет",
    description: "Премиальный VPN сервис с современными протоколами",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <html lang="ru" className={`${inter.variable} scroll-smooth`}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="color-scheme" content="dark light" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://safesurf.tech" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "SafeSurf VPN",
              "description": "Премиальный VPN сервис с поддержкой современных протоколов VLESS и VMESS на базе V2Ray",
              "operatingSystem": "Windows, macOS, Linux, iOS, Android",
              "applicationCategory": "SecurityApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </Head>
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