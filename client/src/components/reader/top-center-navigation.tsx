"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, HomeIcon } from "lucide-react";
import Link from "next/link";

interface TopCenterNavigationProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  showControls: boolean;
  isEditMode: boolean;
}

export function TopCenterNavigation({
  title,
  subtitle,
  onBack,
  showControls,
  isEditMode,
}: TopCenterNavigationProps) {
  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 w-[calc(100%-2rem)] max-w-3xl // Adjusted width for mobile and desktop
        ${
          showControls && !isEditMode
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
    >
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="rounded-full w-9 h-9 p-0 hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>

          {/* Title and Subtitle for Mobile - Flexible width */}
          <div className="flex-1 text-left min-w-0 mx-3">
            <div className="font-semibold text-gray-900 truncate text-base leading-tight">
              {title}
            </div>
            <div className="text-sm text-blue-600 truncate mt-0.5">
              {subtitle}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="rounded-full w-9 h-9 p-0 hover:bg-gray-100"
          >
            <Link href="/">
              <HomeIcon className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Desktop Navigation - Same style but larger and more flexible width */}
      <div className="hidden lg:block">
        <div className="max-w-3xl mx-auto">
          {" "}
          <div className="flex items-center justify-between bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="rounded-full w-11 h-11 p-0 hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </Button>

            {/* Title and Subtitle for Desktop - Flexible width */}
            <div className="flex-1 text-left min-w-0 mx-4">
              {" "}
              <div className="font-semibold text-gray-900 truncate text-lg leading-tight">
                {title}
              </div>
              <div className="text-base text-blue-600 truncate mt-1">
                {subtitle}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="rounded-full w-11 h-11 p-0 hover:bg-gray-100"
            >
              <Link href="/">
                <HomeIcon className="h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
