import React from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/homepage/HeroSection";
import FeaturesSection from "../components/homepage/FeaturesSection";
import ShowcaseSection from "../components/homepage/ShowcaseSection";
import StatsSection from "../components/homepage/StatsSection";
import CTASection from "../components/homepage/CTASection";

const HomePage: React.FC = () => {
  return (
    <div className="relative overflow-x-hidden">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ShowcaseSection />
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
