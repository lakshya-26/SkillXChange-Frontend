import React, { useEffect, useMemo, useState } from "react";
import Card from "../ui/Card";
import { sessionService, type Session, type SessionStatus } from "../../services/session.service";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/user.service";

/** Label shown in UI; derived from API `Session.status` (not a separate hardcoded story). */
type ChipKey =
  | "Pending"
  | "Accepted"
  | "Ongoing"
  | "Completed"
  | "Cancelled"
  | "Rejected";

const StatusChip: React.FC<{ label: string; chipKey: ChipKey }> = ({
  label,
  chipKey,
}) => {
  const map: Record<ChipKey, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    Accepted: "bg-sky-100 text-sky-800",
    Ongoing: "bg-green-100 text-green-700",
    Completed: "bg-blue-100 text-blue-800",
    Cancelled: "bg-slate-100 text-slate-700",
    Rejected: "bg-rose-100 text-rose-700",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[chipKey]}`}
    >
      {label}
    </span>
  );
};

function deriveDisplayFromApiSession(s: Session, nowMs: number): {
  label: string;
  chipKey: ChipKey;
} {
  const status = s.status as SessionStatus;
  const start = new Date(s.scheduledAt).getTime();
  const end = start + (s.durationMinutes || 0) * 60 * 1000;

  switch (status) {
    case "COMPLETED":
      return { label: "Completed", chipKey: "Completed" };
    case "REJECTED":
      return { label: "Rejected", chipKey: "Rejected" };
    case "CANCELLED":
      return { label: "Cancelled", chipKey: "Cancelled" };
    case "PENDING":
      return { label: "Pending", chipKey: "Pending" };
    case "ACCEPTED":
      if (nowMs >= start && nowMs <= end) {
        return { label: "Ongoing", chipKey: "Ongoing" };
      }
      if (nowMs < start) {
        return { label: "Accepted", chipKey: "Accepted" };
      }
      return { label: "Accepted", chipKey: "Accepted" };
    default:
      return { label: String(status), chipKey: "Pending" };
  }
}

const ActiveExchanges: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await userService.me().catch(() => null);
        if (!mounted) return;
        setMyId(me?.id ?? null);
        setLoading(true);
        const res = await sessionService.listMySessions({ page: 1, limit: 8 });
        if (!mounted) return;
        setItems(res.items || []);
      } catch {
        if (!mounted) return;
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    const now = Date.now();
    const normalized = (items || []).map((s) => {
      const { label, chipKey } = deriveDisplayFromApiSession(s, now);

      const timeLabel =
        s.status === "PENDING"
          ? "Awaiting invitee response"
          : format(new Date(s.scheduledAt), "PPp");

      return {
        id: s.id,
        topic: s.title,
        with:
          myId && s.userAId === myId
            ? s.userB?.name || "User"
            : s.userA?.name || "User",
        statusLabel: label,
        chipKey,
        time: timeLabel,
      };
    });

    return normalized.slice(0, 3);
  }, [items, myId]);

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h3 className="font-semibold">Active Exchanges</h3>
        <button
          type="button"
          onClick={() => navigate("/sessions")}
          className="text-sm text-blue-600 hover:underline text-left min-h-[40px] sm:min-h-0 flex items-center"
        >
          View all
        </button>
      </div>
      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          No sessions yet. Start a chat and schedule one.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((ex) => (
          <div
            key={ex.id}
            className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50"
          >
            <div>
              <div className="font-medium">{ex.topic}</div>
              <div className="text-sm text-gray-600">
                with {ex.with} • {ex.time}
              </div>
            </div>
            <StatusChip label={ex.statusLabel} chipKey={ex.chipKey} />
          </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ActiveExchanges;
