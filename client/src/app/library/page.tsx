"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkIcon, ListIcon, HistoryIcon } from "lucide-react";
import { MainNavbar } from "@/components/main-navbar";
import { MainFooter } from "@/components/main-footer";
import { useAuth } from "../providers";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookmarkSection } from "@/components/libary/bookmark-section";
import { ReadlistSection } from "@/components/libary/readlist-section";
import { HistorySection } from "@/components/libary/history-section";

export default function LibraryPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("bookmark");

  if (loading) {
    return (
      <div className="min-h-screen">
        <MainNavbar />
        <main className="py-8 pb-20 md:pb-8">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
              <div className="h-10 bg-gray-200 rounded w-full mb-8" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] bg-gray-200 rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
        <MainFooter />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <MainNavbar />
        <main className="py-8 pb-20 md:pb-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <h1 className="text-3xl font-bold mb-4">Wajib Login!</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Login dulu buat melihat library kamu
              </p>
              <Button asChild size="lg">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </main>
        <MainFooter />
      </div>
    );
  }

  return (
    <>
      <MainNavbar />
      <main className="min-h-screen py-8 pb-20 md:pb-8 px-14">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Library</h1>
            <p className="text-muted-foreground">
              Kelola koleksi bacaan dan riwayat Anda
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="bookmark" className="flex items-center gap-2">
                <BookmarkIcon className="h-4 w-4" />
                Bookmark
              </TabsTrigger>
              <TabsTrigger value="readlist" className="flex items-center gap-2">
                <ListIcon className="h-4 w-4" />
                Readlist
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <HistoryIcon className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookmark">
              <BookmarkSection />
            </TabsContent>

            <TabsContent value="readlist">
              <ReadlistSection />
            </TabsContent>

            <TabsContent value="history">
              <HistorySection />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <MainFooter />
    </>
  );
}
