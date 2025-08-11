"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useReaderControls() {
  const [isUserExplicitlyVisible, setIsUserExplicitlyVisible] = useState<
    boolean | null
  >(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const autoHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTouchTimeRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);

  const HIDE_DELAY = 3000; // 3 seconds of inactivity to hide
  const SCROLL_THRESHOLD = 10; // Minimum scroll distance to consider as scrolling

  const resetAutoHideTimer = useCallback(() => {
    if (autoHideTimeoutRef.current) {
      clearTimeout(autoHideTimeoutRef.current);
    }
    if (isUserExplicitlyVisible === null && !isScrolledToBottom) {
      autoHideTimeoutRef.current = setTimeout(() => {
        setIsUserExplicitlyVisible(false);
      }, HIDE_DELAY);
    }
  }, [isUserExplicitlyVisible, isScrolledToBottom]);

  // Handle touch start - record position and time
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    isScrollingRef.current = false;
  }, []);

  // Handle touch move - detect if user is scrolling
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touchY = e.touches[0].clientY;
    const deltaY = Math.abs(touchY - touchStartYRef.current);

    if (deltaY > SCROLL_THRESHOLD) {
      isScrollingRef.current = true;
    }
  }, []);

  // Handle touch end - only toggle if not scrolling
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      // Prevent if user was scrolling
      if (isScrollingRef.current) {
        return;
      }

      // Prevent rapid touches
      const now = Date.now();
      if (now - lastTouchTimeRef.current < 300) {
        return;
      }
      lastTouchTimeRef.current = now;

      // Check if touch target is interactive element
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.closest("button") ||
          target.closest("a") ||
          target.closest('[role="button"]') ||
          target.closest(".tiptap") ||
          target.closest(".ProseMirror") ||
          target.closest("[data-tiptap-editor]") ||
          target.closest(".editor-content"))
      ) {
        return;
      }

      if (isScrolledToBottom) {
        setIsUserExplicitlyVisible(true);
        if (autoHideTimeoutRef.current)
          clearTimeout(autoHideTimeoutRef.current);
        return;
      }

      // Toggle visibility
      setIsUserExplicitlyVisible((prev) => {
        if (prev === null) {
          return true;
        }
        return !prev;
      });

      resetAutoHideTimer();
    },
    [isScrolledToBottom, resetAutoHideTimer]
  );

  // Handle desktop clicks
  const handleClick = useCallback(
    (e: MouseEvent) => {
      // Check if click target is interactive element
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.closest("button") ||
          target.closest("a") ||
          target.closest('[role="button"]') ||
          target.closest(".tiptap") ||
          target.closest(".ProseMirror") ||
          target.closest("[data-tiptap-editor]") ||
          target.closest(".editor-content"))
      ) {
        return;
      }

      if (isScrolledToBottom) {
        setIsUserExplicitlyVisible(true);
        if (autoHideTimeoutRef.current)
          clearTimeout(autoHideTimeoutRef.current);
        return;
      }

      setIsUserExplicitlyVisible((prev) => {
        if (prev === null) {
          return true;
        }
        return !prev;
      });

      resetAutoHideTimer();
    },
    [isScrolledToBottom, resetAutoHideTimer]
  );

  const checkScrollPosition = useCallback(() => {
    const threshold = 200;
    const currentScrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.body.scrollHeight;

    const atBottom =
      currentScrollY + viewportHeight >= documentHeight - threshold;
    setIsScrolledToBottom(atBottom);

    if (atBottom) {
      setIsUserExplicitlyVisible(true);
      if (autoHideTimeoutRef.current) clearTimeout(autoHideTimeoutRef.current);
    } else {
      if (isUserExplicitlyVisible !== false) {
        resetAutoHideTimer();
      }
    }
  }, [isUserExplicitlyVisible, resetAutoHideTimer]);

  const handleScroll = useCallback(() => {
    if (scrollDebounceTimeoutRef.current) {
      clearTimeout(scrollDebounceTimeoutRef.current);
    }
    scrollDebounceTimeoutRef.current = setTimeout(() => {
      checkScrollPosition();
    }, 100);
  }, [checkScrollPosition]);

  useEffect(() => {
    checkScrollPosition();
    resetAutoHideTimer();

    // Use different events for mobile and desktop
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      // Mobile: Use touch events
      document.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      document.addEventListener("touchmove", handleTouchMove, {
        passive: true,
      });
      document.addEventListener("touchend", handleTouchEnd, { passive: true });
    } else {
      // Desktop: Use click events
      document.addEventListener("click", handleClick);
    }

    document.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (isMobile) {
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      } else {
        document.removeEventListener("click", handleClick);
      }
      document.removeEventListener("scroll", handleScroll);
      if (autoHideTimeoutRef.current) clearTimeout(autoHideTimeoutRef.current);
      if (scrollDebounceTimeoutRef.current)
        clearTimeout(scrollDebounceTimeoutRef.current);
    };
  }, [
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleClick,
    handleScroll,
    checkScrollPosition,
    resetAutoHideTimer,
  ]);

  const derivedShowControls =
    isScrolledToBottom ||
    isUserExplicitlyVisible === true ||
    isUserExplicitlyVisible === null;

  const externalSetShowControls = useCallback(
    (value: boolean) => {
      setIsUserExplicitlyVisible(value);
      if (value) {
        resetAutoHideTimer();
      } else {
        if (autoHideTimeoutRef.current)
          clearTimeout(autoHideTimeoutRef.current);
      }
    },
    [resetAutoHideTimer]
  );

  return {
    showControls: derivedShowControls,
    setShowControls: externalSetShowControls,
    isScrolledToBottom,
  };
}
