"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useReaderControls() {
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInteraction = useCallback(() => {
    setShowControls(true);
    // Clear existing auto-hide timer
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    // Set new auto-hide after 3 seconds
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const handleScroll = useCallback(() => {
    setShowControls(false);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    // Munculkan kontrol saat halaman dimuat
    handleInteraction();

    // ✅ Hanya reaksi terhadap: klik, tap, dan scroll
    document.addEventListener("click", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);
    document.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      document.removeEventListener("scroll", handleScroll);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [handleInteraction, handleScroll]);

  return { showControls, setShowControls };
}
