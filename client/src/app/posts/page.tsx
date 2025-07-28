import { createMetadata } from "@/lib/meta-data";
import { HeroCarousel } from "@/components/hero-carausel";
import { RecommendationSection } from "@/components/recommendation-section";
import { LatestUpdates } from "@/components/latest-updates";

export const metadata = createMetadata({
  title: "Explore",
  description:
    "Temukan rekomendasi terbaik, update terbaru, dan konten populer hanya untuk kamu.",
});

export default function PostsPage() {
  return (
    <section className="py-12 bg-background px-4">
      <div className="container mx-auto ">
        <HeroCarousel />
        {/* Recommended Posts Section */}
        <div className="container mx-auto px-4 py-8">
          <RecommendationSection />
        </div>

        {/* All Posts Section */}
        <div className="container mx-auto px-4 py-8">
          <LatestUpdates />
        </div>
      </div>
    </section>
  );
}
