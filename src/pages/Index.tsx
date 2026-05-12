import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import JourneySection from "@/components/landing/JourneySection";
import RolesSection from "@/components/landing/RolesSection";
import FooterSection from "@/components/landing/FooterSection";
import AppHeader from "@/components/layout/AppHeader";

const Index = () => {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <HeroSection />
      <FeaturesSection />
      <JourneySection />
      <RolesSection />
      <FooterSection />
    </div>
  );
};

export default Index;
