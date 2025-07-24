"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SearchIcon, PlusIcon, CalendarIcon, TagIcon } from "lucide-react";
import handleErrorResponse from "@/utils/handleErrorResponse";
import type {
  Post,
  PostCategory,
  PaginatedResponse,
} from "@/types/posts.types"; // Import PaginatedResponse
import useAuth from "@/hooks/useAuth";
import { PostService } from "@/service/posts.service";
import { CategoryService } from "@/service/category.service";
import useSWR from "swr"; // Import useSWR
import { Category } from "../../../../backend/src/types/category.types";
import { PostBreadcrumb } from "@/components/post-breadcrumb";

// Fetcher function for posts
const postFetcher = async (key: [string, number, string, string, string]) => {
  const [url, page, search, selectedType, selectedCategory] = key;
  const params: any = { page, limit: 12 };
  if (search) params.search = search;
  if (selectedType !== "all") params.type = selectedType;
  if (selectedCategory !== "all") params.categoryId = selectedCategory;

  const response = await PostService.getAll(params);
  return response.data; // This should be { data: Post[], pagination: Pagination }
};

// Fetcher function for categories
const categoryFetcher = async (url: string) => {
  const response = await CategoryService.getAll();
  return response.data.data || [];
};

export default function PostsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [page, setPage] = useState(1);

  const canCreateEdit =
    user && ["EDITOR", "ADMIN", "SUPER_ADMIN"].includes(user.role);

  // Use SWR for fetching posts
  const {
    data: postsData,
    error: postsError,
    isLoading: isLoadingPosts,
  } = useSWR<PaginatedResponse<Post>, Error>(
    [`/api/posts`, page, search, selectedType, selectedCategory],
    postFetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true, // Keep old data while fetching new
      onError: (err) => handleErrorResponse(err),
    }
  );

  // Use SWR for fetching categories
  const {
    data: categories = [],
    error: categoriesError,
    isLoading: isLoadingCategories,
  } = useSWR<Category[], Error>("/api/categories", categoryFetcher, {
    revalidateOnFocus: false,
    onError: (err) => console.error("Failed to fetch categories:", err),
  });

  const posts = postsData?.data || [];
  const totalPages = postsData?.pagination?.totalPages || 0;
  const loading = isLoadingPosts || isLoadingCategories; // Combined loading state

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

  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      {posts.length > 0 && <PostBreadcrumb post={posts[0]} />}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Posts</h1>
          <p className="text-muted-foreground mt-2">
            Jelajahi artikel dan informasi tentang masjid-masjid bersejarah
          </p>
        </div>
        {canCreateEdit && (
          <Button asChild>
            <Link href="/posts/create">
              <PlusIcon className="mr-2 h-4 w-4" />
              Tulis Post Baru
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="masjid">Masjid</SelectItem>
                <SelectItem value="artikel">Artikel</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((category: Category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat posts...</p>
        </div>
      ) : postsError || categoriesError ? (
        <div className="text-center py-12 text-red-500">
          <p>Terjadi kesalahan saat memuat data. Silakan coba lagi.</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <PlusIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Belum ada posts yang ditemukan.</p>
          {canCreateEdit && (
            <Button asChild className="mt-4">
              <Link href="/posts/create">Buat Post Pertama</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {posts.map((post: Post) => (
              <Card
                key={post.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {post.coverImage && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={`${backendBaseUrl}${post.coverImage}`}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getPostTypeColor(post.type)}>
                      {post.type === "masjid" ? "Masjid" : "Artikel"}
                    </Badge>
                    {post.categories.map((cat: PostCategory) => (
                      <Badge key={cat.categoryId} variant="outline">
                        {cat.category.name}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="line-clamp-2">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="hover:text-primary"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>
                  {post.excerpt && (
                    <CardDescription className="line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={
                            post.author.avatar ||
                            "/placeholder.svg?height=24&width=24&query=user avatar"
                          }
                          alt={post.author.fullname}
                        />
                        <AvatarFallback>
                          {post.author.fullname
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span>{post.author.fullname}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-3">
                      <TagIcon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {post.tags
                          .slice(0, 3)
                          .map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="text-xs text-muted-foreground"
                            >
                              #{tag}
                            </span>
                          ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{post.tags.length - 3} lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      isActive={page === 1}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <Button variant="outline" disabled>
                      Page {page} of {totalPages}
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      isActive={page >= totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
