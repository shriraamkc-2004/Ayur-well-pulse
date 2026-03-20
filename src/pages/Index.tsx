import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { RoleSelection } from "@/components/role-selection";
import { FeaturesShowcase } from "@/components/features-showcase";
import { Footer } from "@/components/footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <RoleSelection />
        <FeaturesShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
