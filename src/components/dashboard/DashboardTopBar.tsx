import React from "react";
import { Bell, Search, ChevronDown, UserCircle, LogOut } from "lucide-react";
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
      const { notificationService } =
        await import("../../services/notification.service");
      const res = await notificationService.getNotifications(1, 10);
      setNotifications(res.notifications.filter((n: any) => !n.isRead));
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    const originalNotifications = [...notifications];
    const originalCount = unreadCount;

    setNotifications((prev) => prev.filter((n) => String(n.id) !== String(id)));
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const { notificationService } =
        await import("../../services/notification.service");
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error("Failed to mark as read", err);
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
                  ),
              );
              return filtered;
            });
            fetchNotifications();
          }
        },
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
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-[var(--card)] border-b border-[var(--border)] transition-all duration-200 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between gap-6">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={() => navigate("/dashboard")}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dca9jrn70/image/upload/v1757440583/skillXchange_logo_dnil4a.png"
                alt="skillXchange"
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent hidden sm:block">
              SkillXChange
            </span>
          </motion.div>

          {/* Search Bar */}
          <div className="flex-1 max-w-4xl relative hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
              <input
                id="dashboard-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch?.(query)}
                onFocus={() => query.length >= 2 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                placeholder="Search for skills, mentors, or peers..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/80 text-[var(--foreground)] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/35 focus:bg-[var(--card)] transition-all"
              />
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showResults && (results.length > 0 || loading) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-0.5 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto py-2 z-50 overflow-hidden"
                >
                  {loading && results.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Searching...
                    </div>
                  ) : (
                    results.map((user) => (
                      <div
                        key={user.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center justify-between gap-3"
                        onClick={() => navigate(`/profile/${user.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              user.name,
                            )}`}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.profession || "No profession"}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={(e) => handleConnect(user.id, e)}
                          disabled={startConnect === user.id}
                        >
                          Connect
                        </Button>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                className={`relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors ${
                  showNotifications ? "bg-gray-100" : ""
                }`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-1 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden z-50 origin-top-right"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 hover:bg-gray-50 flex gap-3 ${!n.isRead ? "bg-primary/5" : ""}`}
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
                                className="self-start text-[10px] font-bold text-primary hover:underline"
                              >
                                MARK READ
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                className="flex items-center gap-3 p-1.5 pl-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-gray-900">
                    {user?.name}
                  </div>
                </div>
                <img
                  src={
                    user?.profileImage ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`
                  }
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white"
                  alt="Profile"
                />
                <ChevronDown size={14} className="text-gray-400 mr-1" />
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden z-50 origin-top-right"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 mb-2 sm:hidden">
                      <p className="font-semibold text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500">@{user?.username}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/profile");
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <UserCircle size={18} /> Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopBar;
