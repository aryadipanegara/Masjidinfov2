"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  MapPinIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import useSWR from "swr";
import type { Post } from "@/types/posts.types";
import { PostService } from "@/service/posts.service";

export function LatestUpdates() {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 8;

  const { data, isLoading } = useSWR(
    `/posts/latest?page=${currentPage}`,
    async () => {
      const response = await PostService.getAll({
        limit: postsPerPage,
        page: currentPage,
      });
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

  const totalPages = data?.pagination
    ? Math.ceil(data.pagination.totalPages / postsPerPage)
    : 1;

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="h-8 rounded w-48 mx-auto mb-4 animate-pulse" />
          <div className="h-4 rounded w-96 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] rounded-lg mb-2" />
              <div className="h-4 rounded mb-1" />
              <div className="h-3 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "";

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {data?.data?.map((post: Post, index: number) => {
          const TypeIcon = getPostTypeIcon(post.type);
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
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
                      {post.type === "masjid" ? "Masjid" : "Artikel"}
                    </Badge>
                  </div>
                  {post.categories.slice(0, 1).map((cat) => (
                    <Badge
                      key={cat.categoryId}
                      variant="outline"
                      className="absolute top-2 right-2 text-xs bg-white/90"
                    >
                      {cat.category.name}
                    </Badge>
                  ))}

                  {/* Content Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-4 w-4">
                          <AvatarImage
                            src={post.author.avatar || "/placeholder.svg"}
                            alt={post.author.fullname}
                          />
                          <AvatarFallback className="text-xs">
                            {post.author.fullname
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{post.author.fullname}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="flex items-center gap-2 bg-transparent"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 bg-transparent"
          >
            Next
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
