"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RotateCcw,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR, { mutate } from "swr";
import type { Post } from "@/types/posts.types";
import { PostService } from "@/service/posts.service";
import { CreateEditPostDialog } from "./components/create-edit-post-dialog";
import Image from "next/image";

const POST_TYPES = [
  { value: "all", label: "Semua Tipe" },
  { value: "masjid", label: "Masjid" },
  { value: "sejarah", label: "Sejarah" },
  { value: "ziarah", label: "Ziarah" },
  { value: "artikel", label: "Artikel" },
  { value: "berita", label: "Berita" },
];

const POST_STATUS = [
  { value: "all", label: "Semua Status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

interface FetchParams {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  status?: string;
  includeDeleted?: boolean;
}

const fetchPosts = async (url: string) => {
  const [
    ,
    searchQuery,
    selectedType,
    selectedStatus,
    showDeleted,
    currentPage,
  ] = url.split("|");

  const params: FetchParams = {
    page: Number.parseInt(currentPage) || 1,
    limit: 10,
  };

  if (searchQuery && searchQuery !== "undefined") params.search = searchQuery;
  if (selectedType && selectedType !== "all") params.type = selectedType;
  if (selectedStatus && selectedStatus !== "all")
    params.status = selectedStatus;
  if (showDeleted === "true") params.includeDeleted = true;

  const response = await PostService.getAll(params);
  return response.data;
};

export default function PostsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreateEditOpen, setIsCreateEditOpen] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const swrKey = `posts|${searchQuery}|${selectedType}|${selectedStatus}|${showDeleted}|${currentPage}`;

  const {
    data: postsData,
    error,
    isLoading,
    mutate: mutatePosts,
  } = useSWR(swrKey, fetchPosts, {
    revalidateOnFocus: false,
    refreshInterval: 0,
  });

  const posts = postsData?.data || [];
  const totalPages = postsData?.pagination?.totalPages || 1;
  const totalItems = postsData?.pagination?.totalItems || 0;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleCreatePost = () => {
    setSelectedPost(null);
    setIsCreateEditOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post);
    setIsCreateEditOpen(true);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await PostService.delete(postId);
      mutatePosts();
      setDeletePostId(null);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleTogglePublish = async (post: Post) => {
    try {
      const newStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      await PostService.update(post.id, { status: newStatus });
      mutatePosts();
    } catch (error) {
      console.error("Error updating post status:", error);
    }
  };

  const handleRestorePost = async (postId: string) => {
    try {
      await PostService.update(postId, { isDeleted: false });
      mutatePosts();
    } catch (error) {
      console.error("Error restoring post:", error);
    }
  };

  const handlePostSuccess = () => {
    mutate(
      (key) => typeof key === "string" && key.startsWith("posts|"),
      undefined,
      { revalidate: true }
    );
    setIsCreateEditOpen(false);
    setSelectedPost(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      published: "default",
      draft: "secondary",
      archived: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      masjid: "bg-green-100 text-green-800",
      sejarah: "bg-blue-100 text-blue-800",
      ziarah: "bg-purple-100 text-purple-800",
      artikel: "bg-orange-100 text-orange-800",
      berita: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={colors[type] || "bg-gray-100 text-gray-800"}>
        {type}
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Manajemen Postingan
            </h2>
            <p className="text-muted-foreground">
              Kelola semua postingan, artikel, dan konten website
            </p>
          </div>
          <Button onClick={handleCreatePost}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Postingan
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Error loading posts. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manajemen Postingan
          </h2>
          <p className="text-muted-foreground">
            Kelola semua postingan, artikel, dan konten website
          </p>
        </div>
        <Button onClick={handleCreatePost}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Postingan
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
          <CardDescription>
            Gunakan filter untuk menemukan postingan yang Anda cari
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan judul, author, atau tags..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={handleTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Tipe" />
              </SelectTrigger>
              <SelectContent>
                {POST_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                {POST_STATUS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showDeleted ? "default" : "outline"}
              onClick={() => setShowDeleted(!showDeleted)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showDeleted ? "Sembunyikan Terhapus" : "Tampilkan Terhapus"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Postingan ({totalItems} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                  <Skeleton className="h-8 w-[100px]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cover</TableHead>
                    <TableHead>Judul & Info</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {post.coverImage ? (
                            <Image
                              src={`${post.coverImage}` || "/placeholder.svg"}
                              alt={post.title || "Untitled post"}
                              width={800}
                              height={450}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Eye className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium line-clamp-2">
                            {post.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            /{post.slug}
                          </p>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.tags.slice(0, 3).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {post.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{post.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={post.author?.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {post.author?.fullname?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {post.author?.fullname || "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(post.type || "artikel")}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(post.status || "draft")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(post.publishedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleEditPost(post)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleTogglePublish(post)}
                            >
                              {post.status === "PUBLISHED" ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Publish
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {post.isDeleted ? (
                              <DropdownMenuItem
                                onClick={() => handleRestorePost(post.id)}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Restore
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setDeletePostId(post.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Post Dialog */}
      <CreateEditPostDialog
        open={isCreateEditOpen}
        onOpenChange={setIsCreateEditOpen}
        post={selectedPost}
        onSuccess={handlePostSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletePostId}
        onOpenChange={() => setDeletePostId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Postingan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus postingan ini? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePostId && handleDeletePost(deletePostId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
