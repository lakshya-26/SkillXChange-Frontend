import React, { useEffect, useRef, useState } from "react";
import { Send, MoreVertical, Phone, Video } from "lucide-react";
import MessageBubble from "./MessageBubble";
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
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onLoadMore,
  hasMore,
  loadingMore,
}) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const otherParticipant = conversation.participants.find(
    (p) => String(p.userId) !== currentUserId
  );

  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      // Save current scroll height to restore position after loading
      const currentScrollHeight = container.scrollHeight;
      onLoadMore();
      // We'll need to adjust scrollTop after render, but React state update is async.
      // A common trick is to use useLayoutEffect or a ref to track "we just loaded more".
      // But for now let's just trigger it.
      // The parent component prepends messages.
      // To keep scroll position stable, we need to adjust scrollTop by (newScrollHeight - oldScrollHeight).
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
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                otherParticipant?.name || "User"
              )}`}
              alt={otherParticipant?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">
              {otherParticipant?.name || "Unknown User"}
            </h3>
            <p className="text-xs text-gray-500">
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
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4"
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
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
          <input
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400"
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
