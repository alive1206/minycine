import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Ký — MinyCine",
  description:
    "Tạo tài khoản MinyCine miễn phí để xem phim online chất lượng cao.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
