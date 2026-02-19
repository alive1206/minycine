import { Navbar } from "./navbar";
import { Footer } from "./footer";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D0D]">
      <Navbar />
      <main className="grow">{children}</main>
      <Footer />
    </div>
  );
};
