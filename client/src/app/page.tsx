import { MainNavbar } from "@/components/main-navbar";
import { HeroSection } from "@/components/hero-section";
import { FeaturedPosts } from "@/components/featured-posts";
import { FeaturesSection } from "@/components/features-section";
import { MainFooter } from "@/components/main-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <MainNavbar />
      <main>
        <HeroSection />
        <FeaturedPosts />
        <FeaturesSection />
      </main>
      <MainFooter />
    </div>
  );
}
