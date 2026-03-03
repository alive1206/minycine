import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { PullToRefresh } from "@/components/pwa/pull-to-refresh";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D0D] overflow-x-hidden">
      <PullToRefresh />
      <Navbar />
      <main className="grow overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
};
