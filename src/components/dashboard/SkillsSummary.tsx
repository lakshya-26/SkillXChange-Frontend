import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Medal, Lightbulb, Plus } from "lucide-react";
import { userService, type UserDetails } from "../../services/user.service";
import SkillSelector from "../signup/SkillSelector";

const Pill: React.FC<{ label: string; type: "teach" | "learn" }> = ({
  label,
  type,
}) => (
  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
    {label}
    <span className="p-1 rounded">
      {type === "teach" ? (
        <Medal className="w-3.5 h-3.5 text-yellow-500" />
      ) : (
        <Lightbulb className="w-3.5 h-3.5 text-blue-500" />
      )}
    </span>
  </span>
);

const SkillsSummary: React.FC = () => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [skillModalOpen, setSkillModalOpen] = useState<
    false | "learn" | "teach"
  >(false);
  const [skillTemp, setSkillTemp] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .me()
      .then((u) => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openSkillModal = (type: "learn" | "teach") => {
    if (!user) return;
    setSkillModalOpen(type);
    setSkillTemp(
      type === "learn" ? user.skillsToLearn || [] : user.skillsToTeach || []
    );
  };

  const saveSkillModal = async () => {
    if (!skillModalOpen) return;
    try {
      const payload =
        skillModalOpen === "learn"
          ? { skillsToLearn: skillTemp }
          : { skillsToTeach: skillTemp };
      const updated = await userService.updateProfile(payload);
      setUser(updated);
      setSkillModalOpen(false);
      setSkillTemp([]);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <Card className="p-6">Loading skills...</Card>;
  if (!user) return null;

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              Skills I Teach
            </h3>
            <button
              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
              onClick={() => openSkillModal("teach")}
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(user.skillsToTeach || []).map((s) => (
              <Pill key={s} label={s} type="teach" />
            ))}
            {(!user.skillsToTeach || user.skillsToTeach.length === 0) && (
              <span className="text-gray-400 text-sm">No skills added</span>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              Skills I’m Learning
            </h3>
            <button
              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
              onClick={() => openSkillModal("learn")}
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(user.skillsToLearn || []).map((s) => (
              <Pill key={s} label={s} type="learn" />
            ))}
            {(!user.skillsToLearn || user.skillsToLearn.length === 0) && (
              <span className="text-gray-400 text-sm">No skills added</span>
            )}
          </div>
        </div>
      </div>

      {skillModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto mx-4">
              <h3 className="text-lg font-semibold mb-4">
                {skillModalOpen === "learn"
                  ? "Edit Skills to Learn"
                  : "Edit Skills to Teach"}
              </h3>
              <SkillSelector
                selectedSkills={skillTemp}
                onSkillChange={setSkillTemp}
                skillType={skillModalOpen === "learn" ? "learn" : "teach"}
              />
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSkillModalOpen(false);
                    setSkillTemp([]);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={saveSkillModal}>Save</Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </Card>
  );
};

export default SkillsSummary;
