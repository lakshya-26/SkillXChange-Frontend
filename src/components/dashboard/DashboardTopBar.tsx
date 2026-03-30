import React from "react";
import {
  Bell,
  Search,
  ChevronDown,
  UserCircle,
  LogOut,
  Menu,
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
  /** Opens the mobile navigation drawer (shown below `lg`). */
  onMenuClick?: () => void;
}

const DashboardTopBar: React.FC<DashboardTopBarProps> = ({
  onSearch,
  onMenuClick,
}) => {
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

  const searchResultsDropdown = (
    <AnimatePresence>
      {showResults && (results.length > 0 || loading) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-[min(24rem,60vh)] overflow-y-auto py-2 z-50 overflow-x-hidden"
        >
          {loading && results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : (
            results.map((user) => (
              <div
                key={user.id}
                role="button"
                tabIndex={0}
                className="px-3 sm:px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                onClick={() => navigate(`/profile/${user.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate(`/profile/${user.id}`);
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      user.name,
                    )}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user.profession || "No profession"}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full sm:w-auto shrink-0"
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
  );

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-[var(--card)] border-b border-[var(--border)] pt-safe transition-all duration-200 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-8xl mx-auto px-3 sm:px-5 lg:px-8">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-y-2 gap-x-2 md:gap-4 md:min-h-[4.5rem] lg:min-h-[5rem] py-2 md:py-0">
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 order-1 min-w-0">
            {onMenuClick && (
              <button
                type="button"
                className="lg:hidden p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                aria-label="Open navigation menu"
                onClick={onMenuClick}
              >
                <Menu size={22} strokeWidth={2} />
              </button>
            )}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0 min-w-0"
              onClick={() => navigate("/dashboard")}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0">
                <img
                  src="https://res.cloudinary.com/dca9jrn70/image/upload/v1757440583/skillXchange_logo_dnil4a.png"
                  alt="skillXchange"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent hidden min-[400px]:block truncate">
                SkillXChange
              </span>
            </motion.div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto md:ml-0 order-2 md:order-3">
            <div className="relative">
              <button
                type="button"
                className={`relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  showNotifications ? "bg-gray-100" : ""
                }`}
                aria-expanded={showNotifications}
                aria-haspopup="true"
                aria-label="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="fixed left-3 right-3 top-[calc(env(safe-area-inset-top)+4.25rem)] z-[55] max-h-[min(70vh,28rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-2xl md:absolute md:inset-x-auto md:top-full md:mt-1 md:right-0 md:left-auto md:w-96"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    <div className="max-h-[min(55vh,20rem)] overflow-y-auto overscroll-contain">
                      {notifications.length === 0 ? (
                        <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 hover:bg-gray-50 flex gap-3 ${!n.isRead ? "bg-primary/5" : ""}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 break-words">
                                {n.body}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {!n.isRead && (
                              <button
                                type="button"
                                onClick={() => handleMarkAsRead(n.id)}
                                className="self-start shrink-0 text-[10px] font-bold text-primary hover:underline py-1"
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

            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:pl-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors min-h-[44px]"
                aria-expanded={showDropdown}
                aria-haspopup="true"
                aria-label="Account menu"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="text-right hidden sm:block max-w-[120px]">
                  <div className="text-xs font-bold text-gray-900 truncate">
                    {user?.name}
                  </div>
                </div>
                <img
                  src={
                    user?.profileImage ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`
                  }
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white shrink-0"
                  alt=""
                />
                <ChevronDown
                  size={14}
                  className="text-gray-400 mr-0.5 sm:mr-1 hidden sm:block"
                />
              </button>
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="fixed right-3 left-3 top-[calc(env(safe-area-inset-top)+4.25rem)] z-[55] rounded-2xl border border-gray-100 bg-white py-2 shadow-2xl overflow-hidden md:absolute md:inset-x-auto md:top-full md:mt-1 md:right-0 md:left-auto md:w-56"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 mb-1 sm:hidden">
                      <p className="font-semibold text-gray-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        @{user?.username}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/profile");
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 min-h-[44px]"
                    >
                      <UserCircle size={18} /> Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 min-h-[44px]"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="w-full order-3 md:order-2 md:flex-1 md:max-w-4xl md:min-w-0 relative">
            <div className="relative group">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
              <input
                id="dashboard-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch?.(query)}
                onFocus={() => query.length >= 2 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                placeholder="Search skills, mentors, peers..."
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/80 text-[var(--foreground)] text-sm sm:text-base placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/35 focus:bg-[var(--card)] transition-all"
              />
            </div>
            {searchResultsDropdown}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopBar;
