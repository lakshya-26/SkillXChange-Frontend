import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

type EditForm = {
  name?: string;
  username?: string;
  email?: string;
};

const SkillChips: React.FC<{
  title: string;
  skills: string[];
  colorClass: string;
}> = ({ title, skills, colorClass }) => {
  if (!skills || skills.length === 0) return null;
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((s, idx) => (
          <span
            key={`${s}-${idx}`}
            className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}
          >
            {s}
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
  const [error, setError] = useState<string | null>(null);
  const hasToken = !!authService.getAccessToken();

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
    });
    setEditing(true);
  };

  const submitEdit = async () => {
    try {
      setError(null);
      await userService.updateProfile({
        name: editForm.name,
        username: editForm.username,
        email: editForm.email,
      });
      // Refresh me and current user if it's my profile
      const meData = await userService.me();
      setMe(meData);
      if (!id || isOwnProfile) {
        setUser(meData);
      } else if (id) {
        const other = await userService.profileById(id);
        setUser(other);
      }
      setEditing(false);
    } catch (e: any) {
      setError(e?.message || "Failed to update profile");
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
        <Card className="max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-2">Unable to load profile</h2>
          <p className="text-gray-600 mb-4">
            {error || "Please try again later."}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Avatar + quick actions */}
        <div className="md:col-span-1">
          <Card className="p-6 flex flex-col items-center">
            {/* Placeholder avatar with initials; click to edit/add */}
            <button
              onClick={() => setAvatarModal(true)}
              className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center text-4xl font-bold shadow-lg hover:opacity-90 transition"
              title={
                isOwnProfile ? "Edit/Add profile picture" : "Profile picture"
              }
            >
              {initials(user.name)}
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

            {isOwnProfile && (
              <Button className="mt-6 w-full" onClick={openEdit}>
                Edit Profile
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
              />
              <SkillChips
                title="Skills to Teach"
                skills={teachSkills}
                colorClass="bg-emerald-50 text-emerald-700 border border-emerald-200"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Edit modal (own profile only) */}
      {editing && isOwnProfile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Name"
                value={editForm.name || ""}
                onChange={(e: any) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
              />
              <Input
                type="text"
                placeholder="Username"
                value={editForm.username || ""}
                onChange={(e: any) =>
                  setEditForm((f) => ({ ...f, username: e.target.value }))
                }
              />
              <Input
                type="email"
                placeholder="Email"
                value={editForm.email || ""}
                onChange={(e: any) =>
                  setEditForm((f) => ({ ...f, email: e.target.value }))
                }
              />
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Profile Picture</h3>
            <p className="text-gray-600">
              Picture upload isn’t available yet. We’ll add it once backend
              supports it.
            </p>
            <div className="mt-6">
              <Button onClick={() => setAvatarModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
