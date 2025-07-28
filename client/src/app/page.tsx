import { MainNavbar } from "@/components/main-navbar";
import { MainFooter } from "@/components/main-footer";
import { RecommendationSection } from "@/components/recommendation-section";
import { LatestUpdates } from "@/components/latest-updates";
import { PopularSection } from "@/components/popular-section";
import { HeroBanner } from "@/components/hero-banner";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <MainNavbar />
      <main>
        <HeroBanner />
        <RecommendationSection />
        <LatestUpdates />
        <PopularSection />
      </main>
      <MainFooter />
    </div>
  );
}
