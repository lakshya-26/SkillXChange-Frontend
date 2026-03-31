import React, { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { sessionService } from "../../services/session.service";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  otherUserId: number;
  otherUserName: string;
  onSuccess?: () => void;
};

const DURATION_PRESETS = [30, 45, 60, 90] as const;

/** `datetime-local` value for "next rounded hour" in local timezone */
function defaultLocalDatetimeValue(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localDatetimeToIso(localValue: string): string {
  const d = new Date(localValue);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date or time");
  return d.toISOString();
}

const ScheduleSessionModal: React.FC<Props> = ({
  open,
  onClose,
  otherUserId,
  otherUserName,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [whenLocal, setWhenLocal] = useState(defaultLocalDatetimeValue);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [meetingLink, setMeetingLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setTitle("");
      setDescription("");
      setWhenLocal(defaultLocalDatetimeValue());
      setDurationMinutes(60);
      setMeetingLink("");
    }
  }, [open, otherUserId]);

  const subtitle = useMemo(
    () => `Invite ${otherUserName} to a skill exchange`,
    [otherUserName],
  );

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const t = title.trim();
    if (t.length < 2) {
      setError("Add a short title (at least 2 characters).");
      return;
    }
    try {
      const scheduledAt = localDatetimeToIso(whenLocal);
      if (new Date(scheduledAt).getTime() <= Date.now()) {
        setError("Pick a date and time in the future.");
        return;
      }
    } catch {
      setError("Invalid date or time.");
      return;
    }

    setLoading(true);
    try {
      await sessionService.createSession({
        title: t,
        description: description.trim() || undefined,
        scheduledAt: localDatetimeToIso(whenLocal),
        durationMinutes,
        meetingLink: meetingLink.trim() || undefined,
        userBId: otherUserId,
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not schedule session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-session-title"
      onClick={() => !loading && onClose()}
    >
      <div
        className="w-full sm:max-w-md max-h-[min(92dvh,640px)] flex flex-col bg-white sm:rounded-2xl shadow-xl border-t sm:border border-gray-200 overflow-hidden rounded-t-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="min-w-0">
            <h2
              id="schedule-session-title"
              className="text-lg font-semibold text-gray-900"
            >
              Schedule session
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
            <p className="text-xs text-gray-500 mt-2">
              Add a meeting link (Zoom, Meet, etc.) if you have one. Video is
              not built into the app.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. React hooks walkthrough"
              className="text-base sm:text-sm min-h-[44px]"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              When
            </label>
            <input
              type="datetime-local"
              value={whenLocal}
              onChange={(e) => setWhenLocal(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base sm:text-sm text-gray-900 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </div>

          <div>
            <span className="block text-xs font-medium text-gray-700 mb-2">
              Duration
            </span>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMinutes(m)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium min-h-[40px] border transition-colors ${
                    durationMinutes === m
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {m} min
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Meeting link (optional)
            </label>
            <Input
              type="url"
              inputMode="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://..."
              className="text-base sm:text-sm min-h-[44px]"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What you’ll cover, prep, etc."
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base sm:text-sm text-gray-900 min-h-[88px] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-y"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 pb-safe">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto min-h-[44px]"
            >
              {loading ? "Sending…" : "Send invite"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleSessionModal;
