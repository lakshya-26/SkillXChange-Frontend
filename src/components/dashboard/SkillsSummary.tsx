import React from "react";
import Card from "../ui/Card";
import { Medal, Lightbulb, Plus } from "lucide-react";

const mockTeach = ["Design", "Photography", "Figma Basics"];
const mockLearn = ["JavaScript", "Spanish", "React"];

const Pill: React.FC<{ label: string; type: "teach" | "learn" }> = ({
  label,
  type,
}) => (
  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
    {label}
    <button className="p-1 hover:bg-gray-200 rounded">
      {type === "teach" ? (
        <Medal className="w-3.5 h-3.5 text-yellow-500" />
      ) : (
        <Lightbulb className="w-3.5 h-3.5 text-blue-500" />
      )}
    </button>
  </span>
);

const SkillsSummary: React.FC = () => {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              Skills I Teach
            </h3>
            <button className="text-blue-600 hover:underline text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {mockTeach.map((s) => (
              <Pill key={s} label={s} type="teach" />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              Skills I’m Learning
            </h3>
            <button className="text-blue-600 hover:underline text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {mockLearn.map((s) => (
              <Pill key={s} label={s} type="learn" />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SkillsSummary;
