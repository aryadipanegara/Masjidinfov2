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

const tabs = [
  { id: "all", label: "Semua", active: true },
  { id: "masjid", label: "Masjid", active: false },
  { id: "artikel", label: "Artikel", active: false },
];

export function RecommendationSection() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: posts, isLoading } = useSWR(
    `/posts/recommendations?type=${activeTab}`,
    async () => {
      const params = activeTab === "all" ? {} : { type: activeTab };
      const response = await PostService.getAll({ ...params, limit: 8 });
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

  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "";

  return (
    <div className="container mx-auto px-4">
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

      {/* Posts Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 overflow-x-auto">
        {isLoading
          ? [...Array(12)].map((_, i) => (
              <div key={i} className="flex-none animate-pulse">
                <div className="aspect-[3/4] rounded-lg mb-3" />
                <div className="h-4  rounded mb-2" />
                <div className="h-3 rounded w-2/3" />
              </div>
            ))
          : posts?.map((post: Post) => {
              const TypeIcon = getPostTypeIcon(post.type);
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-none"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group p-0">
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img
                        src={`${backendBaseUrl}${post.coverImage}`}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
  );
}
