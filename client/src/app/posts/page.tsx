import { createMetadata } from "@/lib/meta-data";
import { HeroCarousel } from "@/components/hero-carausel";
import { RecommendationSection } from "@/components/recommendation-section";
import { HistorySection } from "@/components/libary/history-section";

export const metadata = createMetadata({
  title: "Explore",
  description:
    "Temukan rekomendasi terbaik, update terbaru, dan konten populer hanya untuk kamu.",
});

export default function PostsPage() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4">
        <HeroCarousel />
        {/* Recommended Posts Section */}
        <div className="container mx-auto px-4 py-8">
          <RecommendationSection />
        </div>

        <div className="container mx-auto px-4 py-8">
          <h2 className="text-xl lg:text-3xl font-semibold mb-6">
            Lanjut Baca
          </h2>

          <HistorySection />
        </div>
      </main>
    </div>
  );
}
