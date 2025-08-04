"use client";

import { Button } from "@/components/ui/button";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";

interface BottomRightControllerProps {
  showControls: boolean;
}

export function BottomRightController({
  showControls,
}: BottomRightControllerProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  return (
    <div
      className={`fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 transition-all duration-300 ${
        showControls
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0"
      }`}
    >
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full w-11 h-11 sm:w-12 sm:h-12 p-0 bg-white shadow-lg backdrop-blur-sm"
          onClick={scrollToTop}
        >
          <ChevronUpIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full w-11 h-11 sm:w-12 sm:h-12 p-0 bg-white shadow-lg backdrop-blur-sm"
          onClick={scrollToBottom}
        >
          <ChevronDownIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>
    </div>
  );
}
