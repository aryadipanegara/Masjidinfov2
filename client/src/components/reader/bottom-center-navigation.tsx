"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  ChevronLeftIcon,
  SettingsIcon,
  PlayIcon,
  PauseIcon,
  HomeIcon,
} from "lucide-react";
import Link from "next/link";

interface BottomCenterNavigationProps {
  onBack: () => void;
  showControls: boolean;
  relatedPosts?: Array<{
    id: string;
    title: string;
    type: string;
    slug: string;
  }>;
}

export function BottomCenterNavigation({
  onBack,
  showControls,
  relatedPosts = [],
}: BottomCenterNavigationProps) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState([2]);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);

  const handleAutoScroll = () => {
    if (isAutoScrolling) {
      setIsAutoScrolling(false);
      // Stop auto scroll logic here
    } else {
      if (autoScrollEnabled) {
        setIsAutoScrolling(true);
        // Start auto scroll logic here
        const scrollSpeed = autoScrollSpeed[0] * 10; // Convert to pixels per interval
        const scrollInterval = setInterval(() => {
          window.scrollBy(0, scrollSpeed);

          // Stop when reaching bottom
          if (
            window.innerHeight + window.scrollY >=
            document.body.offsetHeight
          ) {
            clearInterval(scrollInterval);
            setIsAutoScrolling(false);
          }
        }, 100);
      }
    }
  };

  return (
    <>
      <div
        className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          showControls
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg border border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full w-10 h-10 p-0 hover:bg-gray-100"
            onClick={onBack}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full w-10 h-10 p-0 hover:bg-gray-100"
            onClick={() => setShowSettingsModal(true)}
          >
            <SettingsIcon className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full w-10 h-10 p-0 hover:bg-gray-100 ${
              isAutoScrolling ? "bg-blue-100 text-blue-600" : ""
            }`}
            onClick={handleAutoScroll}
            disabled={!autoScrollEnabled}
          >
            {isAutoScrolling ? (
              <PauseIcon className="h-5 w-5" />
            ) : (
              <PlayIcon className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="rounded-full w-10 h-10 p-0 hover:bg-gray-100"
          >
            <Link href="/">
              <HomeIcon className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pengaturan Auto Scroll</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="auto-scroll-toggle"
                className="text-sm font-medium"
              >
                Aktifkan Auto Scroll
              </Label>
              <Switch
                id="auto-scroll-toggle"
                checked={autoScrollEnabled}
                onCheckedChange={setAutoScrollEnabled}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Kecepatan Scroll: {autoScrollSpeed[0]}x
              </Label>
              <Slider
                value={autoScrollSpeed}
                onValueChange={setAutoScrollSpeed}
                max={10}
                min={1}
                step={1}
                className="w-full"
                disabled={!autoScrollEnabled}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Lambat</span>
                <span>Cepat</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Menu Modal */}
      <Dialog open={showMenuModal} onOpenChange={setShowMenuModal}>
        <DialogContent className="sm:max-w-md max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pilihan Lainnya</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {relatedPosts.length > 0 ? (
              relatedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                  onClick={() => setShowMenuModal(false)}
                >
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {post.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {post.type === "masjid" ? "Masjid" : "Artikel"}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Tidak ada konten terkait</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
