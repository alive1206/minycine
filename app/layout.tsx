import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Providers } from "@/providers";
import { MainLayout } from "@/components/layout/main-layout";
import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker-registrar";
import { SplashScreen } from "@/components/pwa/splash-screen";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MinyCine — Xem Phim Online Chất Lượng Cao",
    template: "%s",
  },
  description:
    "Trải nghiệm điện ảnh đỉnh cao với kho phim khổng lồ, chất lượng HD, cập nhật liên tục. Phim bộ, phim lẻ, phim mới nhất — tất cả tại MinyCine.",
  keywords: ["xem phim", "phim online", "phim hay", "MinyCine", "phim HD"],
  icons: {
    icon: "/favicon.svg?v=4",
    apple: "/icons/icon-192.png?v=4",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MinyCine",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className={`${beVietnamPro.variable} font-sans antialiased`}>
        <SplashScreen />
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
