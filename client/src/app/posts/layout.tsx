"use client";

import { usePathname } from "next/navigation";
import { MainNavbar } from "@/components/main-navbar";
import { MainFooter } from "@/components/main-footer";

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Cek jika path saat ini adalah /posts/<slug> (bukan /posts atau /posts/)
  const isSlugPage = /^\/posts\/[^\/]+$/.test(pathname);

  return (
    <>
      {!isSlugPage && <MainNavbar />}
      {children}
      <MainFooter />
    </>
  );
}
