"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useReaderControls() {
  const [isManuallyToggled, setIsManuallyToggled] = useState(false); // Status toggle manual oleh klik/sentuh
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false); // Status apakah sedang di bagian commentar atau tidak
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef(0); // Untuk debounce scroll setelah klik

  // Fungsi untuk memeriksa posisi gulir dan memperbarui isScrolledToBottom
  const checkScrollPosition = useCallback(() => {
    const threshold = 200; // Jarak piksel dari bawah untuk dianggap "di bagian commentar"
    const currentScrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.body.scrollHeight;

    const atBottom =
      currentScrollY + viewportHeight >= documentHeight - threshold;
    setIsScrolledToBottom(atBottom);
  }, []);

  // Fungsi untuk menangani interaksi klik/sentuh
  const handleClickOrTouch = useCallback(() => {
    // Jika sedang di bagian bawah halaman, klik/sentuh tidak akan men-toggle visibilitas
    // Kontrol akan tetap terlihat karena isScrolledToBottom akan TRUE
    if (isScrolledToBottom) {
      return; // Jangan lakukan apa-apa jika sudah di bagian bawah
    }

    // Jika tidak di bagian bawah, toggle visibilitas manual
    setIsManuallyToggled((prev) => !prev);
    lastClickTimeRef.current = Date.now(); // Catat waktu klik terakhir
  }, [isScrolledToBottom]);

  // Fungsi untuk menangani event gulir
  const handleScroll = useCallback(() => {
    // Jangan sembunyikan kontrol jika baru saja diklik (dalam waktu singkat)
    if (Date.now() - lastClickTimeRef.current < 300) {
      // 300ms debounce setelah klik
      return;
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      checkScrollPosition();
      // Jika tidak di bagian bawah DAN kontrol tidak di-toggle manual, sembunyikan
      // Ini akan membuat kontrol auto-hide saat scroll jika tidak di bagian bawah
      // dan tidak di-toggle manual.
      if (!isScrolledToBottom && isManuallyToggled) {
        // Only hide if manually toggled ON and not at bottom
        setIsManuallyToggled(false);
      }
    }, 100); // Debounce scroll checks
  }, [checkScrollPosition, isScrolledToBottom, isManuallyToggled]); // Tambahkan isManuallyToggled sebagai dependency

  useEffect(() => {
    // Lakukan pemeriksaan posisi awal saat komponen dimuat
    checkScrollPosition();

    // Tambahkan event listener
    document.addEventListener("click", handleClickOrTouch);
    document.addEventListener("touchstart", handleClickOrTouch);
    document.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup function untuk menghapus event listener
    return () => {
      document.removeEventListener("click", handleClickOrTouch);
      document.removeEventListener("touchstart", handleClickOrTouch);
      document.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleClickOrTouch, handleScroll, checkScrollPosition]);

  // Status `showControls` yang akan dikembalikan:
  // Kontrol akan terlihat jika di-toggle secara manual ATAU jika sedang di bagian bawah halaman
  const derivedShowControls = isManuallyToggled || isScrolledToBottom;

  // Fungsi setter yang diekspos untuk kontrol eksternal (misalnya dari mode edit)
  const externalSetShowControls = useCallback((value: boolean) => {
    // Ketika diatur secara eksternal, ini akan menimpa status toggle manual
    setIsManuallyToggled(value);
    // isScrolledToBottom tidak diatur di sini karena itu tergantung pada posisi gulir aktual
  }, []);

  return {
    showControls: derivedShowControls,
    setShowControls: externalSetShowControls,
    isScrolledToBottom,
  };
}
