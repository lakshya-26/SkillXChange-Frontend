import React from "react";
import { Bell, MessageCircle, CalendarClock, Settings } from "lucide-react";
import Card from "../ui/Card";

const RightSidebar: React.FC = () => {
  return (
    <aside className="hidden xl:block w-80 shrink-0">
      <div className="sticky top-20 space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="text-gray-500">•</span> You have 2 new match
              suggestions
            </li>
            <li className="flex gap-2">
              <span className="text-gray-500">•</span> Ankit accepted your
              request
            </li>
            <li className="flex gap-2">
              <span className="text-gray-500">•</span> Session with Priya
              tomorrow at 5 PM
            </li>
          </ul>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Messages</h3>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span>Ankit</span>
              <span className="text-gray-500">Hey, tomorrow?</span>
            </li>
            <li className="flex justify-between">
              <span>Priya</span>
              <span className="text-gray-500">Shared a resource</span>
            </li>
            <li className="flex justify-between">
              <span>Rahul</span>
              <span className="text-gray-500">Let’s connect!</span>
            </li>
          </ul>
        </Card>

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
