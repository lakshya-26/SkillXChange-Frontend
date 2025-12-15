import React from "react";
import {
  Bell,
  Search,
  ChevronDown,
  User,
  LogOut,
  UserCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import {
  userService,
  type UserMatch,
  type UserDetails,
} from "../../services/user.service";
import { authService } from "../../services/auth.service";

interface DashboardTopBarProps {
  onSearch?: (value: string) => void;
}

const DashboardTopBar: React.FC<DashboardTopBarProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<UserMatch[]>([]);
  const [showResults, setShowResults] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [user, setUser] = React.useState<UserDetails | null>(null);
  const [showDropdown, setShowDropdown] = React.useState(false);

  // Notifications state
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [startConnect, setStartConnect] = React.useState<number | null>(null);

  React.useEffect(() => {
    userService.me().then(setUser).catch(console.error);
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { notificationService } = await import(
        "../../services/notification.service"
      );
      // Assuming user only wants to see unread notifications in the 'center'
      // We can fetch all and filter, or just fetch unread.
      // For now, let's fetch normal page but strict filter in UI if "mark as read" removes it.
      const res = await notificationService.getNotifications(1, 10);
      // Filter to show only unread? User said "no need to see it in the centre".
      // So we should probably only display unread ones.
      setNotifications(res.notifications.filter((n: any) => !n.isRead));
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    // Optimistic update
    const originalNotifications = [...notifications];
    const originalCount = unreadCount;

    // Remove from list immediately
    setNotifications((prev) => prev.filter((n) => String(n.id) !== String(id)));
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const { notificationService } = await import(
        "../../services/notification.service"
      );
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error("Failed to mark as read", err);
      // Revert on error
      setNotifications(originalNotifications);
      setUnreadCount(originalCount);
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const data = await userService.searchUsers(query);
          setResults(data);
          setShowResults(true);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  React.useEffect(() => {
    import("../../services/socket.service").then(({ socketService }) => {
      socketService.connect();
      // Update socket listener to refresh list properly
      const clean = socketService.onNotification((msg) => {
        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [msg, ...prev]);
      });

      const cleanUpdated = socketService.on(
        "notifications_updated",
        (payload: any) => {
          if (payload.action === "clear_related") {
            setNotifications((prev) => {
              const filtered = prev.filter(
                (n) =>
                  !(
                    String(n.relatedId) === String(payload.relatedId) &&
                    n.type === payload.type
                  )
              );

              const removedCount = prev.length - filtered.length;
              if (removedCount > 0) {
                // We need to decrease global unreadCount.
                // Since setUnreadCount is separate state, we should call it here.
                // But wait, setNotifications is functional update. We can't side-effect setUnreadCount easily inside.
                // Better to use useEffect on notifications change? No, "notifications" is just fetched list. "unreadCount" is total.
                // We can do it in separate logic if we assume displayed notifications cover the cleared ones.
                // To be safe, we can re-fetch or use a ref.
                // Simple hack: We know how many we removed from *view*, we subtract that from total.
              }
              return filtered;
            });

            // Side effect for count (approximate based on view)
            // Ideally we re-fetch unread count from backend or pass data from backend.
            // Backend didn't send count. Let's just re-fetch for accuracy to avoid "hard refresh" need.
            fetchNotifications();
          }
        }
      );

      return () => {
        clean();
        cleanUpdated();
      };
    });
  }, []);

  const handleLogout = () => {
    authService.clearTokens();
    navigate("/login");
  };

  const handleConnect = async (userId: number, e?: any) => {
    e?.stopPropagation();
    setStartConnect(userId);
    try {
      const { chatService } = await import("../../services/chat.service");
      const conv = await chatService.createConversation(String(userId));
      navigate(`/messages?conversationId=${conv.id}`);
    } catch (err) {
      console.error("Failed to connect", err);
    } finally {
      setStartConnect(null);
    }
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 mr-2 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <img
              src="https://res.cloudinary.com/dca9jrn70/image/upload/v1757440583/skillXchange_logo_dnil4a.png"
              alt="SkillXChange"
              className="w-9 h-9 object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              SkillXChange
            </span>
          </motion.div>

          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="dashboard-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearch?.(query);
                }}
                onFocus={() => query.length >= 2 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                placeholder="Search skills, people, or topics"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {showResults && (results.length > 0 || loading) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-96 overflow-y-auto py-2">
                {loading && results.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Searching...
                  </div>
                ) : (
                  results.map((user) => (
                    <div
                      key={user.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center justify-between gap-3 group"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium overflow-hidden">
                          <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              user.name
                            )}`}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.profession || "No profession listed"}
                          </div>
                        </div>
                      </div>
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="inline-block"
                      >
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleConnect(user.id)}
                          disabled={startConnect === user.id}
                        >
                          {startConnect === user.id ? "..." : "Connect"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-2 rounded-xl text-gray-700 ${
                showNotifications ? "bg-gray-100" : "hover:bg-gray-100"
              }`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                  {unreadCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 overflow-hidden max-h-[24rem] overflow-y-auto"
                >
                  <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Close
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 hover:bg-gray-50 flex gap-3 ${
                            !n.isRead ? "bg-blue-50/30" : ""
                          }`}
                        >
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{n.body}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!n.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(n.id)}
                              className="self-start text-xs text-blue-600 font-medium hover:underline shrink-0"
                            >
                              Mark as Read
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative ml-1">
            <motion.div whileHover={{ y: -1 }}>
              <Button
                variant="secondary"
                size="sm"
                baseClassRequired={false}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium">
                  {user?.name || "User"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Button>
            </motion.div>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden"
                >
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/profile");
                    }}
                  >
                    <UserCircle className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTopBar;
