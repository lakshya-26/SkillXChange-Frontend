import React from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
import clsx from "clsx";
import type { Conversation } from "../../services/chat.service";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  currentUserId: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  currentUserId,
  onLoadMore,
  hasMore,
}) => {
  const [search, setSearch] = React.useState("");

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants.find(
      (p) => String(p.userId) !== currentUserId
    );
    return (otherParticipant?.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight + 50 &&
      hasMore &&
      onLoadMore
    ) {
      onLoadMore();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-full md:w-80 lg:w-96">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const otherParticipant = conv.participants.find(
              (p) => String(p.userId) !== currentUserId
            );
            const isActive = conv.id === activeConversationId;
            const unreadCount = conv.unreadCount || 0;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={clsx(
                  "flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-50 hover:bg-gray-50",
                  isActive && "bg-blue-50/50 hover:bg-blue-50"
                )}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        otherParticipant?.name || "User"
                      )}`}
                      alt={otherParticipant?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Status indicator could go here */}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {otherParticipant?.name || "Unknown User"}
                    </h3>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                        {format(new Date(conv.lastMessage.createdAt), "MMM d")}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p
                      className={clsx(
                        "text-sm truncate pr-2",
                        unreadCount > 0
                          ? "text-gray-900 font-medium"
                          : "text-gray-500"
                      )}
                    >
                      {conv.lastMessage?.content || "No messages yet"}
                    </p>
                    {unreadCount > 0 && (
                      <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-blue-600 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
