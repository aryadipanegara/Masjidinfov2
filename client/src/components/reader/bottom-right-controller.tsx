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
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        showControls
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0"
      }`}
    >
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full w-12 h-12 p-0 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 hover:bg-gray-50"
          onClick={scrollToTop}
        >
          <ChevronUpIcon className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full w-12 h-12 p-0 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 hover:bg-gray-50"
          onClick={scrollToBottom}
        >
          <ChevronDownIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
