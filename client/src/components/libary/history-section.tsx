"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HistoryIcon, MapPinIcon, BookOpenIcon, TrashIcon } from "lucide-react";
import { HistoryService } from "@/service/history.service";
import useSWR from "swr";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import { HistoryItem, PaginationData } from "@/types/libary.types";

export function HistorySection() {
  const [page, setPage] = useState(1);
  const limit = 12;

  const {
    data: historyResponse,
    error,
    isLoading,
    mutate,
  } = useSWR(
    ["/history", { page, limit }],
    () => HistoryService.getAll({ page, limit }),
    {
      revalidateOnFocus: false,
    }
  );

  const history = historyResponse?.data?.data || [];
  const pagination = historyResponse?.data?.pagination as PaginationData;

  const handleRemoveHistory = async (postId: string) => {
    try {
      await HistoryService.remove(postId);
      await mutate();
      notify.success("History berhasil dihapus!");
    } catch (err) {
      handleErrorResponse(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Gagal memuat history</p>
        <Button onClick={() => mutate()}>Coba Lagi</Button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <HistoryIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Belum ada history</h3>
        <p className="text-gray-500 mb-4">
          Mulai baca artikel untuk melihat riwayat bacaan
        </p>
        <Button asChild>
          <Link href="/posts">Jelajahi Konten</Link>
        </Button>
      </div>
    );
  }

  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {history.map((historyItem: HistoryItem, index: number) => {
          const TypeIcon = getPostTypeIcon(historyItem.type);
          return (
            <motion.div
              key={historyItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={`${backendBaseUrl}${historyItem.coverImage}`}
                    alt={historyItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className={getPostTypeColor(historyItem.type)}>
                      <TypeIcon className="w-3 h-3 mr-1" />
                      {historyItem.type === "masjid" ? "Masjid" : "Artikel"}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveHistory(historyItem.id);
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {/* Content Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      <Link href={`/posts/${historyItem.slug}`}>
                        {historyItem.title}
                      </Link>
                    </h3>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-4 w-4">
                          <AvatarImage
                            src={
                              historyItem.author.avatar ||
                              "/placeholder.svg?height=40&width=40&text=User"
                            }
                            alt={historyItem.author.fullname}
                          />
                          <AvatarFallback className="text-xs">
                            {historyItem.author.fullname
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                          {historyItem.author.fullname}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HistoryIcon className="h-3 w-3" />
                        <span>{formatDate(historyItem.viewedAt)}</span>
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
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
