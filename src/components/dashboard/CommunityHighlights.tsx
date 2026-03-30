import React from "react";
import Card from "../ui/Card";

const CommunityHighlights: React.FC = () => {
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h3 className="font-semibold">Community Highlights</h3>
        <button
          type="button"
          className="text-sm text-blue-600 hover:underline text-left sm:text-right min-h-[44px] sm:min-h-0 flex items-center"
        >
          Explore
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-orange-100">
          <div className="font-semibold">Top Learners this week</div>
          <div className="mt-2 text-gray-700">Yash · Mehul · Dilkhush</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
          <div className="font-semibold">Most taught skill</div>
          <div className="mt-2 text-gray-700">JavaScript</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-100">
          <div className="font-semibold">Join a challenge</div>
          <div className="mt-2 text-gray-700">30-day learning streak</div>
        </div>
      </div>
    </Card>
  );
};

export default CommunityHighlights;
