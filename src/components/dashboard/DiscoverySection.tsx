import React from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Star, Filter, ChevronLeft, ChevronRight } from "lucide-react";

type Match = {
  id: string;
  name: string;
  wants: string;
  teaches: string;
  rating: number;
  exchanges: number;
};

const mockMatches: Match[] = [
  {
    id: "1",
    name: "Akshat",
    wants: "Design",
    teaches: "React",
    rating: 4.8,
    exchanges: 5,
  },
  {
    id: "2",
    name: "Priya",
    wants: "Spanish",
    teaches: "UI/UX",
    rating: 4.9,
    exchanges: 8,
  },
  {
    id: "3",
    name: "Rahul",
    wants: "JavaScript",
    teaches: "Photography",
    rating: 4.7,
    exchanges: 3,
  },
];

const DiscoverySection: React.FC = () => {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateScrollState = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  React.useEffect(() => {
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
  }, [updateScrollState]);

  const scrollByAmount = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 320;
    el.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Recommended Matches</h3>
        <button className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="relative w-full group">
        <div
          ref={scrollRef}
          className="overflow-x-auto pb-2 w-full scroll-smooth"
          role="region"
          aria-label="Recommended matches"
        >
          <div className="flex gap-4 pr-1 snap-x snap-mandatory min-w-0 overscroll-x-contain">
            {mockMatches.map((m) => (
              <Card
                key={m.id}
                className="p-4 snap-start min-w-[16rem] w-[16rem] sm:min-w-[18rem] sm:w-[18rem] md:min-w-[20rem] md:w-[20rem]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold">{m.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Wants to learn:{" "}
                      <span className="font-medium">{m.wants}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Can teach:{" "}
                      <span className="font-medium">{m.teaches}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                      <Star className="w-4 h-4 text-yellow-500" /> {m.rating} |{" "}
                      {m.exchanges} exchanges
                    </div>
                  </div>
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      m.name
                    )}`}
                    alt={m.name}
                    className="w-12 h-12 rounded-xl border border-gray-200"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="primary">
                    Connect
                  </Button>
                  <Button size="sm" variant="outline">
                    View Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollByAmount(-1)}
            className="absolute left-0 top-24 md:top-1/2 -translate-y-1/2 md:-translate-y-1/2 ml-[-8px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 rounded-full shadow-lg bg-white border border-gray-200 p-2 flex"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollByAmount(1)}
            className="absolute right-0 top-24 md:top-1/2 -translate-y-1/2 md:-translate-y-1/2 mr-[-8px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 rounded-full shadow-lg bg-white border border-gray-200 p-2 flex"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DiscoverySection;
