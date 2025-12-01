import React from "react";
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
  { icon: Home, label: "Dashboard" },
  { icon: Compass, label: "Discover" },
  { icon: Users, label: "Matches" },
  { icon: MessageSquare, label: "Messages" },
  { icon: Calendar, label: "Sessions" },
  { icon: BookOpen, label: "My Skills" },
  { icon: Settings, label: "Settings" },
];

const LeftSidebar: React.FC = () => {
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-20 space-y-2">
        <nav className="bg-white rounded-2xl border border-gray-100 shadow-md divide-y divide-gray-100">
          <div className="p-2">
            {navItems.map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default LeftSidebar;
