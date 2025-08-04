"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPinIcon, BookOpenIcon } from "lucide-react";
import useSWR from "swr";
import type { Post } from "@/types/posts.types";
import { PostService } from "@/service/posts.service";
import Image from "next/image";

const tabs = [
  { id: "all", label: "Semua", active: true },
  { id: "masjid", label: "Masjid", active: false },
  { id: "artikel", label: "Artikel", active: false },
];

export function RecommendationSection() {
  const [activeTab, setActiveTab] = useState("all");

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

  const getPostTypeIcon = (type: string) => {
    return type === "masjid" ? MapPinIcon : BookOpenIcon;
  };

  const getPostTypeColor = (type: string) => {
    return type === "masjid"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  };

  return (
    <div className="container mx-auto">
      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="rounded-full"
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
                        <div className="absolute top-2 left-2">
                          <Badge className={getPostTypeColor(post.type)}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {post.type === "masjid" ? "Masjid" : "Artikel"}
                          </Badge>
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
