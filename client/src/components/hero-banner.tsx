"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  MapPinIcon,
  BookOpenIcon,
  CalendarIcon,
  BellIcon,
} from "lucide-react";
import useSWR from "swr";
import { PostService } from "@/service/posts.service";

const mockAnnouncements = [
  {
    id: "1",
    title: "Perubahan Sistem Pembelian Premium dan Pembelian dari Luar Negeri.",
    date: "17 April 2025",
    avatar: "/placeholder.svg?height=40&width=40&text=A1",
  },
  {
    id: "2",
    title: "GANTI DOMAIN - Mohon Login Ulang",
    date: "16 March 2025",
    avatar: "/placeholder.svg?height=40&width=40&text=A2",
  },
  {
    id: "3",
    title: "Update Fitur Pencarian dan Filter Baru",
    date: "15 March 2025",
    avatar: "/placeholder.svg?height=40&width=40&text=A3",
  },
  {
    id: "4",
    title: "Maintenance Server Terjadwal",
    date: "14 March 2025",
    avatar: "/placeholder.svg?height=40&width=40&text=A4",
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: featuredPosts, isLoading } = useSWR(
    "/posts/featured",
    async () => {
      const response = await PostService.getAll({ limit: 5 });
      return response.data.data;
    }
  );

  // Auto-slide functionality
  useEffect(() => {
    if (!featuredPosts || featuredPosts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredPosts]);

  const nextSlide = () => {
    if (featuredPosts) {
      setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
    }
  };

  const prevSlide = () => {
    if (featuredPosts) {
      setCurrentSlide(
        (prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length
      );
    }
  };

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

  if (isLoading) {
    return (
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="aspect-[2/1] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 animate-pulse"
                >
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentPost = featuredPosts?.[currentSlide];
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "";

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured Post Slider */}
          <div className="lg:col-span-2 relative">
            <Card className="overflow-hidden h-full">
              <div className="relative aspect-[2/1] overflow-hidden">
                <AnimatePresence mode="wait">
                  {currentPost && (
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      <img
                        src={
                          currentPost.coverImage
                            ? `${backendBaseUrl}${currentPost.coverImage}`
                            : "/placeholder.svg?height=400&width=800"
                        }
                        alt={currentPost.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

                      {/* Content Overlay */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8 text-white">
                        <div className="max-w-2xl">
                          <div className="flex items-center gap-3 mb-4">
                            <Badge
                              className={getPostTypeColor(currentPost.type)}
                            >
                              {(() => {
                                const TypeIcon = getPostTypeIcon(
                                  currentPost.type
                                );
                                return (
                                  <>
                                    <TypeIcon className="w-3 h-3 mr-1" />
                                    {currentPost.type === "masjid"
                                      ? "Masjid"
                                      : "Artikel"}
                                  </>
                                );
                              })()}
                            </Badge>
                          </div>

                          <h2 className="text-2xl lg:text-3xl font-bold mb-3 line-clamp-2">
                            <Link
                              href={`/posts/${currentPost.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {currentPost.title}
                            </Link>
                          </h2>

                          {currentPost.excerpt && (
                            <p className="text-gray-200 text-sm lg:text-base line-clamp-2 mb-4">
                              {currentPost.excerpt}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={
                                    currentPost.author.avatar ||
                                    "/placeholder.svg"
                                  }
                                  alt={currentPost.author.fullname}
                                />
                                <AvatarFallback className="text-xs">
                                  {currentPost.author.fullname
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span>{currentPost.author.fullname}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{formatDate(currentPost.publishedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Arrows */}
                {featuredPosts && featuredPosts.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-8 w-8 p-0"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-8 w-8 p-0"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Slide Indicators */}
              {featuredPosts && featuredPosts.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {featuredPosts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentSlide
                          ? "bg-white ring-2 ring-white/50"
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Announcements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BellIcon className="h-5 w-5 text-primary" />
                Pengumuman
              </h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/announcements">Semua</Link>
              </Button>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                {mockAnnouncements.map((announcement, index) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage
                        src={announcement.avatar || "/placeholder.svg"}
                        alt="Announcement"
                      />
                      <AvatarFallback>
                        <BellIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-2 mb-1">
                        {announcement.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {announcement.date}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
