import React from "react";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "student" | "parent" | "counselor" | "admin" | "superadmin";
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Desktop Only */}
      <div className="hidden md:block">
        <AppSidebar role={role} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header - Simplified or Full depending on screen */}
        <div className="md:hidden">
          <AppHeader role={role} />
        </div>
        <header className="hidden md:flex h-20 items-center justify-end px-10 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-40">
          <AppHeader role={role} minimal={true} />
        </header>

        <main className="flex-1 p-6 md:p-10 max-w-[1600px]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
