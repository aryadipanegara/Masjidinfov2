"use client";

import { useRouter } from "next/navigation";
import { TopCenterNavigation } from "./top-center-navigation";
import { useReaderControls } from "@/hooks/use-reader-controls";

interface TopNavigationWrapperProps {
  title: string;
  subtitle: string;
}

export function TopNavigationWrapper({
  title,
  subtitle,
}: TopNavigationWrapperProps) {
  const router = useRouter();
  const { showControls } = useReaderControls();

  return (
    <TopCenterNavigation
      title={title}
      subtitle={subtitle}
      onBack={() => router.back()}
      showControls={showControls}
    />
  );
}
