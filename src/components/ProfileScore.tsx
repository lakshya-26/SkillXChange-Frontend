import React from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import type { ProfileScore as ProfileScoreType } from "../services/user.service";
import Card from "./ui/Card";

interface ProfileScoreProps {
  scoreData: ProfileScoreType;
  onAction?: (action: string) => void;
}

const ProfileScore: React.FC<ProfileScoreProps> = ({ scoreData, onAction }) => {
  const { missing } = scoreData;

  if (!missing || missing.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 mb-6 border-none shadow-lg bg-white/80">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle size={20} className="text-amber-500" />
        <h3 className="text-lg font-bold text-gray-800">
          Complete Your Profile
        </h3>
      </div>

      <div className="space-y-3">
        {missing.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-sm text-gray-700 font-medium">{item}</span>
            {onAction && (
              <button
                onClick={() => onAction(item)}
                className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Action <ArrowRight size={14} className="ml-1" />
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProfileScore;
