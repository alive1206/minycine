import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { PwaInstallButtons } from "@/components/pwa/pwa-install-buttons";

const discoverLinks = [
  { name: "Phim Mới", href: "/phim-moi" },
  { name: "Phim Lẻ", href: "/danh-sach/phim-le" },
  { name: "Phim Bộ", href: "/danh-sach/phim-bo" },
  { name: "TV Shows", href: "/danh-sach/tv-shows" },
];

const supportLinks = [
  { name: "Liên Hệ", href: "#" },
  { name: "Câu Hỏi Thường Gặp", href: "#" },
  { name: "Góp Ý", href: "#" },
];

const infoLinks = [
  { name: "Điều Khoản Sử Dụng", href: "#" },
  { name: "Chính Sách Bảo Mật", href: "#" },
  { name: "Bản Quyền", href: "#" },
];

export const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8">
      <div className="px-4 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Logo size="md" />
            <p className="text-gray-400 text-sm leading-relaxed">
              Trải nghiệm điện ảnh đỉnh cao ngay tại nhà với kho phim khổng lồ
              chất lượng cao, cập nhật liên tục.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-white font-bold mb-4">Khám Phá</h3>
            <ul className="flex flex-col gap-2 text-sm text-gray-400">
              {discoverLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold mb-4">Hỗ Trợ</h3>
            <ul className="flex flex-col gap-2 text-sm text-gray-400">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-bold mb-4">Thông Tin</h3>
            <ul className="flex flex-col gap-2 text-sm text-gray-400">
              {infoLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Install App */}
          <div>
            <PwaInstallButtons />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} MinyCine. All rights reserved.</p>
          <p>Designed for premium entertainment experience.</p>
        </div>
      </div>
    </footer>
  );
};
