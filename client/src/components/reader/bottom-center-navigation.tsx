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
} from "lucide-react";

interface BottomCenterNavigationProps {
  onBack: () => void;
  showControls: boolean;
  isEditMode: boolean;
  isBottomNavAbsolute: boolean; // Prop baru
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
  isEditMode,
  isBottomNavAbsolute, // Destructure prop baru
}: BottomCenterNavigationProps) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState([2]);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);

  const handleAutoScroll = () => {
    if (isAutoScrolling) {
      setIsAutoScrolling(false);
    } else {
      if (autoScrollEnabled) {
        setIsAutoScrolling(true);
        const scrollSpeed = autoScrollSpeed[0] * 10;
        const scrollInterval = setInterval(() => {
          window.scrollBy(0, scrollSpeed);
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
        className={`
          ${
            isBottomNavAbsolute ? "absolute bottom-0 mb-4" : "fixed bottom-6"
          } // Posisi kondisional
          left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300
          ${
            showControls && !isEditMode
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }
        `}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full w-11 h-11 sm:w-12 sm:h-12 p-0 bg-white shadow-lg backdrop-blur-sm"
            onClick={onBack}
          >
            <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          {/* Settings Button */}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full w-11 h-11 sm:w-12 sm:h-12 p-0 bg-white shadow-lg backdrop-blur-sm"
            onClick={() => setShowSettingsModal(true)}
          >
            <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          {/* Play/Pause Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full w-11 h-11 sm:w-12 sm:h-12 p-0 shadow-lg backdrop-blur-sm ${
              isAutoScrolling ? "bg-white " : "bg-white hover:bg-white "
            }`}
            onClick={handleAutoScroll}
            disabled={!autoScrollEnabled}
          >
            {isAutoScrolling ? (
              <PauseIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <PlayIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-md mx-4">
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
    </>
  );
}
