import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Providers } from "@/providers";
import { MainLayout } from "@/components/layout/main-layout";
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
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className={`${beVietnamPro.variable} font-sans antialiased`}>
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
