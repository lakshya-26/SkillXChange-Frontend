import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  userService,
  type UserDetails,
  type ProfileScore as ProfileScoreType,
} from "../services/user.service";
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
  CheckCircle,
  UserCircle,
  Share2,
} from "lucide-react";
import SkillSelector from "../components/signup/SkillSelector";
import ProfileScore from "../components/ProfileScore";
import CircularProgressAvatar from "../components/CircularProgressAvatar";
import RateUserModal from "../components/RateUserModal";
import { chatService } from "../services/chat.service";
import { auth } from "../firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useMediaQuery } from "../hooks/useMediaQuery";

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
                title={`Remove ${s}`}
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

const BadgeDisplay: React.FC<{ badges?: string[] }> = ({ badges }) => {
  if (!badges || badges.length === 0) return null;

  const badgeIcons: Record<string, string> = {
    Verified:
      "https://res.cloudinary.com/dca9jrn70/image/upload/v1769162173/image__5_-removebg-preview_lakgoj.svg",
    Reliable:
      "https://res.cloudinary.com/dca9jrn70/image/upload/v1769162173/image__6_-removebg-preview_e9kolt.svg",
    "Top Rated":
      "https://res.cloudinary.com/dca9jrn70/image/upload/v1769162173/image__7_-removebg-preview_rnbkva.svg",
    "Active Mentor":
      "https://res.cloudinary.com/dca9jrn70/image/upload/v1769162173/image__8_-removebg-preview_p4ylwx.svg",
  };

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-3">
      {badges.map((badgeName) => (
        <div
          key={badgeName}
          className="group relative flex flex-col items-center"
        >
          {badgeIcons[badgeName] ? (
            <img
              src={badgeIcons[badgeName]}
              alt={badgeName}
              className="w-8 h-8 object-contain drop-shadow-sm hover:scale-110 transition-transform duration-200"
              title={badgeName}
            />
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              {badgeName}
            </span>
          )}
          <span className="absolute bottom-full mb-1 hidden group-hover:block px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-md whitespace-nowrap z-30">
            {badgeName}
          </span>
        </div>
      ))}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const [me, setMe] = useState<UserDetails | null>(null);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({});
  const [scoreData, setScoreData] = useState<ProfileScoreType | null>(null);
  const [avatarModal, setAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasToken = !!authService.getAccessToken();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [skillModalOpen, setSkillModalOpen] = useState<
    false | "learn" | "teach"
  >(false);
  const [skillTemp, setSkillTemp] = useState<string[]>([]);

  // Verification State
  const [verificationId, setVerificationId] =
    useState<ConfirmationResult | null>(null);
  const [otp, setOtp] = useState("");
  const [otpModal, setOtpModal] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);

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

  useEffect(() => {
    const calculateAndSetScore = async () => {
      try {
        const score = await userService.getProfileScore();
        setScoreData(score);
      } catch (e) {
        console.error("Failed to fetch score", e);
      }
    };

    if (!loading && user) {
      if (isOwnProfile) {
        calculateAndSetScore();
      } else if (typeof user.profileScore === "number") {
        setScoreData({
          score: user.profileScore,
          max: 100,
          level: "Member",
          earned: [],
          missing: [],
        });
      }
    }
  }, [isOwnProfile, loading, user]);

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
        String(user.id),
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
      type === "learn" ? user.skillsToLearn || [] : user.skillsToTeach || [],
    );
  };

  const handleScoreAction = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes("teach")) openSkillModal("teach");
    else if (lower.includes("learn")) openSkillModal("learn");
    else if (lower.includes("skills")) openSkillModal("teach");
    else if (lower.includes("profession") || lower.includes("bio")) openEdit();
    else if (lower.includes("photo")) setAvatarModal(true);
    else if (lower.includes("phone")) {
      if (!user?.phoneNumber)
        openEdit(); // Need phone number first
      else sendOtp();
    } else if (lower.includes("social") || lower.includes("links")) openEdit();
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

  const sendOtp = async () => {
    if (!user?.phoneNumber) return;
    setSendingOtp(true);
    setError(null);
    try {
      const recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        },
      );
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        `+91${user.phoneNumber}`,
        recaptchaVerifier,
      );
      setVerificationId(confirmationResult);
      setOtpModal(true);
    } catch (e: any) {
      console.error(e);
      setError(
        e.message ||
          "Failed to send OTP. Check phone number format (e.g., +1234567890)",
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!verificationId) return;
    setVerifyingOtp(true);
    try {
      await verificationId.confirm(otp);
      // Success, update backend
      const updated = await userService.updateProfile({
        isPhoneVerified: true,
      });
      setMe((prev) => (prev && isOwnProfile ? updated : prev));
      setUser(updated);
      setOtpModal(false);
      setOtp("");
      setVerificationId(null);
    } catch (e: any) {
      setError("Invalid OTP or verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mt-2 sm:mt-6">
        {/* Profile Header Card */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden p-4 sm:p-6 md:p-10 shadow-lg bg-gradient-to-br from-blue-700 via-blue-600 to-sky-100 ring-1 ring-blue-500/20">
          {/* Sparkles / Background Decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-20 w-40 h-40 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white/50 rounded-full animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-white/40 rounded-full animate-pulse delay-700" />

          <div className="relative flex flex-col md:flex-row items-center gap-6 sm:gap-8 z-10">
            {/* Avatar */}
            <div className="shrink-0 p-1.5">
              <CircularProgressAvatar
                score={scoreData?.score || 0}
                imageUrl={user.profileImage}
                initials={initials(user.name)}
                size={isMdUp ? 140 : 112}
                onClick={isOwnProfile ? () => setAvatarModal(true) : undefined}
                isEditable={isOwnProfile}
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm text-center md:text-left">
                  {user.name}
                </h1>
                {user.badges?.includes("Verified") && (
                  <div className="bg-white rounded-full p-0.5 shadow-sm" title="Verified">
                    <CheckCircle className="w-5 h-5 text-blue-600 fill-blue-100" />
                  </div>
                )}
              </div>

              <div className="text-lg text-blue-50 font-medium">
                {user.profession || "Member"}
              </div>

              {user.reputationScore !== undefined && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 text-sm font-semibold text-slate-800 border border-white/80 shadow-sm">
                  <span>Reputation: {user.reputationScore}</span>
                </div>
              )}
            </div>

            {/* Actions (Absolute Top Right for Desktop, standard flow for mobile) */}
            <div className="w-full md:w-auto md:absolute md:top-0 md:right-0">
              {isOwnProfile ? (
                <Button
                  onClick={openEdit}
                  className="shadow-md border-0 w-full md:w-auto min-h-[44px]"
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                  <Button
                    onClick={handleMessage}
                    className="bg-white/80 hover:bg-white text-gray-900 border-none shadow-sm backdrop-blur-sm w-full md:w-auto min-h-[44px]"
                  >
                    Message
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setRateModalOpen(true)}
                    className="bg-white/50 hover:bg-white/70 text-gray-900 border-none backdrop-blur-sm w-full md:w-auto min-h-[44px]"
                  >
                    Rate
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-6 sm:mt-8">
        {/* Left Column: About & Contact */}
        <div className="space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" /> About
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Location
                  </span>
                  <span className="text-slate-900 font-medium">
                    {user.address || "Not specified"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Profession
                  </span>
                  <span className="text-slate-900 font-medium">
                    {user.profession || "Not specified"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Phone
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-medium">
                      {user.phoneNumber || "-"}
                    </span>
                    {user.phoneNumber &&
                      isOwnProfile &&
                      !user.isPhoneVerified && (
                        <button
                          onClick={sendOtp}
                          disabled={sendingOtp}
                          className="text-[10px] text-blue-500 hover:underline"
                        >
                          Verify
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" /> Socials
            </h3>
            <div className="space-y-3">
              {user.instagram && (
                <a
                  href={`https://instagram.com/${user.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Instagram className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900 truncate">
                      Instagram
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    @{user.instagram}
                  </span>
                </a>
              )}
              {user.twitter && (
                <a
                  href={`https://twitter.com/${user.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Twitter className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900 truncate">
                      Twitter
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    @{user.twitter}
                  </span>
                </a>
              )}
              {user.github && (
                <a
                  href={`https://github.com/${user.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Github className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900 truncate">
                      GitHub
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    @{user.github}
                  </span>
                </a>
              )}
              {user.linkedin && (
                <a
                  href={`https://linkedin.com/in/${user.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Linkedin className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900 truncate">
                      LinkedIn
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    /in/{user.linkedin}
                  </span>
                </a>
              )}
              {!user.instagram &&
                !user.twitter &&
                !user.github &&
                !user.linkedin && (
                  <p className="text-sm text-slate-600 italic">
                    No social links added.
                  </p>
                )}
            </div>
          </Card>
        </div>

        {/* Right Column: Skills & Badges */}
        <div className="lg:col-span-2 space-y-6">
          {isOwnProfile && scoreData && (
            <ProfileScore scoreData={scoreData} onAction={handleScoreAction} />
          )}

          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4 sm:mb-6 text-slate-900">
              Skills Exchange
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <SkillChips
                  title="Skills I Want to Learn"
                  skills={learnSkills}
                  colorClass="bg-blue-50 text-blue-900 border border-blue-200"
                  onAdd={
                    isOwnProfile ? () => openSkillModal("learn") : undefined
                  }
                  onRemove={
                    isOwnProfile
                      ? (s) => handleRemoveSkill("learn", s)
                      : undefined
                  }
                />
              </div>
              <div>
                <SkillChips
                  title="Skills I Can Teach"
                  skills={teachSkills}
                  colorClass="bg-emerald-50 text-emerald-900 border border-emerald-200"
                  onAdd={
                    isOwnProfile ? () => openSkillModal("teach") : undefined
                  }
                  onRemove={
                    isOwnProfile
                      ? (s) => handleRemoveSkill("teach", s)
                      : undefined
                  }
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900">
              Badges & Achievements
            </h3>
            <BadgeDisplay badges={user.badges} />
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
      {/* OTP Modal */}
      {otpModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Verify Phone Number</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the OTP sent to {user?.phoneNumber}
            </p>
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e: any) => setOtp(e.target.value)}
              className="mb-4"
            />
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setOtpModal(false)}>
                Cancel
              </Button>
              <Button onClick={verifyOtp} disabled={verifyingOtp || !otp}>
                {verifyingOtp ? "Verifying..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div id="recaptcha-container"></div>

      {rateModalOpen && user && (
        <RateUserModal
          rateeId={user.id}
          rateeName={user.name}
          onClose={() => setRateModalOpen(false)}
          onSuccess={() => {
            // We might want to reload the user profile to show updated stats/reputation
            // But for now just alert.
            alert("Rating submitted! It will appear after verification.");
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default ProfilePage;
