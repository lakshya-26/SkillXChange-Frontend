import React, { useEffect, useState } from "react";
import { MessageCircle, CalendarClock, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../ui/Card";
import { chatService, type Conversation } from "../../services/chat.service";
import { userService, type UserDetails } from "../../services/user.service";

const RightSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [recentChats, setRecentChats] = useState<Conversation[]>([]);
  const [currentUser, setCurrentUser] = useState<UserDetails | null>(null);

  useEffect(() => {
    userService
      .me()
      .then(setCurrentUser)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    chatService
      .getConversations(1, 10)
      .then((res) => {
        // Sort by last message time if needed, but backend gives updated desc
        const sorted = res.conversations; // already sorted by backend
        // We need names.
        // For sidebar summary, we can try to find the "other" participant
        // If names are missing, we might need hydration like in ChatLayout,
        // but for simplicity, let's assume we can fetch profiles or display fallback.
        // Actually, fetching profiles for sidebar is better UX.
        hydrateChats(sorted.slice(0, 3), currentUser).then(setRecentChats);
      })
      .catch(console.error);
  }, [currentUser]);

  const hydrateChats = async (chats: Conversation[], user: UserDetails) => {
    const hydrated = await Promise.all(
      chats.map(async (chat) => {
        const other = chat.participants.find(
          (p) => String(p.userId) !== String(user.id)
        );
        if (other && !other.name) {
          try {
            const profile = await userService.profileById(other.userId);
            other.name = profile.name;
          } catch (e) {
            /* ignore */
          }
        }
        return chat;
      })
    );
    return hydrated;
  };

  const getOtherParticipantName = (chat: Conversation) => {
    if (!currentUser) return "User";
    const other = chat.participants.find(
      (p) => String(p.userId) !== String(currentUser.id)
    );
    return other?.name || "User";
  };

  return (
    <aside className="hidden xl:block w-80 shrink-0">
      <div className="sticky top-20 space-y-4">
        {/* Messages Card */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Messages</h3>
          </div>
          {recentChats.length === 0 ? (
            <p className="text-sm text-gray-500">No recent messages</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {recentChats.map((chat) => (
                <li
                  key={chat.id}
                  className="cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                  onClick={() => navigate(`/messages?conversationId=${chat.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-900">
                      {getOtherParticipantName(chat)}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {chat.lastMessage?.createdAt
                        ? new Date(
                            chat.lastMessage.createdAt
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </span>
                  </div>
                  <div className="text-gray-500 truncate mt-0.5">
                    {chat.lastMessage?.content || "No messages yet"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Upcoming Sessions Card */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Upcoming Sessions</h3>
          </div>
          <ul className="space-y-3 text-sm">
            <li>Design basics with Ankit — Today 6 PM</li>
            <li>Spanish practice with Maria — Wed 7 PM</li>
          </ul>
        </Card>

        {/* Quick Settings Card */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold">Quick Settings</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Profile", "Availability", "Preferences", "Privacy"].map((t) => (
              <button
                key={t}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                {t}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </aside>
  );
};

export default RightSidebar;
