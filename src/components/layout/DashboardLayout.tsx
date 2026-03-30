import React, { type ReactNode } from "react";
import DashboardTopBar from "../dashboard/DashboardTopBar";
import LeftSidebar from "../dashboard/LeftSidebar";
import Footer from "../layout/Footer";

interface DashboardLayoutProps {
  children: ReactNode;
  isFullWidth?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  isFullWidth = false,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* Top Navigation - Full Width */}
      <DashboardTopBar />

      <div className="flex flex-1 max-w-[1920px] w-full mx-auto">
        {/* Left Sidebar - Integrated */}
        <div className="hidden lg:block w-72 shrink-0 bg-[var(--card)] pt-8 border-r border-[var(--border)]">
          <div className="min-h-[calc(100vh-5rem)] sticky top-20">
            <LeftSidebar />
          </div>
        </div>

        {/* Main Content Area */}
        <main
          className={
            isFullWidth
              ? "flex-1 w-full h-[calc(100vh-5rem)] overflow-hidden"
              : "flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20 w-full"
          }
        >
          {children}
        </main>
      </div>

      {/* Footer - Full Width */}
      <Footer />
    </div>
  );
};

export default DashboardLayout;
