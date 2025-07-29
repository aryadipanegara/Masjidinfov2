"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ListIcon,
  CalendarIcon,
  MapPinIcon,
  BookOpenIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { ReadlistService } from "@/service/readlist.service";
import useSWR from "swr";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import { PaginationData, ReadlistItem } from "@/types/libary.types";

export function ReadlistSection() {
  const [page, setPage] = useState(1);
  const [selectedReadlist, setSelectedReadlist] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newReadlistName, setNewReadlistName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const limit = 12;

  const {
    data: readlistsResponse,
    error,
    isLoading,
    mutate,
  } = useSWR(
    ["/readlists", { page, limit }],
    () => ReadlistService.getAll({ page, limit }),
    {
      revalidateOnFocus: false,
    }
  );

  const {
    data: readlistPostsResponse,
    isLoading: isLoadingPosts,
    mutate: mutatePosts,
  } = useSWR(
    selectedReadlist
      ? [`/readlists/${selectedReadlist}/posts`, { page: 1, limit: 20 }]
      : null,
    () =>
      selectedReadlist
        ? ReadlistService.getPosts(selectedReadlist, { page: 1, limit: 20 })
        : null,
    {
      revalidateOnFocus: false,
    }
  );

  const readlists = readlistsResponse?.data?.data || [];
  const pagination = readlistsResponse?.data?.pagination as PaginationData;
  const readlistPosts = readlistPostsResponse?.data?.data || [];
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "";

  const handleCreateReadlist = async () => {
    if (!newReadlistName.trim()) return;

    setIsCreating(true);
    try {
      await ReadlistService.create(newReadlistName.trim());
      await mutate();
      setNewReadlistName("");
      setShowCreateDialog(false);
      notify.success("Readlist berhasil dibuat!");
    } catch (err) {
      handleErrorResponse(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoveFromReadlist = async (
    readlistId: string,
    postId: string
  ) => {
    try {
      await ReadlistService.removePost(readlistId, postId);
      await mutatePosts();
      notify.success("Post berhasil dihapus dari readlist!");
    } catch (err) {
      handleErrorResponse(err);
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
        <p className="text-gray-500 mb-4">Gagal memuat readlist</p>
        <Button onClick={() => mutate()}>Coba Lagi</Button>
      </div>
    );
  }

  if (selectedReadlist) {
    const currentReadlist = readlists.find(
      (r: ReadlistItem) => r.id === selectedReadlist
    );
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => setSelectedReadlist(null)}
              className="mb-2"
            >
              ← Kembali ke Readlists
            </Button>
            <h3 className="text-xl font-semibold">{currentReadlist?.name}</h3>
            <p className="text-gray-500">{readlistPosts.length} artikel</p>
          </div>
        </div>

        {isLoadingPosts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : readlistPosts.length === 0 ? (
          <div className="text-center py-12">
            <ListIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Readlist kosong</h3>
            <p className="text-gray-500">
              Belum ada artikel dalam readlist ini
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {readlistPosts.map((item: any, index: number) => {
              const TypeIcon = getPostTypeIcon(item.type);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={`${backendBaseUrl}${item.coverImage}`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className={getPostTypeColor(item.type)}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {item.type === "masjid" ? "Masjid" : "Artikel"}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveFromReadlist(selectedReadlist, item.id);
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* Content Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          <Link href={`/posts/${item.slug}`}>{item.title}</Link>
                        </h3>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-4 w-4">
                              <AvatarImage
                                src={
                                  item.author.avatar ||
                                  "/placeholder.svg?height=40&width=40&text=User"
                                }
                                alt={item.author.fullname}
                              />
                              <AvatarFallback className="text-xs">
                                {item.author.fullname
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">
                              {item.author.fullname}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{formatDate(item.addedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Readlists Anda</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Buat Readlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Readlist Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="readlist-name">Nama Readlist</Label>
                <Input
                  id="readlist-name"
                  value={newReadlistName}
                  onChange={(e) => setNewReadlistName(e.target.value)}
                  placeholder="Masukkan nama readlist..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateReadlist}
                  disabled={isCreating || !newReadlistName.trim()}
                >
                  {isCreating ? "Membuat..." : "Buat"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Batal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {readlists.length === 0 ? (
        <div className="text-center py-12">
          <ListIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Belum ada readlist</h3>
          <p className="text-gray-500 mb-4">
            Buat readlist untuk mengorganisir bacaan Anda
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Buat Readlist Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {readlists.map((readlist: ReadlistItem, index: number) => (
            <motion.div
              key={readlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card
                className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group h-full"
                onClick={() => setSelectedReadlist(readlist.id)}
              >
                <div className="text-center">
                  <ListIcon className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {readlist.name}
                  </h3>
                  {/* <p className="text-sm text-gray-500 mb-2">
                    {readlist._count} artikel
                  </p> */}
                  <p className="text-xs text-gray-400">
                    {formatDate(readlist.createdAt)}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

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
