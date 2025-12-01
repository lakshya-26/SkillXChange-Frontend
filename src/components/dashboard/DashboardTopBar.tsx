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

  React.useEffect(() => {
    userService.me().then(setUser).catch(console.error);
  }, []);

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

  const handleLogout = () => {
    authService.clearTokens();
    navigate("/login");
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
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium overflow-hidden">
                        {/* Use a placeholder or dicebear if no image */}
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
                        <div className="text-xs text-gray-400 mt-0.5">
                          {user.skills
                            .slice(0, 3)
                            .map((s) => s.name)
                            .join(", ")}
                          {user.skills.length > 3 &&
                            ` +${user.skills.length - 3}`}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-700"
            aria-label="Notifications"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
              3
            </span>
          </motion.button>

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
