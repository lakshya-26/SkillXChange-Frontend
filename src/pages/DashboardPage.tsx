import React from "react";
import Footer from "../components/layout/Footer";
import DashboardTopBar from "../components/dashboard/DashboardTopBar";
import LeftSidebar from "../components/dashboard/LeftSidebar";
import RightSidebar from "../components/dashboard/RightSidebar";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import SkillsSummary from "../components/dashboard/SkillsSummary";
import DiscoverySection from "../components/dashboard/DiscoverySection";
import ActiveExchanges from "../components/dashboard/ActiveExchanges";
import CommunityHighlights from "../components/dashboard/CommunityHighlights";

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardTopBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] xl:grid-cols-[16rem_1fr_20rem] gap-6">
          <LeftSidebar />

          <div className="space-y-6 min-w-0">
            <WelcomeBanner />
            <SkillsSummary />
            <DiscoverySection />
            <ActiveExchanges />
            <CommunityHighlights />
          </div>

          <RightSidebar />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
