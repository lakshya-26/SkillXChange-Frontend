import React, { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { authService } from "../services/auth.service";
import {
  userService,
  type PatchUserAppSettings,
} from "../services/user.service";

const TABS = ["availability", "preferences", "privacy"] as const;
type TabId = (typeof TABS)[number];

function isTab(s: string | null): s is TabId {
  return s !== null && (TABS as readonly string[]).includes(s);
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasToken = !!authService.getAccessToken();

  const tab: TabId = useMemo(() => {
    const t = searchParams.get("tab");
    return isTab(t) ? t : "availability";
  }, [searchParams]);

  const setTab = (next: TabId) => {
    setSearchParams({ tab: next }, { replace: true });
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [availabilityDraft, setAvailabilityDraft] = useState("");
  const [prefsDraft, setPrefsDraft] = useState({
    emailDigest: true,
    matchAlerts: true,
  });
  const [privacyDraft, setPrivacyDraft] = useState({
    showEmail: true,
    showPhone: true,
    profileVisibility: "community" as "public" | "community",
  });

  useEffect(() => {
    if (!hasToken) {
      setLoading(false);
      return;
    }
    let m = true;
    userService
      .getSettings()
      .then((s) => {
        if (!m) return;
        setAvailabilityDraft(s.availabilityNotes || "");
        setPrefsDraft({
          emailDigest: s.preferences?.emailDigest !== false,
          matchAlerts: s.preferences?.matchAlerts !== false,
        });
        setPrivacyDraft({
          showEmail: s.privacy?.showEmail !== false,
          showPhone: s.privacy?.showPhone !== false,
          profileVisibility:
            s.privacy?.profileVisibility === "public"
              ? "public"
              : "community",
        });
      })
      .catch((e) => {
        if (m) setError(e?.message || "Could not load settings");
      })
      .finally(() => {
        if (m) setLoading(false);
      });
    return () => {
      m = false;
    };
  }, [hasToken]);

  const save = async (payload: PatchUserAppSettings) => {
    if (!hasToken) return;
    setSaving(true);
    setError(null);
    setOkMsg(null);
    try {
      const next = await userService.patchSettings(payload);
      setAvailabilityDraft(next.availabilityNotes || "");
      setPrefsDraft({
        emailDigest: next.preferences?.emailDigest !== false,
        matchAlerts: next.preferences?.matchAlerts !== false,
      });
      setPrivacyDraft({
        showEmail: next.privacy?.showEmail !== false,
        showPhone: next.privacy?.showPhone !== false,
        profileVisibility:
          next.privacy?.profileVisibility === "public"
            ? "public"
            : "community",
      });
      setOkMsg("Saved.");
      setTimeout(() => setOkMsg(null), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!hasToken) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12 p-6 text-center">
          <p className="text-gray-600 mb-4">Sign in to change settings.</p>
          <Button onClick={() => navigate("/login")}>Go to login</Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 mt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 text-sm mt-1">
            Availability, notifications, and privacy for your account.
          </p>
        </div>

        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-3 -mx-1 px-1 sm:flex-wrap sm:overflow-visible">
          {(
            [
              ["availability", "Availability"],
              ["preferences", "Preferences"],
              ["privacy", "Privacy"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                tab === id
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {okMsg && (
          <p className="text-sm text-emerald-700" role="status">
            {okMsg}
          </p>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm">Loading settings…</p>
        ) : (
          <>
            {tab === "availability" && (
              <Card className="p-6 space-y-4">
                <h2 className="font-semibold text-gray-900">
                  When you’re usually free
                </h2>
                <p className="text-sm text-gray-600">
                  Share windows that work for sessions or messages. Only you
                  can edit this; others may see it if you choose to show it on
                  your profile later.
                </p>
                <textarea
                  className="w-full min-h-[140px] rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. Weekday evenings after 6pm IST, or Saturday mornings…"
                  value={availabilityDraft}
                  onChange={(e) => setAvailabilityDraft(e.target.value)}
                />
                <Button
                  disabled={saving}
                  onClick={() =>
                    save({ availabilityNotes: availabilityDraft })
                  }
                >
                  {saving ? "Saving…" : "Save availability"}
                </Button>
              </Card>
            )}

            {tab === "preferences" && (
              <Card className="p-6 space-y-4">
                <h2 className="font-semibold text-gray-900">Notifications</h2>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={prefsDraft.emailDigest}
                    onChange={(e) =>
                      setPrefsDraft((p) => ({
                        ...p,
                        emailDigest: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm text-gray-800">
                    Email me a weekly digest
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={prefsDraft.matchAlerts}
                    onChange={(e) =>
                      setPrefsDraft((p) => ({
                        ...p,
                        matchAlerts: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm text-gray-800">
                    Alert me when there are new match suggestions
                  </span>
                </label>
                <Button
                  disabled={saving}
                  onClick={() => save({ preferences: prefsDraft })}
                >
                  {saving ? "Saving…" : "Save preferences"}
                </Button>
              </Card>
            )}

            {tab === "privacy" && (
              <Card className="p-6 space-y-4">
                <h2 className="font-semibold text-gray-900">Privacy</h2>
                <p className="text-sm text-gray-600">
                  Control what other members see on your public profile.
                </p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={privacyDraft.showEmail}
                    onChange={(e) =>
                      setPrivacyDraft((p) => ({
                        ...p,
                        showEmail: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm text-gray-800">
                    Show my email to other members
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={privacyDraft.showPhone}
                    onChange={(e) =>
                      setPrivacyDraft((p) => ({
                        ...p,
                        showPhone: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm text-gray-800">
                    Show my phone number to other members
                  </span>
                </label>
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">
                    Profile visibility
                  </span>
                  <select
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm w-full max-w-xs"
                    value={privacyDraft.profileVisibility}
                    onChange={(e) =>
                      setPrivacyDraft((p) => ({
                        ...p,
                        profileVisibility: e.target.value as
                          | "public"
                          | "community",
                      }))
                    }
                  >
                    <option value="community">
                      Community (logged-in members)
                    </option>
                    <option value="public">Public listing</option>
                  </select>
                </div>
                <Button
                  disabled={saving}
                  onClick={() => save({ privacy: privacyDraft })}
                >
                  {saving ? "Saving…" : "Save privacy"}
                </Button>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
