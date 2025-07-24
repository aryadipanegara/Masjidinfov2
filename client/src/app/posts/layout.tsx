"use client";
import { MainFooter } from "@/components/main-footer";
import { MainNavbar } from "@/components/main-navbar";

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainNavbar />
      {children}
      <MainFooter />
    </>
  );
}
