"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookmarkIcon,
  ListIcon,
  HistoryIcon,
  CalendarIcon,
  MapPinIcon,
  BookOpenIcon,
} from "lucide-react";
import { MainNavbar } from "@/components/main-navbar";
import { MainFooter } from "@/components/main-footer";
import { useAuth } from "../providers";

const mockBookmarks = [
  {
    id: "1",
    title: "Masjid Hagia Sophia: Keajaiban Arsitektur Bizantium-Ottoman",
    slug: "masjid-hagia-sophia-keajaiban-arsitektur-bizantium-ottoman",
    type: "masjid",
    coverImage: "/placeholder.svg?height=300&width=400&text=Hagia+Sophia",
    author: {
      fullname: "Dr. Ahmad Historian",
      avatar: "/placeholder.svg?height=40&width=40&text=AH",
    },
    bookmarkedAt: "2024-01-20T10:00:00Z",
    categories: [{ category: { name: "Arsitektur Ottoman" } }],
  },
  {
    id: "2",
    title: "Arsitektur Masjid Cordoba: Warisan Andalusia yang Memukau",
    slug: "arsitektur-masjid-cordoba-warisan-andalusia-yang-memukau",
    type: "masjid",
    coverImage: "/placeholder.svg?height=300&width=400&text=Mezquita+Cordoba",
    author: {
      fullname: "Prof. Maria Gonzalez",
      avatar: "/placeholder.svg?height=40&width=40&text=MG",
    },
    bookmarkedAt: "2024-01-18T14:30:00Z",
    categories: [{ category: { name: "Arsitektur Andalusia" } }],
  },
];

const mockReadlist = [
  {
    id: "3",
    title: "Sejarah Masjid Al-Aqsa dan Signifikansinya dalam Islam",
    slug: "sejarah-masjid-al-aqsa-dan-signifikansinya-dalam-islam",
    type: "artikel",
    coverImage: "/placeholder.svg?height=300&width=400&text=Al+Aqsa",
    author: {
      fullname: "Dr. Fatima Al-Zahra",
      avatar: "/placeholder.svg?height=40&width=40&text=FZ",
    },
    addedAt: "2024-01-19T09:15:00Z",
    categories: [{ category: { name: "Sejarah Islam" } }],
    progress: 65, // Reading progress percentage
  },
  {
    id: "4",
    title: "Masjid Sheikh Zayed: Masterpiece Arsitektur Modern",
    slug: "masjid-sheikh-zayed-masterpiece-arsitektur-modern",
    type: "masjid",
    coverImage: "/placeholder.svg?height=300&width=400&text=Sheikh+Zayed",
    author: {
      fullname: "Arch. Hassan Al-Maktoum",
      avatar: "/placeholder.svg?height=40&width=40&text=HM",
    },
    addedAt: "2024-01-17T16:45:00Z",
    categories: [{ category: { name: "Arsitektur Modern" } }],
    progress: 30,
  },
];

const mockHistory = [
  {
    id: "5",
    title: "Masjid Taj Mahal: Keindahan Arsitektur Mughal",
    slug: "masjid-taj-mahal-keindahan-arsitektur-mughal",
    type: "masjid",
    coverImage: "/placeholder.svg?height=300&width=400&text=Taj+Mahal",
    author: {
      fullname: "Dr. Rajesh Kumar",
      avatar: "/placeholder.svg?height=40&width=40&text=RK",
    },
    viewedAt: "2024-01-20T08:30:00Z",
    categories: [{ category: { name: "Arsitektur Mughal" } }],
  },
  {
    id: "6",
    title: "Masjid Hassan II: Kemegahan di Tepi Atlantik",
    slug: "masjid-hassan-ii-kemegahan-di-tepi-atlantik",
    type: "masjid",
    coverImage: "/placeholder.svg?height=300&width=400&text=Hassan+II",
    author: {
      fullname: "Arch. Youssef Bennani",
      avatar: "/placeholder.svg?height=40&width=40&text=YB",
    },
    viewedAt: "2024-01-19T20:15:00Z",
    categories: [{ category: { name: "Arsitektur Maroko" } }],
  },
  {
    id: "7",
    title: "Evolusi Desain Mihrab dalam Arsitektur Masjid",
    slug: "evolusi-desain-mihrab-dalam-arsitektur-masjid",
    type: "artikel",
    coverImage: "/placeholder.svg?height=300&width=400&text=Mihrab+Design",
    author: {
      fullname: "Prof. Amina Hassan",
      avatar: "/placeholder.svg?height=40&width=40&text=AH",
    },
    viewedAt: "2024-01-18T11:20:00Z",
    categories: [{ category: { name: "Elemen Arsitektur" } }],
  },
];

export default function LibraryPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("bookmark");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getPostTypeColor = (type: string) => {
    return type === "masjid"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  };

  const getPostTypeIcon = (type: string) => {
    return type === "masjid" ? MapPinIcon : BookOpenIcon;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <MainNavbar />
        <main className="py-8 pb-20 md:pb-8">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-8" />
              <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full mb-8" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] bg-gray-200 dark:bg-gray-800 rounded-lg"
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
              <div className="mb-8">
                <img
                  src="/placeholder.svg?height=200&width=200&text=Login+Required"
                  alt="Login Required"
                  className="mx-auto mb-6 w-48 h-48 object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold mb-4">Wajib Login!</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Login dulu buat melihat bookmark kamu
              </p>
              <Button
                asChild
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
              >
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
    <div className="min-h-screen">
      <MainNavbar />
      <main className="py-8 pb-20 md:pb-8">
        <div className="container mx-auto px-4">
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mockBookmarks.map((post, index) => {
                  const TypeIcon = getPostTypeIcon(post.type);
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full">
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <img
                            src={post.coverImage || "/placeholder.svg"}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge className={getPostTypeColor(post.type)}>
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {post.type === "masjid" ? "Masjid" : "Artikel"}
                            </Badge>
                          </div>
                          <div className="absolute top-2 right-2">
                            <BookmarkIcon className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          </div>

                          {/* Content Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                              <Link href={`/posts/${post.slug}`}>
                                {post.title}
                              </Link>
                            </h3>

                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage
                                    src={
                                      post.author.avatar || "/placeholder.svg"
                                    }
                                    alt={post.author.fullname}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {post.author.fullname
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">
                                  {post.author.fullname}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                <span>{formatDate(post.bookmarkedAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="readlist">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mockReadlist.map((post, index) => {
                  const TypeIcon = getPostTypeIcon(post.type);
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full">
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <img
                            src={post.coverImage || "/placeholder.svg"}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge className={getPostTypeColor(post.type)}>
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {post.type === "masjid" ? "Masjid" : "Artikel"}
                            </Badge>
                          </div>

                          {/* Progress Bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${post.progress}%` }}
                            />
                          </div>

                          {/* Content Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-0 right-0 p-3 text-white">
                            <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                              <Link href={`/posts/${post.slug}`}>
                                {post.title}
                              </Link>
                            </h3>

                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage
                                    src={
                                      post.author.avatar || "/placeholder.svg"
                                    }
                                    alt={post.author.fullname}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {post.author.fullname
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">
                                  {post.author.fullname}
                                </span>
                              </div>
                              <span className="text-primary font-medium">
                                {post.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mockHistory.map((post, index) => {
                  const TypeIcon = getPostTypeIcon(post.type);
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full">
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <img
                            src={post.coverImage || "/placeholder.svg"}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge className={getPostTypeColor(post.type)}>
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {post.type === "masjid" ? "Masjid" : "Artikel"}
                            </Badge>
                          </div>

                          {/* Content Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                              <Link href={`/posts/${post.slug}`}>
                                {post.title}
                              </Link>
                            </h3>

                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage
                                    src={
                                      post.author.avatar || "/placeholder.svg"
                                    }
                                    alt={post.author.fullname}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {post.author.fullname
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">
                                  {post.author.fullname}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <HistoryIcon className="h-3 w-3" />
                                <span>{formatDate(post.viewedAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
