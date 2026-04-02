import React from "react";
import RecommendedMatchesList from "./RecommendedMatchesList";

const DiscoverySection: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Recommended Matches</h3>
      </div>
      <RecommendedMatchesList layout="carousel" />
    </div>
  );
};

export default DiscoverySection;
