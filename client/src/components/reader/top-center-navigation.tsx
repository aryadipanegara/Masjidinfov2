"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, HomeIcon } from "lucide-react";
import Link from "next/link";

interface TopCenterNavigationProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  showControls: boolean;
}

export function TopCenterNavigation({
  title,
  subtitle,
  onBack,
  showControls,
}: TopCenterNavigationProps) {
  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        showControls
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      }`}
    >
      <div className="flex items-center gap-4 bg-white/95 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="rounded-full w-8 h-8 p-0 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>

        <div className="text-center min-w-0 max-w-xs">
          <div className="font-medium text-gray-900 truncate text-sm">
            {title}
          </div>
          <div className="text-xs text-blue-600 truncate">{subtitle}</div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className="rounded-full w-8 h-8 p-0 hover:bg-gray-100"
        >
          <Link href="/">
            <HomeIcon className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
