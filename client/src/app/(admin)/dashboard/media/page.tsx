"use client";

import type React from "react";

import { useState, useRef } from "react";
import {
  Upload,
  Search,
  MoreHorizontal,
  Eye,
  Copy,
  Trash2,
  Download,
  FileImage,
  Grid3X3,
  List,
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
import useSWR from "swr";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import { ImageService } from "@/service/image.service";
import { PostService } from "@/service/posts.service";
import { Image } from "@/types/image.types";
import { Post } from "@/types/posts.types";

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

// SWR fetcher
const fetchImages = async (url: string) => {
  const [, searchQuery, selectedPost, sortBy, currentPage] = url.split("|");

  const params: any = {
    page: Number.parseInt(currentPage) || 1,
    limit: 20,
    sort: sortBy || "newest",
  };

  if (searchQuery && searchQuery !== "undefined") params.search = searchQuery;
  if (selectedPost && selectedPost !== "all") params.postId = selectedPost;

  const response = await ImageService.getAll(params);
  let filteredImages = response.data.data;

  if (searchQuery && searchQuery !== "undefined") {
    filteredImages = filteredImages.filter(
      (image) =>
        image.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.alt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.caption?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (selectedPost && selectedPost !== "all") {
    filteredImages = filteredImages.filter(
      (image) => image.post?.id === selectedPost
    );
  }

  return {
    data: filteredImages,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: filteredImages.length,
      itemsPerPage: 20,
    },
  };
};

const fetchPosts = async () => {
  const response = await PostService.getAll({ limit: 100 });
  return response.data.data;
};

export default function MediaManagerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ alt: "", caption: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const totalPages = imagesData?.pagination?.totalPages || 1;
  const totalItems = imagesData?.pagination?.totalItems || 0;

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const toastId = notify.loading("Mengupload gambar...");

    try {
      const uploadPromises = Array.from(files).map((file) => {
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} bukan file gambar`);
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} terlalu besar (maksimal 5MB)`);
        }
        return ImageService.upload(file);
      });

      await Promise.all(uploadPromises);
      notify.success(`${files.length} gambar berhasil diupload!`, toastId);

      mutateImages();

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      handleErrorResponse(error, toastId);
    }
  };

  const handleImageDetail = (image: Image) => {
    setSelectedImage(image);
    setIsDetailOpen(true);
  };

  const handleEditImage = (image: Image) => {
    setSelectedImage(image);
    setEditData({
      alt: image.alt || "",
      caption: image.caption || "",
    });
    setIsEditOpen(true);
  };

  const handleUpdateImage = async () => {
    if (!selectedImage) return;

    setIsSubmitting(true);
    const toastId = notify.loading("Mengupdate gambar...");

    try {
      await ImageService.update(selectedImage.id, editData);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Gambar
        </Button>
      </div>

      {/* Upload Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
          <CardDescription>
            Cari dan filter gambar berdasarkan nama, postingan, atau tanggal
            upload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan nama file, alt text, atau caption..."
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
                <SelectItem value="all">Semua Postingan</SelectItem>
                {posts?.map((post: Post) => (
                  <SelectItem key={post.id} value={post.id}>
                    {post.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg">
              {VIEW_MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Button
                    key={mode.value}
                    variant={viewMode === mode.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode(mode.value as "grid" | "list")}
                    className="rounded-none first:rounded-l-lg last:rounded-r-lg"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images Display */}
      <Card>
        <CardHeader>
          <CardTitle>Galeri Media ({totalItems} gambar)</CardTitle>
        </CardHeader>
        <CardContent>
          {imagesLoading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
                  : "space-y-4"
              }
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={
                    viewMode === "grid"
                      ? "space-y-2"
                      : "flex items-center space-x-4"
                  }
                >
                  <Skeleton
                    className={
                      viewMode === "grid" ? "aspect-square w-full" : "h-16 w-16"
                    }
                  />
                  {viewMode === "list" && (
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((image) => (
                <div key={image.id} className="group relative">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.alt || image.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => handleImageDetail(image)}
                    />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleImageDetail(image)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditImage(image)}
                        >
                          <FileImage className="mr-2 h-4 w-4" />
                          Edit Info
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCopyUrl(image.url)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Salin URL
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
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
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium truncate">
                      {image.originalName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.alt || image.originalName}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => handleImageDetail(image)}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{image.originalName}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(image.size)}</span>
                      <span>•</span>
                      <span>{image.mimeType}</span>
                      <span>•</span>
                      <span>{formatDate(image.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={image.uploadedBy.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback className="text-xs">
                          {image.uploadedBy.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {image.uploadedBy.name}
                      </span>
                      {image.post && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <Badge variant="outline">{image.post.title}</Badge>
                        </>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleImageDetail(image)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditImage(image)}>
                        <FileImage className="mr-2 h-4 w-4" />
                        Edit Info
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleCopyUrl(image.url)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Salin URL
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
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
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4 border-t">
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

      {/* Image Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Gambar</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang gambar
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <img
                    src={selectedImage.url || "/placeholder.svg"}
                    alt={selectedImage.alt || selectedImage.originalName}
                    className="w-full rounded-lg border"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Nama File</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedImage.originalName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">URL</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={selectedImage.url}
                        readOnly
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleCopyUrl(selectedImage.url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Ukuran</Label>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(selectedImage.size)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tipe</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedImage.mimeType}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Alt Text</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedImage.alt || "Tidak ada"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Caption</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedImage.caption || "Tidak ada"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Diupload oleh</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            selectedImage.uploadedBy.avatar ||
                            "/placeholder.svg"
                          }
                        />
                        <AvatarFallback>
                          {selectedImage.uploadedBy.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {selectedImage.uploadedBy.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedImage.uploadedBy.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  {selectedImage.post && (
                    <div>
                      <Label className="text-sm font-medium">
                        Digunakan di
                      </Label>
                      <Badge variant="outline" className="mt-1">
                        {selectedImage.post.title}
                      </Badge>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Dibuat</Label>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedImage.createdAt)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Diupdate</Label>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedImage.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Image Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Informasi Gambar</DialogTitle>
            <DialogDescription>
              Update alt text dan caption untuk gambar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={editData.alt}
                onChange={(e) =>
                  setEditData({ ...editData, alt: e.target.value })
                }
                placeholder="Deskripsi gambar untuk accessibility"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={editData.caption}
                onChange={(e) =>
                  setEditData({ ...editData, caption: e.target.value })
                }
                placeholder="Caption atau keterangan gambar"
                rows={3}
              />
            </div>
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
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteImageId}
        onOpenChange={() => setDeleteImageId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Gambar</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus gambar ini? Tindakan ini tidak
              dapat dibatalkan dan dapat mempengaruhi postingan yang menggunakan
              gambar ini.
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
