import { createMetadata } from "@/lib/meta-data";
import { MainNavbar } from "@/components/main-navbar";
import { MainFooter } from "@/components/main-footer";
import { RecommendationSection } from "@/components/recommendation-section";
import { LatestUpdates } from "@/components/latest-updates";
import { PopularSection } from "@/components/popular-section";
import { HeroBanner } from "@/components/hero-banner";

export const metadata = createMetadata({
  title: "Homepage",
  description:
    "Temukan rekomendasi terbaik, update terbaru, dan konten populer hanya untuk kamu.",
  keywords: ["rekomendasi", "update", "populer", "masjid"],
});

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <MainNavbar />
      <main className="container mx-auto px-4">
        <HeroBanner />
        <div className="pb-8 px-4">
          <h2 className="text-xl lg:text-3xl font-semibold mb-6">
            Rekomendasi
          </h2>
          <RecommendationSection />
        </div>

        {/* Updates */}
        <div className="pb-8 px-4">
          <h2 className="text-xl lg:text-3xl font-semibold mb-6">Updates</h2>
          <LatestUpdates />
        </div>

        {/* Populer */}
        <div className="px-4">
          <h2 className="text-xl lg:text-3xl font-semibold mb-6">Populer</h2>
          <PopularSection />
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
