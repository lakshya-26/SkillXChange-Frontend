import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { userService } from "../../services/user.service";

type Match = {
  id: string;
  name: string;
  wants: string;
  teaches: string;
  averageRating: number;
  ratingCount: number;
  exchanges: number;
  formattedReasons: { prefix: string; skills: string[] }[];
};

export type RecommendedMatchesListProps = {
  /** When false, cards wrap in a grid instead of a horizontal scroller */
  layout?: "carousel" | "grid";
};

const RecommendedMatchesList: React.FC<RecommendedMatchesListProps> = ({
  layout = "carousel",
}) => {
  const navigate = useNavigate();
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [connecting, setConnecting] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await userService.getRecommendations();
        const profiles = await Promise.all(
          data.map((u) => userService.profileById(u.id).catch(() => null)),
        );
        const profileMap = new Map<string, any>();
        profiles.forEach((p) => {
          if (p) profileMap.set(String(p.id), p);
        });

        const transformed: Match[] = data.map((user) => {
          const reasons: { prefix: string; skills: string[] }[] = [];

          if (user.reasons?.theyTeachYou?.length) {
            reasons.push({
              prefix: "Can teach you",
              skills: user.reasons.theyTeachYou,
            });
          }
          if (user.reasons?.youTeachThem?.length) {
            reasons.push({
              prefix: "Wants to learn",
              skills: user.reasons.youTeachThem,
            });
          }
          if (reasons.length === 0 && user.reasons?.profileMatch) {
            reasons.push({
              prefix: "Based on profile match",
              skills: [],
            });
          }

          return {
            id: String(user.id),
            name: user.name,
            wants: "",
            teaches: "",
            averageRating: Number(profileMap.get(String(user.id))?.averageRating || 0),
            ratingCount: Number(profileMap.get(String(user.id))?.ratingCount || 0),
            exchanges: Number(profileMap.get(String(user.id))?.exchangeCount || 0),
            formattedReasons: reasons,
          };
        });
        setMatches(transformed);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const updateScrollState = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    if (layout !== "carousel") return;
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    let ro: ResizeObserver | null = null;
    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      ro = new ResizeObserver(() => updateScrollState());
      ro.observe(el);
    }
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (ro) ro.disconnect();
    };
  }, [updateScrollState, matches, layout]);

  const scrollByAmount = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 320;
    el.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
  };

  const handleConnect = async (userId: string) => {
    setConnecting(userId);
    try {
      const { chatService } = await import("../../services/chat.service");
      const conv = await chatService.createConversation(userId);
      navigate(`/messages?conversationId=${conv.id}`);
    } catch (err) {
      console.error("Failed to connect", err);
    } finally {
      setConnecting(null);
    }
  };

  const cardInner = (m: Match) => (
    <Card
      key={m.id}
      className={
        layout === "grid"
          ? "p-4 w-full"
          : "p-4 snap-start min-w-[16rem] w-[16rem] sm:min-w-[18rem] sm:w-[18rem] md:min-w-[20rem] md:w-[20rem]"
      }
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold mb-2">{m.name}</div>

          <div className="space-y-1 mb-3">
            {m.formattedReasons.map((reason, idx) => (
              <div
                key={idx}
                className="text-xs font-medium text-emerald-600 py-1 rounded"
              >
                {reason.prefix}
                {reason.skills.length > 0 && (
                  <>
                    :{" "}
                    <span className="font-bold">
                      {reason.skills.join(", ")}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
            <Star className="w-4 h-4 text-yellow-500" />{" "}
            {m.ratingCount > 0 ? m.averageRating.toFixed(1) : "—"}
            {m.ratingCount > 0 ? ` (${m.ratingCount})` : ""} | {m.exchanges} exchanges
          </div>
        </div>
        <img
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            m.name,
          )}`}
          alt={m.name}
          className="w-12 h-12 rounded-xl border border-gray-200"
        />
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        <Button
          size="sm"
          variant="primary"
          onClick={() => handleConnect(m.id)}
          disabled={connecting === m.id}
        >
          {connecting === m.id ? "..." : "Connect"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/profile/${m.id}`)}
        >
          View Profile
        </Button>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="w-full py-8 text-center text-gray-500">
        Loading recommendations...
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="w-full py-8 text-center text-gray-500">
        No recommendations yet. Add teach and learn skills on your profile to
        get matches.
      </div>
    );
  }

  if (layout === "grid") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {matches.map((m) => cardInner(m))}
      </div>
    );
  }

  return (
    <div className="relative w-full group">
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-2 w-full scroll-smooth"
        role="region"
        aria-label="Recommended matches"
      >
        <div className="flex gap-4 pr-1 snap-x snap-mandatory min-w-0 overscroll-x-contain">
          {matches.map((m) => cardInner(m))}
        </div>
      </div>
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByAmount(-1)}
          className="absolute left-0 top-24 -translate-y-1/2 md:-translate-y-1/2 ml-[-8px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 rounded-full shadow-lg bg-white border border-gray-200 p-2 flex"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByAmount(1)}
          className="absolute right-0 top-24 -translate-y-1/2 md:-translate-y-1/2 mr-[-8px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 rounded-full shadow-lg bg-white border border-gray-200 p-2 flex"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default RecommendedMatchesList;
