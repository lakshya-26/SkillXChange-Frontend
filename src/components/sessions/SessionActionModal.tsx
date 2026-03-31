import React, { useEffect, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import RateUserModal from "../RateUserModal";
import { sessionService, type ActionNeeded } from "../../services/session.service";

type Props = {
  open: boolean;
  action: ActionNeeded;
  onClose: () => void;
  onRefresh: () => Promise<void>;
};

const SessionActionModal: React.FC<Props> = ({ open, action, onClose, onRefresh }) => {
  const [busy, setBusy] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);

  useEffect(() => {
    setRateModalOpen(false);
  }, [action.type, (action as any)?.sessionId]);

  if (!open || action.type === "NONE") return null;

  const otherName = (action as any)?.otherUser?.name || "your partner";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[80] p-4">
      <div className="w-full max-w-md">
        <Card className="p-5 sm:p-6">
          {action.type === "CONFIRM_HAPPENED" ? (
            <>
              <h3 className="text-lg font-semibold mb-2">Did your session happen?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Session with <span className="font-medium">{otherName}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="w-full min-h-[44px]"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await sessionService.decideHappened(action.sessionId, true);
                      await onRefresh();
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Yes, it happened
                </Button>
                <Button
                  variant="secondary"
                  className="w-full min-h-[44px]"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await sessionService.decideHappened(action.sessionId, false);
                      await onRefresh();
                      onClose();
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  No
                </Button>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={onClose} disabled={busy}>
                  Close
                </Button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-2">Rate your exchange</h3>
              <p className="text-sm text-gray-600 mb-4">
                Session with <span className="font-medium">{otherName}</span>
              </p>
              <Button
                className="w-full min-h-[44px]"
                onClick={() => setRateModalOpen(true)}
              >
                Rate now
              </Button>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={onClose}>
                  Later
                </Button>
              </div>

              {rateModalOpen && (
                <RateUserModal
                  rateeId={action.otherUserId}
                  rateeName={otherName}
                  sessionId={action.sessionId}
                  onClose={() => setRateModalOpen(false)}
                  onSuccess={async () => {
                    await onRefresh();
                    onClose();
                  }}
                />
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SessionActionModal;

