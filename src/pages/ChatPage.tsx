import React from "react";
import DashboardTopBar from "../components/dashboard/DashboardTopBar";
import LeftSidebar from "../components/dashboard/LeftSidebar";
import ChatLayout from "../components/chat/ChatLayout";

const ChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardTopBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-8 pb-20 h-screen box-border flex flex-col">
        <div className="flex gap-6 h-full pb-8">
          {/* Sidebar is hidden on small screens in the original layout, check LeftSidebar responsiveness */}
          {/* Original dashboard uses grid. We want full height here. */}
          <div className="hidden lg:block shrink-0">
            {/* Re-using LeftSidebar might need it to handle height gracefully or be wrapped */}
            <LeftSidebar />
          </div>

          <div className="flex-1 min-w-0 h-full">
            <ChatLayout />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
