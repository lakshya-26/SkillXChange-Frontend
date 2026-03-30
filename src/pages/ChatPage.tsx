import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import ChatLayout from "../components/chat/ChatLayout";

const ChatPage: React.FC = () => {
  return (
    <DashboardLayout isFullWidth>
      <ChatLayout />
    </DashboardLayout>
  );
};

export default ChatPage;
