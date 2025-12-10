import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userService, type UserDetails } from "../services/user.service";
import { authService } from "../services/auth.service";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import {
  MapPin,
  Phone,
  Github,
  Linkedin,
  Instagram,
  Twitter,
  Briefcase,
  PlusCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";
import SkillSelector from "../components/signup/SkillSelector";
import { chatService } from "../services/chat.service";

type EditForm = {
  name?: string;
  username?: string;
  email?: string;
  profession?: string;
  address?: string;
  phoneNumber?: string;
  instagram?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  skillsToLearn?: string[]; // stored internally as array
  skillsToTeach?: string[]; // stored internally as array
};

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
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          {onAdd && (
            <Button size="sm" variant="ghost" onClick={onAdd}>
              <PlusCircle className="h-4 w-4 mr-1" /> Add
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500">No items yet</p>
      </div>
    );
  }
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
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
              <XCircle
                className="h-3.5 w-3.5 ml-2 cursor-pointer opacity-70 hover:opacity-100"
                onClick={() => onRemove(s)}
                aria-label={`Remove ${s}`}
                title={`Remove ${s}`}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [me, setMe] = useState<UserDetails | null>(null);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({});
  const [avatarModal, setAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasToken = !!authService.getAccessToken();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [skillModalOpen, setSkillModalOpen] = useState<
    false | "learn" | "teach"
  >(false);
  const [skillTemp, setSkillTemp] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!hasToken) {
          setLoading(false);
          return;
        }
        const meData = await userService.me();
        if (!mounted) return;
        setMe(meData);

        // If no id, show my profile; otherwise load the requested profile
        if (!id) {
          setUser(meData);
        } else {
          const other = await userService.profileById(id);
          if (!mounted) return;
          setUser(other);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, hasToken]);

  const isOwnProfile = useMemo(() => {
    if (!me || !user) return false;
    return String(me.id) === String(user.id);
  }, [me, user]);

  // Normalize skills to two string arrays
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

  const initials = (name?: string) =>
    (name || "?")
      .split(" ")
      .map((n) => n.charAt(0).toUpperCase())
      .slice(0, 3)
      .join("");

  const openEdit = () => {
    if (!user) return;
    setEditForm({
      name: user.name,
      username: user.username,
      email: user.email,
      profession: user.profession || "",
      address: user.address || "",
      phoneNumber: user.phoneNumber || "",
      instagram: user.instagram || "",
      twitter: user.twitter || "",
      github: user.github || "",
      linkedin: user.linkedin || "",
      skillsToLearn: user.skillsToLearn || [],
      skillsToTeach: user.skillsToTeach || [],
    });
    setEditing(true);
  };

  const parseSkills = (val: string) =>
    val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const skillsToString = (arr?: string[]) =>
    arr && arr.length ? arr.join(", ") : "";

  const submitEdit = async () => {
    try {
      setError(null);
      // Send all fields (no password update)
      const updated = await userService.updateProfile({
        name: editForm.name,
        username: editForm.username,
        email: editForm.email,
        profession: editForm.profession,
        address: editForm.address,
        phoneNumber: editForm.phoneNumber,
        instagram: editForm.instagram,
        twitter: editForm.twitter,
        github: editForm.github,
        linkedin: editForm.linkedin,
        skillsToLearn: editForm.skillsToLearn,
        skillsToTeach: editForm.skillsToTeach,
        profileImage: null, // not changing here
      });

      // Use returned user directly to refresh UI
      setMe((prev) => (prev && isOwnProfile ? updated : prev));
      if (!id || isOwnProfile) {
        setUser(updated);
      } else if (id) {
        // If editing someone else (unlikely), refetch
        const other = await userService.profileById(id);
        setUser(other);
      }
      setEditing(false);
    } catch (e: any) {
      setError(e?.message || "Failed to update profile");
    }
  };

  const submitAvatar = async () => {
    if (!avatarFile) {
      setAvatarModal(false);
      return;
    }
    try {
      setError(null);
      const updated = await userService.updateProfile({
        profileImage: avatarFile,
      });
      setMe((prev) => (prev && isOwnProfile ? updated : prev));
      setUser(updated);
      setAvatarModal(false);
      setAvatarFile(null);
    } catch (e: any) {
      setError(e?.message || "Failed to update profile picture");
    }
  };

  const handleMessage = async () => {
    if (!user) return;
    try {
      const conversation = await chatService.createConversation(
        String(user.id)
      );
      navigate(`/messages?conversationId=${conversation.id}`);
    } catch (e: any) {
      console.error("Failed to start conversation", e);
      // Fallback: navigate to messages anyway? Or show error?
      navigate("/messages");
    }
  };

  if (!hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center p-6">
          <h2 className="text-xl font-semibold mb-2">You’re not logged in</h2>
          <p className="text-gray-600 mb-4">Please log in to view profiles.</p>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center p-6">
          <h2 className="text-xl font-semibold mb-2">Unable to load profile</h2>
          <p className="text-gray-600 mb-4">
            {error || "Please try again later."}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

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
      setError(null);
      const payload =
        skillModalOpen === "learn"
          ? { skillsToLearn: skillTemp }
          : { skillsToTeach: skillTemp };
      const updated = await userService.updateProfile(payload);
      setMe((prev) => (prev && isOwnProfile ? updated : prev));
      setUser(updated);
      setSkillModalOpen(false);
      setSkillTemp([]);
    } catch (e: any) {
      setError(e?.message || "Failed to update skills");
    }
  };

  const handleRemoveSkill = async (type: "learn" | "teach", skill: string) => {
    if (!isOwnProfile || !user) return;
    try {
      setError(null);
      const current =
        type === "learn" ? user.skillsToLearn || [] : user.skillsToTeach || [];
      const next = current.filter((s) => s !== skill);
      const payload =
        type === "learn" ? { skillsToLearn: next } : { skillsToTeach: next };
      const updated = await userService.updateProfile(payload);
      setMe((prev) => (prev && isOwnProfile ? updated : prev));
      setUser(updated);
    } catch (e: any) {
      setError(e?.message || "Failed to remove skill");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Avatar + quick actions */}
        <div className="md:col-span-1">
          <Card className="p-6 flex flex-col items-center">
            {/* Avatar: show image if available, else initials */}
            <button
              onClick={() => isOwnProfile && setAvatarModal(true)}
              className="w-32 h-32 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center text-4xl font-bold shadow-lg hover:opacity-90 transition"
              title={
                isOwnProfile ? "Edit/Add profile picture" : "Profile picture"
              }
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="bg-gradient-to-br from-blue-600 to-blue-800 text-white w-full h-full flex items-center justify-center">
                  {initials(user.name)}
                </span>
              )}
            </button>
            <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
            <p className="text-gray-500">@{user.username}</p>

            <div className="w-full mt-6 space-y-2 text-sm text-gray-700">
              {user?.profession && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 font-medium">
                    <Briefcase size={16} />
                    <span>Profession</span>
                  </div>
                  <span className="text-gray-600">{user.profession}</span>
                </div>
              )}
              {user?.phoneNumber && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 font-medium">
                    <Phone size={16} />
                    <span>Phone</span>
                  </div>
                  <span className="text-gray-600">{user.phoneNumber}</span>
                </div>
              )}
              {user?.address && (
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1 font-medium">
                    <MapPin size={16} />
                    <span>Address</span>
                  </div>
                  <span className="text-gray-600 text-right max-w-[60%]">
                    {user.address}
                  </span>
                </div>
              )}
            </div>

            {isOwnProfile ? (
              <Button className="mt-6 w-full" onClick={openEdit}>
                Edit Profile
              </Button>
            ) : (
              <Button className="mt-6 w-full" onClick={handleMessage}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
            )}
          </Card>
        </div>

        {/* Right: Details + Skills + Socials */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Basic Info
                </h3>
                <div className="space-y-2 text-gray-700">
                  <div>
                    <span className="text-gray-500 block text-xs">Name</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">
                      Username
                    </span>
                    <span className="font-medium">@{user.username}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Email</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Socials
                </h3>
                <div className="space-y-2 text-gray-700">
                  {user?.instagram && (
                    <div>
                      <div className="flex items-center gap-1 font-medium text-gray-500">
                        <Instagram size={12} />
                        <span className="block text-xs">Instagram</span>
                      </div>
                      <a
                        className="font-medium text-blue-600"
                        href={`https://instagram.com/${user.instagram}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        @{user.instagram}
                      </a>
                    </div>
                  )}
                  {user?.twitter && (
                    <div>
                      <div className="flex items-center gap-1 font-medium text-gray-500">
                        <Twitter size={12} />
                        <span className="block text-xs">Twitter</span>
                      </div>
                      <a
                        className="font-medium text-blue-600"
                        href={`https://twitter.com/${user.twitter}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        @{user.twitter}
                      </a>
                    </div>
                  )}
                  {user?.github && (
                    <div>
                      <div className="flex items-center gap-1 font-medium text-gray-500">
                        <Github size={12} />
                        <span className="block text-xs">GitHub</span>
                      </div>
                      <a
                        className="font-medium text-blue-600"
                        href={`https://github.com/${user.github}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        @{user.github}
                      </a>
                    </div>
                  )}
                  {user?.linkedin && (
                    <div>
                      <div className="flex items-center gap-1 font-medium text-gray-500">
                        <Linkedin size={12} />
                        <span className="block text-xs">LinkedIn</span>
                      </div>
                      <a
                        className="font-medium text-blue-600"
                        href={`https://linkedin.com/in/${user.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        /in/{user.linkedin}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <SkillChips
                title="Skills to Learn"
                skills={learnSkills}
                colorClass="bg-blue-50 text-blue-700 border border-blue-200"
                onAdd={isOwnProfile ? () => openSkillModal("learn") : undefined}
                onRemove={
                  isOwnProfile
                    ? (s) => handleRemoveSkill("learn", s)
                    : undefined
                }
              />
              <SkillChips
                title="Skills to Teach"
                skills={teachSkills}
                colorClass="bg-emerald-50 text-emerald-700 border border-emerald-200"
                onAdd={isOwnProfile ? () => openSkillModal("teach") : undefined}
                onRemove={
                  isOwnProfile
                    ? (s) => handleRemoveSkill("teach", s)
                    : undefined
                }
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Edit modal (own profile only) */}
      {editing && isOwnProfile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Name</label>
                <Input
                  type="text"
                  placeholder="Name"
                  value={editForm.name || ""}
                  onChange={(e: any) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="Username"
                  value={editForm.username || ""}
                  onChange={(e: any) =>
                    setEditForm((f) => ({ ...f, username: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Email"
                  value={editForm.email || ""}
                  onChange={(e: any) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Profession
                </label>
                <Input
                  type="text"
                  placeholder="Profession"
                  value={editForm.profession || ""}
                  onChange={(e: any) =>
                    setEditForm((f) => ({ ...f, profession: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Address
                </label>
                <textarea
                  placeholder="Address"
                  value={editForm.address || ""}
                  onChange={(e: any) =>
                    setEditForm((f) => ({ ...f, address: e.target.value }))
                  }
                  className="w-full border rounded-md p-2 text-sm"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Phone Number
                </label>
                <Input
                  type="text"
                  placeholder="Phone Number"
                  value={editForm.phoneNumber || ""}
                  onChange={(e: any) =>
                    setEditForm((f) => ({ ...f, phoneNumber: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Instagram
                </label>
                <Input
                  type="text"
                  placeholder="Instagram (username only)"
                  value={editForm.instagram || ""}
                  onChange={(e: any) =>
                    setEditForm((f) => ({ ...f, instagram: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Twitter
                </label>
                <Input
                  type="text"
                  placeholder="Twitter (username only)"
                  value={editForm.twitter || ""}
                  onChange={(e: any) =>
                    setEditForm((f) => ({ ...f, twitter: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  GitHub
                </label>
                <Input
                  type="text"
                  placeholder="GitHub (username only)"
                  value={editForm.github || ""}
                  onChange={(e: any) =>
                    setEditForm((f) => ({ ...f, github: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  LinkedIn
                </label>
                <Input
                  type="text"
                  placeholder="LinkedIn (handle after /in/)"
                  value={editForm.linkedin || ""}
                  onChange={(e: any) =>
                    setEditForm((f) => ({ ...f, linkedin: e.target.value }))
                  }
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button onClick={submitEdit}>Save</Button>
            </div>
          </div>
        </div>
      )}
      {avatarModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto mx-4">
            <h3 className="text-lg font-semibold mb-2">
              Update Profile Picture
            </h3>
            <input
              ref={fileInputRef}
              id="avatarFileInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e: any) => setAvatarFile(e.target.files?.[0] || null)}
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              Choose Image
            </Button>
            <div className="mt-3 text-sm text-gray-700" aria-live="polite">
              {avatarFile ? `Selected: ${avatarFile.name}` : "No file chosen"}
            </div>
            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setAvatarModal(false);
                  setAvatarFile(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={submitAvatar} disabled={!avatarFile}>
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}
      {skillModalOpen && (
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
    </div>
  );
};

export default ProfilePage;
