import type { ReactNode } from "react";
import Sidebar from "@/components/sidebar";
import { Header } from "./Header";
import { MainContent } from "./MainContent";
import { Footer } from "./Footer";

interface DashboardLayoutProps {
  children: ReactNode;
  header?: {
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
}

export function DashboardLayout({ children, header }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar - Fixed */}
      <aside className="hidden md:block w-64 fixed left-0 top-0 bottom-0 z-40">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <MainContent header={header}>{children}</MainContent>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
