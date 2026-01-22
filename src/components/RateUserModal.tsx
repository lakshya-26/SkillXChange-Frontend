import React, { useState } from "react";
import Button from "./ui/Button";
import { userService } from "../services/user.service";
import { Star } from "lucide-react";

interface RateUserModalProps {
  rateeId: number;
  rateeName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const RateUserModal: React.FC<RateUserModalProps> = ({
  rateeId,
  rateeName,
  onClose,
  onSuccess,
}) => {
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolvedConversationId, setResolvedConversationId] = useState("");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setChecking(true);
      try {
        const res = await userService.checkRatingEligibility(rateeId);
        if (!mounted) return;
        setEligible(res.allowed);
        if (!res.allowed) {
          setReason(res.reason || "Not eligible");
        } else if (res.conversationId) {
          setResolvedConversationId(res.conversationId);
        }
      } catch (e: any) {
        if (!mounted) return;
        setError("Failed to check eligibility");
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [rateeId]);

  const submitRating = async () => {
    if (stars === 0) {
      setError("Please select a star rating");
      return;
    }
    setLoading(true);
    try {
      await userService.rateUser({
        rateeId,
        conversationId: resolvedConversationId, // Verified ID or empty string if ignored by backend constraint
        stars,
        feedback,
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2">Rate {rateeName}</h3>
        <p className="text-sm text-gray-500 mb-4">
          Ratings are only allowed after a genuine interaction (5+ msgs each, 5+
          min duration).
        </p>

        {checking ? (
          <div className="py-8 text-center text-gray-500">
            Checking eligibility...
          </div>
        ) : eligible !== true ? (
          <div className="space-y-4">
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm text-center">
              <strong>Not Eligible to Rate</strong>
              <p className="mt-1">{reason}</p>
            </div>
            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-700 p-2 rounded text-sm mb-2 text-center">
              ✓ Interaction Verified
            </div>

            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setStars(s)}
                  className={`focus:outline-none transition-colors ${
                    s <= stars ? "text-yellow-400" : "text-gray-300"
                  }`}
                  type="button"
                >
                  <Star fill={s <= stars ? "currentColor" : "none"} size={32} />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Feedback (Optional)
              </label>
              <textarea
                className="w-full border rounded-md p-2 text-sm"
                rows={3}
                placeholder="How was your experience?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <Button
              onClick={submitRating}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RateUserModal;
