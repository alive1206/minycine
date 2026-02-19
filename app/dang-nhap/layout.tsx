import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Nhập — MinyCine",
  description:
    "Đăng nhập vào tài khoản MinyCine để xem phim online chất lượng cao.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
