"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  MapPinIcon,
  BookOpenIcon,
  StarIcon,
  ArrowRightIcon,
  FilterIcon,
} from "lucide-react";
import useSWR from "swr";
import type { Post } from "@/types/posts.types";
import { PostService } from "@/service/posts.service";

const tabs = [
  { id: "all", label: "Semua", active: true },
  { id: "masjid", label: "Masjid", active: false },
  { id: "artikel", label: "Artikel", active: false },
];

export default function PostsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);

  // Featured post (hero)
  const { data: featuredPost } = useSWR("/posts/featured-single", async () => {
    const response = await PostService.getAll({ limit: 1 });
    return response.data.data[0];
  });

  // Recommended posts (8 posts)
  const { data: recommendedPosts, isLoading: recommendedLoading } = useSWR(
    `/posts/recommended?type=${activeTab}&sort=${sortBy}`,
    async () => {
      const params: any = { limit: 8 };
      if (activeTab !== "all") params.type = activeTab;
      const response = await PostService.getAll(params);
      return response.data.data;
    }
  );

  // All posts with pagination
  const { data: allPostsData, isLoading: allPostsLoading } = useSWR(
    `/posts/all?type=${activeTab}&sort=${sortBy}&page=${currentPage}`,
    async () => {
      const params: any = { limit: 12, page: currentPage };
      if (activeTab !== "all") params.type = activeTab;
      const response = await PostService.getAll(params);
      return response.data;
    }
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "";

  return (
    <div className="min-h-screen">
      <main className="py-4 lg:py-8 pb-20 lg:pb-8">
        <div className="container mx-auto px-4">
          {/* Hero Section - Featured Post */}
          {featuredPost && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8 lg:mb-16"
            >
              <div className="max-w-6xl mx-auto">
                <Card className="overflow-hidden">
                  <div className="relative aspect-[16/9] lg:aspect-[21/9] overflow-hidden">
                    <img
                      src={
                        `${backendBaseUrl}${featuredPost.coverImage}` ||
                        `/featuredPost.coverImage`
                      }
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 lg:p-8 text-white">
                      <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                          <div className="flex items-center gap-1 bg-black/50 px-2 lg:px-3 py-1 rounded-full">
                            <StarIcon className="w-3 lg:w-4 h-3 lg:h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs lg:text-sm font-medium">
                              Featured
                            </span>
                          </div>
                          <Badge
                            className={getPostTypeColor(featuredPost.type)}
                          >
                            {(() => {
                              const TypeIcon = getPostTypeIcon(
                                featuredPost.type
                              );
                              return (
                                <>
                                  <TypeIcon className="w-3 h-3 mr-1" />
                                  {featuredPost.type === "masjid"
                                    ? "Masjid"
                                    : "Artikel"}
                                </>
                              );
                            })()}
                          </Badge>
                          {featuredPost.categories.slice(0, 1).map((cat) => (
                            <Badge
                              key={cat.categoryId}
                              variant="outline"
                              className="bg-white/20 border-white/30 hidden sm:inline-flex"
                            >
                              {cat.category.name}
                            </Badge>
                          ))}
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-5xl font-bold mb-2 lg:mb-4 line-clamp-2">
                          <Link
                            href={`/posts/${featuredPost.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {featuredPost.title}
                          </Link>
                        </h1>
                        {featuredPost.excerpt && (
                          <p className="text-gray-200 text-sm lg:text-lg line-clamp-2 mb-4 lg:mb-6 hidden sm:block">
                            {featuredPost.excerpt}
                          </p>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-2 lg:gap-4 text-xs lg:text-sm">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5 lg:h-6 lg:w-6">
                                <AvatarImage
                                  src={
                                    featuredPost.author.avatar ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg"
                                  }
                                  alt={featuredPost.author.fullname}
                                />
                                <AvatarFallback className="text-xs">
                                  {featuredPost.author.fullname
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate">
                                {featuredPost.author.fullname}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3 lg:h-4 lg:w-4" />
                              <span className="hidden sm:inline">
                                {formatDate(featuredPost.publishedAt)}
                              </span>
                            </div>
                          </div>
                          <Button
                            asChild
                            size="sm"
                            className="bg-white text-black hover:bg-gray-100 w-full sm:w-auto"
                          >
                            <Link href={`/posts/${featuredPost.slug}`}>
                              <span className="sm:hidden">Baca</span>
                              <span className="hidden sm:inline">
                                Baca Selengkapnya
                              </span>
                              <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.section>
          )}

          {/* Recommended Posts Section */}
          <section className="mb-8 lg:mb-16">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8 gap-4">
                <div>
                  <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold mb-1 lg:mb-2">
                    Rekomendasi
                  </h2>
                  <p className="text-sm lg:text-base text-muted-foreground">
                    Posts pilihan yang mungkin Anda sukai
                  </p>
                </div>
                {/* Filter Tabs */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
                  <div className="flex space-x-2">
                    {tabs.map((tab) => (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab(tab.id)}
                        className="rounded-full text-xs lg:text-sm"
                      >
                        {tab.label}
                      </Button>
                    ))}
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-40">
                      <FilterIcon className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Terbaru</SelectItem>
                      <SelectItem value="popular">Populer</SelectItem>
                      <SelectItem value="trending">Trending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Recommended Posts Grid - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
                {recommendedLoading
                  ? [...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                      </div>
                    ))
                  : recommendedPosts?.map((post: Post, index: number) => {
                      const TypeIcon = getPostTypeIcon(post.type);
                      return (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, delay: index * 0.05 }}
                        >
                          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full">
                            <div className="relative aspect-[3/4] overflow-hidden">
                              <img
                                src={`${backendBaseUrl}${post.coverImage}`}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2 left-2">
                                <Badge className={getPostTypeColor(post.type)}>
                                  <TypeIcon className="w-3 h-3 mr-1" />
                                  {post.type === "masjid"
                                    ? "Masjid"
                                    : "Artikel"}
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
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Avatar className="h-4 w-4 flex-shrink-0">
                                      <AvatarImage
                                        src={
                                          post.author.avatar ||
                                          "/placeholder.svg" ||
                                          "/placeholder.svg"
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
                                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                    <CalendarIcon className="h-3 w-3" />
                                    <span className="hidden sm:inline">
                                      {formatDate(post.publishedAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
              </div>
            </div>
          </section>

          {/* All Posts Section */}
          <section>
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold">
                  Semua Posts
                </h2>
              </div>

              {/* All Posts Grid - Fully Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
                {allPostsLoading
                  ? [...Array(12)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                      </div>
                    ))
                  : allPostsData?.data?.map((post: Post, index: number) => {
                      const TypeIcon = getPostTypeIcon(post.type);
                      return (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.05 }}
                        >
                          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                            {post.coverImage && (
                              <div className="aspect-video overflow-hidden">
                                <img
                                  src={`${backendBaseUrl}${post.coverImage}`}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <CardHeader className="pb-2 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge className={getPostTypeColor(post.type)}>
                                  <TypeIcon className="w-3 h-3 mr-1" />
                                  {post.type === "masjid"
                                    ? "Masjid"
                                    : "Artikel"}
                                </Badge>
                                {post.categories.slice(0, 1).map((cat) => (
                                  <Badge
                                    key={cat.categoryId}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {cat.category.name}
                                  </Badge>
                                ))}
                              </div>
                              <CardTitle className="line-clamp-2 text-sm lg:text-base group-hover:text-primary transition-colors">
                                <Link href={`/posts/${post.slug}`}>
                                  {post.title}
                                </Link>
                              </CardTitle>
                              {post.excerpt && (
                                <CardDescription className="line-clamp-2 text-xs lg:text-sm">
                                  {post.excerpt}
                                </CardDescription>
                              )}
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Avatar className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0">
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
                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                  <CalendarIcon className="h-3 w-3" />
                                  <span className="hidden sm:inline">
                                    {formatDate(post.publishedAt)}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
              </div>

              {/* Pagination - Responsive */}
              {allPostsData?.pagination && (
                <div className="flex justify-center">
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                    {currentPage > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="w-full sm:w-auto"
                      >
                        Previous
                      </Button>
                    )}
                    <span className="flex items-center px-4 py-2 text-sm">
                      Page {currentPage} of{" "}
                      {Math.ceil(allPostsData.pagination.totalPages / 12)}
                    </span>
                    {currentPage <
                      Math.ceil(allPostsData.pagination.totalPages / 12) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="w-full sm:w-auto"
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
