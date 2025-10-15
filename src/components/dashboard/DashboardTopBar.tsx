import React from "react";
import { Bell, Search, ChevronDown, User } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../ui/Button";

interface DashboardTopBarProps {
  onSearch?: (value: string) => void;
}

const DashboardTopBar: React.FC<DashboardTopBarProps> = ({ onSearch }) => {
  const [query, setQuery] = React.useState("");

  return (
    <div className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2 mr-2">
            <img
              src="https://res.cloudinary.com/dca9jrn70/image/upload/v1757440583/skillXchange_logo_dnil4a.png"
              alt="SkillXChange"
              className="w-9 h-9 object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              SkillXChange
            </span>
          </motion.div>

          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearch?.(query);
                }}
                placeholder="Search skills, people, or topics"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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

          <motion.div whileHover={{ y: -1 }} className="ml-1">
            <Button variant="secondary" size="sm" baseClassRequired={false} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Lakshya</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTopBar;


