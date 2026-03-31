import React, { useEffect, useRef, useState } from "react";
import { Send, MoreVertical, CalendarClock, ChevronLeft } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ScheduleSessionModal from "./ScheduleSessionModal";
import type { Message, Conversation } from "../../services/chat.service";
import { socketService } from "../../services/socket.service";

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  /** Shown on small screens to return to the conversation list. */
  onBack?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onLoadMore,
  hasMore,
  loadingMore,
  onBack,
}) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const otherParticipant = conversation.participants.find(
    (p) => String(p.userId) !== currentUserId
  );

  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only scroll to bottom if we are not loading more messages (history)
    // Actually, we usually scroll to bottom on initial load and when new message arrives.
    // When loading history, we want to stay at current scroll position.
    if (!loadingMore) {
      scrollToBottom();
    }
  }, [messages, isTyping, loadingMore]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (container.scrollTop === 0 && hasMore && onLoadMore && !loadingMore) {
      onLoadMore();
    }
  };

  const [prevScrollHeight, setPrevScrollHeight] = useState(0);

  useEffect(() => {
    if (loadingMore && messagesContainerRef.current) {
      setPrevScrollHeight(messagesContainerRef.current.scrollHeight);
    }
  }, [loadingMore]);

  useEffect(() => {
    if (!loadingMore && prevScrollHeight > 0 && messagesContainerRef.current) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      messagesContainerRef.current.scrollTop =
        newScrollHeight - prevScrollHeight;
      setPrevScrollHeight(0);
    }
  }, [messages, loadingMore, prevScrollHeight]);

  useEffect(() => {
    // Listen for typing events
    const cleanTyping = socketService.on("participant_typing", (data: any) => {
      if (
        data.conversationId === conversation.id &&
        data.userId !== currentUserId
      ) {
        setIsTyping(true);
      }
    });

    const cleanStopTyping = socketService.on(
      "participant_stopped_typing",
      (data: any) => {
        if (
          data.conversationId === conversation.id &&
          data.userId !== currentUserId
        ) {
          setIsTyping(false);
        }
      }
    );

    return () => {
      cleanTyping();
      cleanStopTyping();
    };
  }, [conversation.id, currentUserId]);

  useEffect(() => {
    if (!headerMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (
        headerMenuRef.current &&
        !headerMenuRef.current.contains(e.target as Node)
      ) {
        setHeaderMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [headerMenuOpen]);

  const otherUserId = otherParticipant
    ? Number(otherParticipant.userId)
    : NaN;
  const canSchedule =
    Number.isFinite(otherUserId) && otherUserId > 0 && !!otherParticipant;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // Emit typing event
    socketService.startTyping(conversation.id);

    // Debounce stop typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(conversation.id);
    }, 1000);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
    socketService.stopTyping(conversation.id);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      {canSchedule && (
        <ScheduleSessionModal
          open={scheduleOpen}
          onClose={() => setScheduleOpen(false)}
          otherUserId={otherUserId}
          otherUserName={
            otherParticipant?.name || otherParticipant?.username || "them"
          }
        />
      )}
      {/* Header */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-10 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Back to conversations"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                otherParticipant?.name || "User"
              )}`}
              alt={otherParticipant?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base">
              {otherParticipant?.name || "Unknown User"}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {isTyping ? (
                <span className="text-blue-600 font-medium">Typing...</span>
              ) : otherParticipant?.username ? (
                `@${otherParticipant.username}`
              ) : (
                ""
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
          {canSchedule && (
            <button
              type="button"
              onClick={() => setScheduleOpen(true)}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition min-h-[44px] min-w-[44px] sm:min-w-0 justify-center border border-blue-100 sm:border-transparent"
              aria-label="Schedule session"
            >
              <CalendarClock className="w-5 h-5 shrink-0" />
              <span className="hidden sm:inline text-sm font-medium">
                Schedule
              </span>
            </button>
          )}
          <div className="relative" ref={headerMenuRef}>
            <button
              type="button"
              onClick={() => setHeaderMenuOpen((v) => !v)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="More options"
              aria-expanded={headerMenuOpen}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {headerMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-52 py-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20"
                role="menu"
              >
                {canSchedule && (
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 min-h-[44px]"
                    onClick={() => {
                      setHeaderMenuOpen(false);
                      setScheduleOpen(true);
                    }}
                  >
                    Schedule session
                  </button>
                )}
                {!canSchedule && (
                  <p className="px-4 py-3 text-xs text-gray-500">
                    No other participant in this chat.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 overscroll-contain"
        onScroll={handleScroll}
      >
        {loadingMore && (
          <div className="text-center py-2 text-xs text-gray-400">
            Loading history...
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id || msg.createdAt} // Fallback if ID is temporary
            content={msg.content}
            isOwn={String(msg.senderId) === currentUserId}
            createdAt={msg.createdAt}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-gray-200 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 bg-gray-50 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
          <input
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400 text-base sm:text-sm min-h-[44px]"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
