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
  MapPinIcon,
  BookOpenIcon,
  CalendarIcon,
  BellIcon,
  Star,
} from "lucide-react";
import useSWR from "swr";
import { PostService } from "@/service/posts.service";
import { AnnouncementService } from "@/service/announcement.service";
import Image from "next/image";

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const { data: featuredPosts, isLoading } = useSWR(
    "/posts/featured",
    async () => {
      const response = await PostService.getAll({ limit: 5 });
      return response.data.data;
    }
  );

  const { data: announcementsResponse } = useSWR("/announcement", async () => {
    const response = await AnnouncementService.getAll({ limit: 20 });
    return response.data;
  });

  const announcements = announcementsResponse?.data || [];
  const itemsPerPage = 2;
  const totalPages = Math.ceil(announcements.length / itemsPerPage);
  const currentItems = announcements.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
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

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
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
      ? "bg-green-100 text-green-800 hover:bg-green-200"
      : "bg-blue-100 text-blue-800 hover:bg-blue-200";
  };

  const getPostTypeIcon = (type: string) => {
    return type === "masjid" ? MapPinIcon : BookOpenIcon;
  };

  if (isLoading) {
    return (
      <section className="py-4 sm:py-6 lg:py-8 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
            <div className="lg:col-span-3">
              <div className="aspect-[16/9] sm:aspect-[3/1] bg-gray-200 rounded-2xl animate-pulse" />
            </div>
            <div className="lg:col-span-2 space-y-4 mt-4 lg:mt-0">
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 animate-pulse"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
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
    <section className="py-4 sm:py-6 lg:py-8 bg-white">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 items-start">
          {/* Featured Post Slider */}
          <div className="lg:col-span-3 relative">
            <Card className="overflow-hidden shadow-lg border-0 bg-white p-0">
              <div className="relative aspect-[16/9] sm:aspect-[3/1] overflow-hidden">
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
                      <Image
                        src={
                          currentPost.coverImage
                            ? `${backendBaseUrl}${currentPost.coverImage}`
                            : "/placeholder.svg?height=400&width=1200"
                        }
                        alt={currentPost.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 60vw"
                        className="object-cover"
                        placeholder="blur"
                        blurDataURL="/placeholder.svg?height=400&width=1200"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Content Overlay */}
                      <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 lg:p-6 text-white">
                        <div className="max-w-2xl">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Badge
                              className={`${getPostTypeColor(
                                currentPost.type
                              )} border-0 shadow-sm text-xs`}
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

                          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 line-clamp-2 leading-tight">
                            <Link
                              href={`/posts/${currentPost.slug}`}
                              className="hover:text-blue-300 transition-colors duration-200"
                            >
                              {currentPost.title}
                            </Link>
                          </h2>

                          {currentPost.excerpt && (
                            <p className="text-gray-200 text-xs sm:text-sm lg:text-base line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
                              {currentPost.excerpt}
                            </p>
                          )}

                          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5 sm:h-6 sm:w-6 border-2 border-white/20">
                                <AvatarImage
                                  src={
                                    currentPost.author.avatar ||
                                    "/placeholder.svg"
                                  }
                                  alt={currentPost.author.fullname}
                                />
                                <AvatarFallback className="text-xs bg-gray-600 text-white">
                                  {currentPost.author.fullname
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {currentPost.author.fullname}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
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
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full backdrop-blur-sm transition-all duration-200"
                    >
                      <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextSlide}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full backdrop-blur-sm transition-all duration-200"
                    >
                      <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </>
                )}

                {/* Slide Indicators */}
                {featuredPosts && featuredPosts.length > 1 && (
                  <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {featuredPosts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-200 ${
                          index === currentSlide
                            ? "bg-white ring-2 ring-white/50 scale-110"
                            : "bg-white/50 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Announcements Section */}
          <div className="lg:col-span-2 mt-4 lg:mt-0">
            <Card className="overflow-hidden shadow-lg border-0 bg-white">
              <CardContent className="p-3 sm:p-4 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                    <BellIcon className="h-4 w-4 text-blue-600" />
                    Pengumuman
                  </h3>
                  <Link
                    href="/announcements"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Semua
                  </Link>
                </div>

                {/* Announcements List */}
                <div className="space-y-2 sm:space-y-3">
                  {currentItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer group"
                    >
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                        <AvatarImage
                          src={item.avatar || "/placeholder.svg"}
                          alt="Avatar"
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          <BellIcon className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 line-clamp-2 text-xs leading-relaxed group-hover:text-blue-700 transition-colors duration-200">
                          {item.message}
                        </p>
                        <span className="text-xs text-gray-500 mt-0.5 block">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 pt-3 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevPage}
                      className="h-6 w-6 p-0 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                    >
                      <ChevronLeftIcon className="h-3 w-3" />
                    </Button>

                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx)}
                          className={`h-2 w-2 rounded-full transition-all duration-200 ${
                            currentPage === idx
                              ? "bg-blue-600 scale-110"
                              : "bg-gray-300 hover:bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextPage}
                      className="h-6 w-6 p-0 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                    >
                      <ChevronRightIcon className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
