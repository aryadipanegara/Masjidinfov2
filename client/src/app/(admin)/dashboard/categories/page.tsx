"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  MoreHorizontal,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Skeleton } from "@/components/ui/skeleton";
import useSWR, { mutate } from "swr";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import { CategoryService } from "@/service/category.service";

interface Category {
  id: string;
  name: string;
  postCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryQueryParams {
  page: number;
  limit: number;
  search?: string;
}

const fetchCategories = async (url: string) => {
  const [, searchQuery, currentPage] = url.split("|");

  const params: CategoryQueryParams = {
    page: Number.parseInt(currentPage) || 1,
    limit: 20,
  };

  if (searchQuery && searchQuery !== "undefined") params.search = searchQuery;

  const response = await CategoryService.getAll(params);
  return response.data;
};

export default function CategoriesManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateEditOpen, setIsCreateEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const swrKey = `categories|${searchQuery}|${currentPage}`;

  const {
    data: categoriesData,
    error,
    isLoading,
    mutate: mutateCategories,
  } = useSWR(swrKey, fetchCategories, {
    revalidateOnFocus: false,
  });

  const categories = categoriesData?.data || [];
  const totalPages = categoriesData?.pagination?.totalPages || 1;
  const totalItems = categoriesData?.pagination?.totalItems || 0;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setCategoryName("");
    setIsCreateEditOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setIsCreateEditOpen(true);
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      notify.error("Nama kategori harus diisi");
      return;
    }

    setIsSubmitting(true);
    const toastId = notify.loading(
      selectedCategory ? "Mengupdate kategori..." : "Membuat kategori..."
    );

    try {
      if (selectedCategory) {
        await CategoryService.update(selectedCategory.id, categoryName.trim());
        notify.success("Kategori berhasil diupdate!", toastId);
      } else {
        await CategoryService.create(categoryName.trim());
        notify.success("Kategori berhasil dibuat!", toastId);
      }

      mutateCategories();
      mutate(
        (key) => typeof key === "string" && key.startsWith("posts|"),
        undefined,
        { revalidate: true }
      );

      setIsCreateEditOpen(false);
      setCategoryName("");
      setSelectedCategory(null);
    } catch (error) {
      if (error) {
        notify.error("Nama kategori sudah ada, gunakan nama lain", toastId);
      } else {
        handleErrorResponse(error, toastId);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategory) return;

    const toastId = notify.loading("Menghapus kategori...");

    try {
      await CategoryService.delete(deleteCategory.id);
      notify.success("Kategori berhasil dihapus!", toastId);

      mutateCategories();
      mutate(
        (key) => typeof key === "string" && key.startsWith("posts|"),
        undefined,
        { revalidate: true }
      );

      setDeleteCategory(null);
    } catch (error) {
      if (error) {
        notify.error(
          "Tidak dapat menghapus kategori yang masih digunakan",
          toastId
        );
      } else {
        handleErrorResponse(error, toastId);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Manajemen Kategori
            </h2>
            <p className="text-muted-foreground">
              Kelola kategori untuk mengorganisir postingan
            </p>
          </div>
          <Button onClick={handleCreateCategory}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kategori
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Error loading categories. Please try again.
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
            Manajemen Kategori
          </h2>
          <p className="text-muted-foreground">
            Kelola kategori untuk mengorganisir postingan
          </p>
        </div>
        <Button onClick={handleCreateCategory}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Pencarian Kategori</CardTitle>
          <CardDescription>Cari kategori berdasarkan nama</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kategori..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori ({totalItems} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-[60px]" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Jumlah Postingan</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead>Diupdate</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category: Category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FolderOpen className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ID: {category.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {category.postCount || 0} postingan
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(category.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(category.updatedAt)}
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
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteCategory(category)}
                              className="text-red-600"
                              disabled={(category.postCount || 0) > 0}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
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

      {/* Create/Edit Category Dialog */}
      <Dialog open={isCreateEditOpen} onOpenChange={setIsCreateEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? "Update nama kategori"
                : "Buat kategori baru untuk mengorganisir postingan"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nama Kategori</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Masukkan nama kategori"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateEditOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !categoryName.trim()}
            >
              {isSubmitting
                ? selectedCategory
                  ? "Mengupdate..."
                  : "Membuat..."
                : selectedCategory
                ? "Update Kategori"
                : "Buat Kategori"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteCategory}
        onOpenChange={() => setDeleteCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kategori {deleteCategory?.name}?
              Tindakan ini tidak dapat dibatalkan.
              {(deleteCategory?.postCount || 0) > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  Kategori ini masih digunakan oleh {deleteCategory?.postCount}{" "}
                  postingan dan tidak dapat dihapus.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700"
              disabled={(deleteCategory?.postCount || 0) > 0}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
