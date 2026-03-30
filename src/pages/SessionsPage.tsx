import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import { CalendarClock } from "lucide-react";

/** Placeholder until sessions scheduling is implemented. */
const SessionsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto mt-12">
        <Card className="p-8 text-center space-y-4">
          <CalendarClock className="w-12 h-12 text-purple-600 mx-auto" />
          <h1 className="text-xl font-bold text-gray-900">Sessions</h1>
          <p className="text-gray-600 text-sm">
            Scheduling and session management will be available here soon.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SessionsPage;
