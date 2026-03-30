import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Compass,
  MessageSquare,
  Calendar,
  Settings,
  BookOpen,
  Users,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Compass, label: "Discover", path: "/discover" },
  { icon: Users, label: "Matches", path: "/matches" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: Calendar, label: "Sessions", path: "/sessions" },
  { icon: BookOpen, label: "My Skills", path: "/myskills" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

type LeftSidebarProps = {
  /** Called after navigation (e.g. close mobile drawer). */
  onNavigate?: () => void;
};

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="space-y-1 p-2 pb-safe">
      {navItems.map(({ icon: Icon, label, path }) => {
        const isActive = location.pathname.startsWith(path);
        return (
          <button
            key={label}
            type="button"
            onClick={() => {
              navigate(path);
              onNavigate?.();
            }}
            className={`w-full flex items-center gap-4 px-4 py-3.5 min-h-[48px] rounded-2xl transition-all duration-300 group relative overflow-hidden ${
              isActive
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Icon
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isActive ? "animate-pulse" : ""
              }`}
            />
            <span className="font-medium tracking-wide">{label}</span>
            {isActive && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default LeftSidebar;
