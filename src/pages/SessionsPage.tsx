import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  Ban,
  ExternalLink,
} from "lucide-react";
import { sessionService, type Session, type SessionStatus } from "../services/session.service";
import { userService } from "../services/user.service";
import { format } from "date-fns";

const SessionsPage: React.FC = () => {
  const [myId, setMyId] = useState<number | null>(null);
  const [status, setStatus] = useState<SessionStatus | "ALL">("ALL");
  const [items, setItems] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await userService.me();
      setMyId(me.id);
      const res = await sessionService.listMySessions({
        page: 1,
        limit: 50,
        status: status === "ALL" ? undefined : status,
      });
      setItems(res.items || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load sessions");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const rows = useMemo(() => {
    const now = Date.now();
    return (items || []).map((s) => {
      const other =
        myId && s.userAId === myId ? s.userB : s.userA;
      const start = new Date(s.scheduledAt).getTime();
      const end = start + (s.durationMinutes || 0) * 60 * 1000;
      const isPast = end < now;
      const canAcceptReject = myId !== null && s.status === "PENDING" && s.userBId === myId;
      const canCancel = myId !== null && (s.status === "PENDING" || s.status === "ACCEPTED");
      const canComplete = myId !== null && s.status === "ACCEPTED" && isPast;
      return { s, other, canAcceptReject, canCancel, canComplete };
    });
  }, [items, myId]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4 mt-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
            <p className="text-gray-600 text-sm mt-1">
              Accept, reject, and manage your scheduled exchanges.
            </p>
          </div>
          <Button variant="outline" onClick={load} className="min-h-[44px]">
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["ALL","PENDING","ACCEPTED","COMPLETED","CANCELLED","REJECTED"] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={`px-3 py-2 rounded-xl text-sm font-medium border min-h-[40px] ${
                status === v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setStatus(v)}
            >
              {v}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <Card className="p-6 text-center text-gray-500">Loading…</Card>
        ) : rows.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No sessions found.
          </Card>
        ) : (
          <div className="space-y-3">
            {rows.map(({ s, other, canAcceptReject, canCancel, canComplete }) => (
              <Card key={s.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-purple-600 shrink-0" />
                      <h2 className="font-semibold text-gray-900 truncate">
                        {s.title}
                      </h2>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        {s.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      With <span className="font-medium">{other?.name || "User"}</span>{" "}
                      • {format(new Date(s.scheduledAt), "PPp")} • {s.durationMinutes} min
                    </p>
                    {s.meetingLink && (
                      <a
                        href={s.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                      >
                        Open meeting link <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {s.description && (
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                        {s.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    {canAcceptReject && (
                      <>
                        <Button
                          className="min-h-[44px]"
                          onClick={async () => {
                            await sessionService.acceptSession(s.id);
                            await load();
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="secondary"
                          className="min-h-[44px]"
                          onClick={async () => {
                            await sessionService.rejectSession(s.id);
                            await load();
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}

                    {canComplete && (
                      <Button
                        className="min-h-[44px]"
                        onClick={async () => {
                          await sessionService.completeSession(s.id);
                          await load();
                        }}
                      >
                        Mark completed
                      </Button>
                    )}

                    {canCancel && (
                      <Button
                        variant="outline"
                        className="min-h-[44px]"
                        onClick={async () => {
                          await sessionService.cancelSession(s.id);
                          await load();
                        }}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SessionsPage;
