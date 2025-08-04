"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPinIcon,
  BookOpenIcon,
  CompassIcon,
  LightbulbIcon,
  LeafIcon,
} from "lucide-react"; // Import new icons
import useSWR from "swr";
import type { Post } from "@/types/posts.types";
import { PostService } from "@/service/posts.service";
import Image from "next/image";
import { useAuth } from "@/app/providers";

const tabs = [
  { id: "all", label: "Semua" },
  { id: "masjid", label: "Masjid" },
  { id: "sejarah", label: "Sejarah" },
  { id: "kisah", label: "Kisah" },
  { id: "ziarah", label: "Ziarah" },
  { id: "refleksi", label: "Refleksi" },
  { id: "tradisi", label: "Tradisi" },
] as const;

export function RecommendationSection() {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]["id"]>("all");
  const { user } = useAuth();

  const { data: posts, isLoading } = useSWR(
    `/posts/recommended?type=${activeTab}`,
    async () => {
      const params = activeTab === "all" ? {} : { type: activeTab };
      const response = await PostService.getRecommended({
        ...params,
        limit: 8,
      });
      return response.data.data;
    }
  );

  const getPostTypeIcon = (type: Post["type"]) => {
    switch (type) {
      case "masjid":
        return MapPinIcon;
      case "sejarah":
        return BookOpenIcon;
      case "kisah":
        return BookOpenIcon;
      case "ziarah":
        return CompassIcon;
      case "refleksi":
        return LightbulbIcon;
      case "tradisi":
        return LeafIcon;
      default:
        return BookOpenIcon;
    }
  };

  const getPostTypeColor = (type: Post["type"]) => {
    switch (type) {
      case "masjid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "sejarah":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "kisah":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "ziarah":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "refleksi":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300";
      case "tradisi":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const canViewDraft =
    user && ["EDITOR", "ADMIN", "SUPER_ADMIN"].includes(user.role);

  return (
    <div className="container mx-auto">
      {/* Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="rounded-full flex-shrink-0"
          >
            {tab.label}
          </Button>
        ))}
      </div>
      {/* Carousel Container */}
      <div className="relative">
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {isLoading
            ? [...Array(8)].map((_, i) => (
                <div key={i} className="flex-none w-48 animate-pulse">
                  <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              ))
            : posts?.map((post: Post) => {
                const shouldDisplayPost =
                  post.status === "PUBLISHED" ||
                  (post.status === "DRAFT" && canViewDraft);

                if (!shouldDisplayPost) {
                  return null;
                }

                const TypeIcon = getPostTypeIcon(post.type);
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex-none w-48"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group p-0 h-full">
                      <div className="relative aspect-[2/3] overflow-hidden">
                        <Image
                          src={`${post.coverImage}`}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 80vw, (max-width: 1024px) 50vw, 25vw"
                          priority={false}
                        />
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          <Badge className={getPostTypeColor(post.type)}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {post.type.charAt(0).toUpperCase() +
                              post.type.slice(1)}
                          </Badge>
                          {post.status === "DRAFT" && (
                            <Badge
                              variant="secondary"
                              className="bg-orange-500 text-white"
                            >
                              DRAFT
                            </Badge>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 text-white">
                          <h3 className="font-bold text-sm mb-1 line-clamp-2">
                            <Link
                              href={`/posts/${post.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h3>
                          {post.excerpt && (
                            <p className="text-xs opacity-90 line-clamp-1">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
        </div>
      </div>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
