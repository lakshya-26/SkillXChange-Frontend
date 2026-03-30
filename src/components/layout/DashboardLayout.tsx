import React, { type ReactNode, useEffect, useState } from "react";
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <DashboardTopBar onMenuClick={() => setMobileNavOpen(true)} />

      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
          aria-hidden
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      {mobileNavOpen && (
        <aside
          className="fixed left-0 top-0 bottom-0 z-[61] w-[min(19rem,90vw)] max-w-full bg-[var(--card)] border-r border-[var(--border)] shadow-2xl lg:hidden flex flex-col pt-safe"
          aria-modal
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
            <span className="font-semibold text-gray-900">Menu</span>
            <button
              type="button"
              className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close menu"
              onClick={() => setMobileNavOpen(false)}
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <LeftSidebar onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </aside>
      )}

      <div className="flex flex-1 min-h-0 min-w-0 max-w-[1920px] w-full mx-auto max-lg:overflow-x-hidden">
        <div className="hidden lg:block w-72 shrink-0 bg-[var(--card)] pt-6 border-r border-[var(--border)]">
          <div className="min-h-[calc(100vh-5rem)] sticky top-20">
            <LeftSidebar />
          </div>
        </div>

        <main
          className={
            isFullWidth
              ? "flex-1 flex flex-col min-h-0 min-w-0 w-full overflow-hidden"
              : "flex-1 max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 pt-3 sm:pt-4 pb-24 sm:pb-20 pb-safe w-full min-w-0"
          }
        >
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardLayout;
