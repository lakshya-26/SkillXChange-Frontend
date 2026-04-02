import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { useIsLargeScreen } from "../../hooks/useMediaQuery";
import {
  chatService,
  type Conversation,
  type Message,
} from "../../services/chat.service";
import { socketService } from "../../services/socket.service";
import { userService, type UserDetails } from "../../services/user.service";

const ChatLayout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isLargeScreen = useIsLargeScreen();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(searchParams.get("conversationId"));
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [convPage, setConvPage] = useState(1);
  const [hasMoreConv, setHasMoreConv] = useState(false);
  const [msgPage, setMsgPage] = useState(1);
  const [hasMoreMsg, setHasMoreMsg] = useState(false);
  const [loadingMoreMsg, setLoadingMoreMsg] = useState(false);

  // Helper to hydrate users
  const hydrateConversations = async (
    convs: Conversation[],
    user: UserDetails,
  ) => {
    // Hydrate with user names
    // Extract all unique userIds that are not current user
    const userIdsToFetch = new Set<string>();
    convs.forEach((c) =>
      c.participants.forEach((p) => {
        // p.userId might be number or string
        if (String(p.userId) !== String(user.id)) {
          userIdsToFetch.add(String(p.userId));
        }
      }),
    );

    try {
      // We need to fetch profiles. If we have a bulk API, great. If not, parallel.
      const profiles = await Promise.all(
        Array.from(userIdsToFetch).map((id) =>
          userService.profileById(id).catch(() => null),
        ),
      );

      const profileMap = new Map<string, UserDetails>();
      profiles.forEach((p) => {
        if (p) profileMap.set(String(p.id), p);
      });

      // Update conversations with names
      return convs.map((conv) => ({
        ...conv,
        participants: conv.participants.map((p) => {
          const profile = profileMap.get(String(p.userId));
          if (profile) {
            return {
              ...p,
              name: profile.name,
              username: profile.username,
              profilePicture: profile.profileImage,
            };
          }
          return p;
        }),
      }));
    } catch (err) {
      console.error("Failed to hydrate names", err);
      return convs;
    }
  };

  // Initialize: Fetch user and conversations
  useEffect(() => {
    const init = async () => {
      try {
        const user = await userService.me();
        setCurrentUser(user);
        socketService.connect();

        const { conversations: convs, hasMore } =
          await chatService.getConversations(1, 20);
        setHasMoreConv(hasMore);
        setConvPage(1);

        const convsArray = Array.isArray(convs) ? convs : [];
        const hydrated = await hydrateConversations(convsArray, user);
        setConversations(hydrated);
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Sync activeConversationId with URL params
  useEffect(() => {
    const id = searchParams.get("conversationId");
    if (id) {
      setActiveConversationId(id);
    }
  }, [searchParams]);

  const loadMoreConversations = async () => {
    if (!hasMoreConv || !currentUser) return;
    try {
      const nextPage = convPage + 1;
      const { conversations: newConvs, hasMore } =
        await chatService.getConversations(nextPage, 20);
      setConvPage(nextPage);
      setHasMoreConv(hasMore);

      if (newConvs.length > 0) {
        const hydrated = await hydrateConversations(newConvs, currentUser);
        setConversations((prev) => [...prev, ...hydrated]);
      }
    } catch (err) {
      console.error("Failed to load more conversations", err);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMoreMsg || !activeConversationId || loadingMoreMsg) return;
    setLoadingMoreMsg(true);
    try {
      const nextPage = msgPage + 1;
      const { messages: newMsgs, hasMore } = await chatService.getMessages(
        activeConversationId,
        nextPage,
        20,
      );

      setMsgPage(nextPage);
      setHasMoreMsg(hasMore);

      const sortedNew = newMsgs.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      // Prepend older messages
      setMessages((prev) => [...sortedNew, ...prev]);
    } catch (err) {
      console.error("Failed to load more messages", err);
    } finally {
      setLoadingMoreMsg(false);
    }
  };

  // Effect to load messages if activeConversationId is set (e.g. from URL)
  useEffect(() => {
    if (activeConversationId) {
      if (!currentUser) return; // Wait for user

      // Check if conversation exists in the list; if not, fetch it (for deep linking old chats)
      const exists = conversations.find(
        (c) => String(c.id) === String(activeConversationId),
      );
      if (!exists) {
        chatService
          .getConversationById(activeConversationId)
          .then(async (c) => {
            const [hydrated] = await hydrateConversations([c], currentUser);
            setConversations((prev) => {
              if (prev.find((p) => String(p.id) === String(hydrated.id))) {
                return prev;
              }
              return [hydrated, ...prev];
            });
          })
          .catch((err) =>
            console.error("Failed to fetch active conversation details", err),
          );
      }

      // Join room and fetch messages
      socketService.joinConversation(activeConversationId);

      // Reset msg pagination
      setMsgPage(1);
      setHasMoreMsg(false);

      chatService
        .getMessages(activeConversationId, 1, 20)
        .then((res) => {
          const sorted = res.messages.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          setMessages(sorted);
          setHasMoreMsg(res.hasMore);
        })
        .catch((err) => console.error("Failed to load initial messages", err));
    }
  }, [activeConversationId, currentUser]); // We don't depend on 'conversations' to avoid loops; relies on closure state which is fine for 'exists' check on ID change

  // Listen for global incoming messages
  useEffect(() => {
    const removeListener = socketService.on(
      "receive_message",
      (message: Message) => {
        setConversations((prev) => {
          const index = prev.findIndex(
            (c) => String(c.id) === String(message.conversationId),
          );
          if (index === -1) {
            chatService
              .getConversations(1, 1) // fetch top most recent
              .then(async (res) => {
                if (res.conversations.length > 0 && currentUser) {
                  const hydrated = await hydrateConversations(
                    res.conversations,
                    currentUser,
                  );
                  const newConv = hydrated[0];
                  setConversations((current) => {
                    // Check existence again to avoid race
                    if (current.find((c) => c.id === newConv.id))
                      return current;
                    return [newConv, ...current];
                  });
                }
              });
            return prev;
          }

          const updated = [...prev];
          const conv = { ...updated[index] };
          conv.lastMessage = {
            content: message.content,
            senderId: message.senderId,
            createdAt: message.createdAt,
          };

          if (String(message.conversationId) !== String(activeConversationId)) {
            conv.unreadCount = (conv.unreadCount || 0) + 1;
          }

          updated[index] = conv;
          // Move to top
          updated.sort((a, b) => {
            const dateA = new Date(a.lastMessage?.createdAt || 0).getTime();
            const dateB = new Date(b.lastMessage?.createdAt || 0).getTime();
            return dateB - dateA;
          });

          return updated;
        });

        if (String(activeConversationId) === String(message.conversationId)) {
          setMessages((prev) => [...prev, message]);
        }
      },
    );

    const removeReadListener = socketService.on(
      "messages_read",
      (data: { conversationId: string; readBy: string }) => {
        // When someone reads messages in a conversation
        // If *I* read them (e.g. other tab), clear my count
        // If *Other* reads them, maybe update status (not implemented visually yet)

        if (String(data.readBy) === String(currentUser?.id)) {
          setConversations((prev) =>
            prev.map((c) => {
              if (String(c.id) === String(data.conversationId)) {
                return { ...c, unreadCount: 0 };
              }
              return c;
            }),
          );
        }
      },
    );

    return () => {
      removeListener();
      removeReadListener();
    };
  }, [activeConversationId, currentUser]);

  // Handle Conversation Selection
  const handleSelectConversation = useCallback(
    async (id: string) => {
      setActiveConversationId(id);
      setSearchParams({ conversationId: id }, { replace: true });

      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
      );
    },
    [setSearchParams],
  );

  const handleBackFromChat = useCallback(() => {
    setActiveConversationId(null);
    navigate("/messages", { replace: true });
  }, [navigate]);

  // Handle Send Message
  const handleSendMessage = async (content: string) => {
    if (!activeConversationId || !currentUser) return;

    // Optimistic UI update (optional, but socket is fast)
    // For now rely on socket 'receive_message' to append, but simpler to just emit.
    // The backend service implementation:
    // socket.on('send_message') -> saves to DB -> emits 'receive_message'.
    // So we should NOT append locally immediately unless we handle deduping.
    // We will wait for the socket event which we are already listening to.

    socketService.sendMessage({
      conversationId: activeConversationId,
      content,
    });
  };

  const activeConversation = conversations.find(
    (c) => String(c.id) === String(activeConversationId),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[12rem] md:min-h-[280px] text-gray-500 text-sm px-4">
        Loading messages…
      </div>
    );
  }

  if (!currentUser) return null;

  const showList =
    isLargeScreen || !activeConversationId || activeConversationId === "";
  const showChatPane =
    isLargeScreen || (!!activeConversationId && activeConversationId !== "");

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0 w-full overflow-hidden bg-white">
      <div
        className={clsx(
          "flex flex-col min-h-0 w-full border-gray-100 bg-white shrink-0 lg:w-96 lg:border-r",
          showList ? "flex-1 lg:flex-none min-h-0" : "hidden",
        )}
      >
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          currentUserId={String(currentUser.id)}
          onLoadMore={loadMoreConversations}
          hasMore={hasMoreConv}
        />
      </div>

      <div
        className={clsx(
          "flex flex-1 flex-col min-w-0 min-h-0 bg-white",
          showChatPane ? "flex" : "hidden lg:flex",
        )}
      >
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            currentUserId={String(currentUser.id)}
            onSendMessage={handleSendMessage}
            onLoadMore={loadMoreMessages}
            hasMore={hasMoreMsg}
            loadingMore={loadingMoreMsg}
            onBack={isLargeScreen ? undefined : handleBackFromChat}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 px-6 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-full mb-4 flex items-center justify-center">
              <span className="text-xl sm:text-2xl">👋</span>
            </div>
            <p className="text-base sm:text-lg font-medium text-gray-700">
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
