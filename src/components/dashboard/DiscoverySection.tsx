import React from "react";
import { Filter } from "lucide-react";
import RecommendedMatchesList from "./RecommendedMatchesList";

const DiscoverySection: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Recommended Matches</h3>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm px-3 py-2 min-h-[40px] rounded-lg bg-gray-100 hover:bg-gray-200 shrink-0"
        >
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>
      <RecommendedMatchesList layout="carousel" />
    </div>
  );
};

export default DiscoverySection;
