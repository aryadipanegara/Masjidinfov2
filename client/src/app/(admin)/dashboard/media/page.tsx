"use client";

import { useState } from "react";
import {
  Upload,
  Search,
  MoreHorizontal,
  Eye,
  Copy,
  Trash2,
  FileImage,
  Grid3X3,
  List,
  FolderOpen,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Image from "next/image";
import useSWR from "swr";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import { ImageService } from "@/service/image.service";
import { PostService } from "@/service/posts.service";
import type { Image as ImageType } from "@/types/image.types";
import type { Post } from "@/types/posts.types";
import UploadImageModal from "@/components/upload-image-modal";

const VIEW_MODES = [
  { value: "grid", label: "Grid", icon: Grid3X3 },
  { value: "list", label: "List", icon: List },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "name", label: "Nama A-Z" },
  { value: "size", label: "Ukuran" },
];

const fetchImages = async (url: string) => {
  const [, searchQuery, selectedPost, sortBy, currentPage] = url.split("|");

  const params: Record<string, string | number> = {
    page: Number.parseInt(currentPage) || 1,
    limit: 20,
    sort: sortBy || "newest",
  };

  if (searchQuery && searchQuery !== "undefined") params.search = searchQuery;
  if (selectedPost && selectedPost !== "all") params.postId = selectedPost;

  const response = await ImageService.getAll(params);

  return {
    data: response.data,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: response.data.length,
      itemsPerPage: 20,
    },
  };
};

const fetchPosts = async () => {
  const response = await PostService.getAll({ limit: 100 });
  return response.data.data;
};

const groupImagesByPost = (images: ImageType[], posts: Post[]) => {
  const grouped: { [key: string]: { post: Post | null; images: ImageType[] } } =
    {};

  // Group images by postId
  images.forEach((image) => {
    const key = image.postId || "unassigned";
    if (!grouped[key]) {
      const post = image.postId
        ? posts?.find((p) => p.id === image.postId) || null
        : null;
      grouped[key] = { post, images: [] };
    }
    grouped[key].images.push(image);
  });

  return grouped;
};

export default function MediaManagerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ alt: "", caption: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({});

  const imagesSwrKey = `images|${searchQuery}|${selectedPost}|${sortBy}|${currentPage}`;

  // SWR hooks
  const {
    data: imagesData,
    error: imagesError,
    isLoading: imagesLoading,
    mutate: mutateImages,
  } = useSWR(imagesSwrKey, fetchImages, {
    revalidateOnFocus: false,
  });

  const { data: posts } = useSWR("posts-for-filter", fetchPosts, {
    revalidateOnFocus: false,
  });

  const images = imagesData?.data || [];
  const totalItems = imagesData?.pagination?.totalItems || 0;

  const groupedImages = groupImagesByPost(images, posts || []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePostFilter = (value: string) => {
    setSelectedPost(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleUploadSuccess = () => {
    mutateImages();
  };

  const handleImageDetail = (image: ImageType) => {
    setSelectedImage(image);
    setIsDetailOpen(true);
  };

  const handleEditImage = (image: ImageType) => {
    setSelectedImage(image);
    setEditData({
      alt: image.altText || "",
      caption: image.caption || "",
    });
    setIsEditOpen(true);
  };

  const handleUpdateImage = async () => {
    if (!selectedImage) return;

    setIsSubmitting(true);
    const toastId = notify.loading("Mengupdate gambar...");

    try {
      await ImageService.update(selectedImage.id, {
        altText: editData.alt,
        caption: editData.caption,
      });
      notify.success("Gambar berhasil diupdate!", toastId);

      mutateImages();
      setIsEditOpen(false);
      setSelectedImage(null);
    } catch (error) {
      handleErrorResponse(error, toastId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    const toastId = notify.loading("Menghapus gambar...");

    try {
      await ImageService.delete(imageId);
      notify.success("Gambar berhasil dihapus!", toastId);

      mutateImages();
      setDeleteImageId(null);
    } catch (error) {
      handleErrorResponse(error, toastId);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    notify.success("URL gambar berhasil disalin!");
  };

  const toggleGroupExpansion = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const renderImageCard = (image: ImageType) => (
    <Card key={image.id} className="group relative overflow-hidden">
      <div className="aspect-square relative">
        <Image
          src={image.url || "/placeholder.svg"}
          alt={image.altText || "Image"}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleImageDetail(image)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCopyUrl(image.url)}>
                <Copy className="mr-2 h-4 w-4" />
                Salin URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditImage(image)}>
                <FileImage className="mr-2 h-4 w-4" />
                Edit Info
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteImageId(image.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CardContent className="p-3">
        <div className="space-y-1">
          <p className="text-sm font-medium truncate">
            {image.originalName || "Unnamed"}
          </p>
          {image.altText && (
            <p className="text-xs text-muted-foreground truncate">
              {image.altText}
            </p>
          )}
          {image.caption && (
            <p className="text-xs text-muted-foreground truncate">
              {image.caption}
            </p>
          )}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {new Date(image.uploadedAt).toLocaleDateString()}
            </Badge>
            {image.uploadedBy && (
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={image.uploadedBy.avatar || "/placeholder.svg"}
                />
                <AvatarFallback className="text-xs">
                  {image.uploadedBy.fullname.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (imagesError) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Media Manager</h2>
            <p className="text-muted-foreground">
              Kelola semua gambar dan media konten
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Error loading images. Please try again.
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
          <h2 className="text-3xl font-bold tracking-tight">Media Manager</h2>
          <p className="text-muted-foreground">
            Kelola semua gambar dan media konten
          </p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Gambar
        </Button>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari gambar..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={selectedPost} onValueChange={handlePostFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Post" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Post</SelectItem>
            <SelectItem value="none">Tanpa Post</SelectItem>
            {posts?.map((post) => (
              <SelectItem key={post.id} value={post.id}>
                {post.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border rounded-md">
          {VIEW_MODES.map((mode) => (
            <Button
              key={mode.value}
              variant={viewMode === mode.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode(mode.value as "grid" | "list")}
              className="rounded-none first:rounded-l-md last:rounded-r-md"
            >
              <mode.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{totalItems} gambar total</span>
        <span>•</span>
        <span>{Object.keys(groupedImages).length} grup</span>
      </div>

      {/* Images Display */}
      {imagesLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="aspect-square" />
              <CardContent className="p-3">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : images.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileImage className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum ada gambar</h3>
            <p className="text-muted-foreground mb-4">
              Upload gambar pertama Anda untuk memulai
            </p>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Gambar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedImages).map(([groupKey, group]) => {
            const isExpanded = expandedGroups[groupKey] !== false; // Default to expanded
            const isUnassigned = groupKey === "unassigned";

            return (
              <Collapsible
                key={groupKey}
                open={isExpanded}
                onOpenChange={() => toggleGroupExpansion(groupKey)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FolderOpen className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <CardTitle className="text-lg">
                              {isUnassigned
                                ? "Gambar Tanpa Post"
                                : group.post?.title || "Post Tidak Ditemukan"}
                            </CardTitle>
                            <CardDescription>
                              {group.images.length} gambar
                              {!isUnassigned && group.post?.slug && (
                                <span className="ml-2 text-xs">
                                  • {group.post.slug}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary">{group.images.length}</Badge>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {group.images.map(renderImageCard)}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}

      <UploadImageModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        posts={posts || []}
      />

      {/* Image Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detail Gambar</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang gambar
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative aspect-square">
                  <Image
                    src={selectedImage.url || "/placeholder.svg"}
                    alt={selectedImage.altText || "Image"}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Nama File</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedImage.originalName || "Unnamed"}
                  </p>
                </div>
                <div>
                  <Label>Alt Text</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedImage.altText || "Tidak ada"}
                  </p>
                </div>
                <div>
                  <Label>Caption</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedImage.caption || "Tidak ada"}
                  </p>
                </div>
                <div>
                  <Label>Post</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedImage.postId
                      ? posts?.find((p) => p.id === selectedImage.postId)
                          ?.title || "Post tidak ditemukan"
                      : "Tidak terkait dengan post"}
                  </p>
                </div>
                <div>
                  <Label>Diupload oleh</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={
                          selectedImage.uploadedBy?.avatar || "/placeholder.svg"
                        }
                      />
                      <AvatarFallback className="text-xs">
                        {selectedImage.uploadedBy?.fullname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {selectedImage.uploadedBy?.fullname}
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Tanggal Upload</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedImage.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={selectedImage.url}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyUrl(selectedImage.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Image Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Informasi Gambar</DialogTitle>
            <DialogDescription>
              Update alt text dan caption gambar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-alt">Alt Text</Label>
              <Input
                id="edit-alt"
                value={editData.alt}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, alt: e.target.value }))
                }
                placeholder="Deskripsi gambar untuk aksesibilitas"
              />
            </div>
            <div>
              <Label htmlFor="edit-caption">Caption</Label>
              <Textarea
                id="edit-caption"
                value={editData.caption}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, caption: e.target.value }))
                }
                placeholder="Caption atau deskripsi gambar"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button onClick={handleUpdateImage} disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteImageId}
        onOpenChange={() => setDeleteImageId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Gambar</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus gambar ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteImageId && handleDeleteImage(deleteImageId)}
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
