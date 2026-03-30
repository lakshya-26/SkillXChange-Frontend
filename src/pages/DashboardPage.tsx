import React from "react";
import Footer from "../components/layout/Footer";
import DashboardLayout from "../components/layout/DashboardLayout";
import RightSidebar from "../components/dashboard/RightSidebar";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import SkillsSummary from "../components/dashboard/SkillsSummary";
import DiscoverySection from "../components/dashboard/DiscoverySection";
import ActiveExchanges from "../components/dashboard/ActiveExchanges";
import CommunityHighlights from "../components/dashboard/CommunityHighlights";

const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_20rem] gap-8">
        {/* Main Feed Column */}
        <div className="space-y-6 min-w-0">
          <WelcomeBanner />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkillsSummary />
            <CommunityHighlights />
          </div>
          <DiscoverySection />
          <ActiveExchanges />
        </div>

        {/* Right Widget Column */}
        <div className="space-y-6">
          <RightSidebar />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
