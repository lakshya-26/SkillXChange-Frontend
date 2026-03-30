import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { authService } from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import { userService, type UserDetails } from "../services/user.service";
import SkillSelector from "../components/signup/SkillSelector";
import { PlusCircle, XCircle } from "lucide-react";

const SkillChips: React.FC<{
  title: string;
  skills: string[];
  colorClass: string;
  onAdd?: () => void;
  onRemove?: (skill: string) => void;
}> = ({ title, skills, colorClass, onAdd, onRemove }) => {
  if (!skills || skills.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {onAdd && (
            <Button size="sm" variant="ghost" onClick={onAdd}>
              <PlusCircle className="h-4 w-4 mr-1" /> Add
            </Button>
          )}
        </div>
        <p className="text-xs text-slate-600">No items yet</p>
      </div>
    );
  }
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {onAdd && (
          <Button size="sm" variant="ghost" onClick={onAdd}>
            <PlusCircle className="h-4 w-4 mr-1" /> Add
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((s, idx) => (
          <span
            key={`${s}-${idx}`}
            className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass} flex items-center`}
          >
            {s}
            {onRemove && (
              <button
                type="button"
                className="ml-2 cursor-pointer opacity-70 hover:opacity-100 flex items-center bg-transparent border-none p-0"
                onClick={() => onRemove(s)}
                aria-label={`Remove ${s}`}
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

const MySkillsPage: React.FC = () => {
  const navigate = useNavigate();
  const hasToken = !!authService.getAccessToken();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillModalOpen, setSkillModalOpen] = useState<
    false | "learn" | "teach"
  >(false);
  const [skillTemp, setSkillTemp] = useState<string[]>([]);

  useEffect(() => {
    if (!hasToken) {
      setLoading(false);
      return;
    }
    let m = true;
    userService
      .me()
      .then((u) => {
        if (m) setUser(u);
      })
      .catch((e) => {
        if (m) setError(e?.message || "Failed to load");
      })
      .finally(() => {
        if (m) setLoading(false);
      });
    return () => {
      m = false;
    };
  }, [hasToken]);

  const { learnSkills, teachSkills } = useMemo(() => {
    const learn: string[] = [];
    const teach: string[] = [];
    if (user?.skillsToLearn) learn.push(...user.skillsToLearn);
    if (user?.skillsToTeach) teach.push(...user.skillsToTeach);
    return {
      learnSkills: Array.from(new Set(learn)),
      teachSkills: Array.from(new Set(teach)),
    };
  }, [user]);

  const openSkillModal = (type: "learn" | "teach") => {
    if (!user) return;
    setSkillModalOpen(type);
    setSkillTemp(
      type === "learn" ? user.skillsToLearn || [] : user.skillsToTeach || [],
    );
  };

  const saveSkillModal = async () => {
    if (!skillModalOpen) return;
    try {
      setError(null);
      const payload =
        skillModalOpen === "learn"
          ? { skillsToLearn: skillTemp }
          : { skillsToTeach: skillTemp };
      const updated = await userService.updateProfile(payload);
      setUser(updated);
      setSkillModalOpen(false);
      setSkillTemp([]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update skills");
    }
  };

  const handleRemoveSkill = async (type: "learn" | "teach", skill: string) => {
    if (!user) return;
    try {
      setError(null);
      const current =
        type === "learn" ? user.skillsToLearn || [] : user.skillsToTeach || [];
      const next = current.filter((s) => s !== skill);
      const payload =
        type === "learn" ? { skillsToLearn: next } : { skillsToTeach: next };
      const updated = await userService.updateProfile(payload);
      setUser(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to remove skill");
    }
  };

  if (!hasToken) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12 p-6 text-center">
          <p className="text-gray-600 mb-4">Sign in to manage your skills.</p>
          <Button onClick={() => navigate("/login")}>Go to login</Button>
        </Card>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-16 text-center text-gray-500">Loading…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 mt-2">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My skills</h1>
            <p className="text-gray-600 text-sm mt-1">
              What you teach and want to learn—used for discovery and matches.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/profile")}>
            Full profile
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SkillChips
              title="Skills I'm learning"
              skills={learnSkills}
              colorClass="bg-blue-50 text-blue-900 border border-blue-200"
              onAdd={() => openSkillModal("learn")}
              onRemove={(s) => handleRemoveSkill("learn", s)}
            />
            <SkillChips
              title="Skills I teach"
              skills={teachSkills}
              colorClass="bg-amber-50 text-amber-900 border border-amber-200"
              onAdd={() => openSkillModal("teach")}
              onRemove={(s) => handleRemoveSkill("teach", s)}
            />
          </div>
        </Card>
      </div>

      {skillModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {skillModalOpen === "learn"
                ? "Edit skills to learn"
                : "Edit skills to teach"}
            </h3>
            <SkillSelector
              selectedSkills={skillTemp}
              onSkillChange={setSkillTemp}
              skillType={skillModalOpen === "learn" ? "learn" : "teach"}
            />
            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
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
        </div>
      )}
    </DashboardLayout>
  );
};

export default MySkillsPage;
