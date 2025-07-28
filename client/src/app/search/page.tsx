"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  SearchIcon,
  MapPinIcon,
  BookOpenIcon,
  FilterIcon,
  XIcon,
  UserIcon,
} from "lucide-react";
import { MainNavbar } from "@/components/main-navbar";
import { MainFooter } from "@/components/main-footer";
import useSWR from "swr";
import { debounce } from "lodash";
import type { Post } from "@/types/posts.types";
import { PostService } from "@/service/posts.service";

// Mock authors data
const mockAuthors = [
  { id: "author1", name: "Dr. Ahmad Historian" },
  { id: "author2", name: "Prof. Maria Gonzalez" },
  { id: "author3", name: "Dr. Fatima Al-Zahra" },
  { id: "author4", name: "Arch. Hassan Al-Maktoum" },
  { id: "author5", name: "Dr. Rajesh Kumar" },
  { id: "author6", name: "Arch. Youssef Bennani" },
  { id: "author7", name: "Prof. Amina Hassan" },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [typeFilter, setTypeFilter] = useState(
    searchParams.get("type") || "all"
  );
  const [authorFilter, setAuthorFilter] = useState(
    searchParams.get("author") || "all"
  );
  const [showFilters, setShowFilters] = useState(false);

  const { data: searchResults, isLoading } = useSWR(
    searchQuery.length >= 3
      ? `/search?q=${searchQuery}&type=${typeFilter}&author=${authorFilter}`
      : null,
    async () => {
      const params: any = { search: searchQuery, limit: 20 };
      if (typeFilter !== "all") params.type = typeFilter;
      if (authorFilter !== "all") params.author = authorFilter;

      const response = await PostService.getAll(params);
      return response.data.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300,
    }
  );

  const debouncedSearch = debounce((value: string) => {
    setSearchQuery(value);
    updateURL(value, typeFilter, authorFilter);
  }, 300);

  const updateURL = (query: string, type: string, author: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (type !== "all") params.set("type", type);
    if (author !== "all") params.set("author", author);

    const newURL = params.toString()
      ? `/search?${params.toString()}`
      : "/search";
    router.replace(newURL, { scroll: false });
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    updateURL(searchQuery, value, authorFilter);
  };

  const handleAuthorChange = (value: string) => {
    setAuthorFilter(value);
    updateURL(searchQuery, typeFilter, value);
  };

  const clearFilters = () => {
    setTypeFilter("all");
    setAuthorFilter("all");
    updateURL(searchQuery, "all", "all");
  };

  const hasActiveFilters = typeFilter !== "all" || authorFilter !== "all";

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

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

  return (
    <div className="min-h-screen">
      <MainNavbar />
      <main className="py-8 pb-20 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Search</h1>

            {/* Search Input */}
            <div className="relative max-w-2xl mb-4">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Minimal 3 karakter untuk mencari posts..."
                defaultValue={searchQuery}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <FilterIcon className="h-4 w-4" />
                Filter
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {(typeFilter !== "all" ? 1 : 0) +
                      (authorFilter !== "all" ? 1 : 0)}
                  </Badge>
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <XIcon className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-muted/50 rounded-lg p-4 mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select value={typeFilter} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Tipe</SelectItem>
                        <SelectItem value="masjid">
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4" />
                            Masjid
                          </div>
                        </SelectItem>
                        <SelectItem value="artikel">
                          <div className="flex items-center gap-2">
                            <BookOpenIcon className="h-4 w-4" />
                            Artikel
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Author</label>
                    <Select
                      value={authorFilter}
                      onValueChange={handleAuthorChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih author" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Author</SelectItem>
                        {mockAuthors.map((author) => (
                          <SelectItem key={author.id} value={author.id}>
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4" />
                              {author.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        Active filters:
                      </span>
                      {typeFilter !== "all" && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {typeFilter === "masjid" ? (
                            <MapPinIcon className="h-3 w-3" />
                          ) : (
                            <BookOpenIcon className="h-3 w-3" />
                          )}
                          {typeFilter === "masjid" ? "Masjid" : "Artikel"}
                          <button
                            onClick={() => handleTypeChange("all")}
                            className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                          >
                            <XIcon className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {authorFilter !== "all" && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <UserIcon className="h-3 w-3" />
                          {mockAuthors.find((a) => a.id === authorFilter)?.name}
                          <button
                            onClick={() => handleAuthorChange("all")}
                            className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                          >
                            <XIcon className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Search States */}
          {searchQuery.length < 3 && (
            <div className="text-center py-16">
              <SearchIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Mulai Pencarian</h2>
              <p className="text-muted-foreground">
                Masukkan minimal 3 karakter untuk mencari posts
              </p>
            </div>
          )}

          {searchQuery.length >= 3 && isLoading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Mencari posts...</p>
            </div>
          )}

          {searchQuery.length >= 3 &&
            searchResults &&
            searchResults.length === 0 && (
              <div className="text-center py-16">
                <SearchIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Tidak ada hasil</h2>
                <p className="text-muted-foreground">
                  Coba gunakan kata kunci yang berbeda atau ubah filter
                  pencarian
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-4 bg-transparent"
                  >
                    Hapus semua filter
                  </Button>
                )}
              </div>
            )}

          {/* Search Results */}
          {searchQuery.length >= 3 &&
            searchResults &&
            searchResults.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Hasil pencarian untuk "{searchQuery}" (
                    {searchResults.length} hasil)
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((post: Post, index: number) => {
                    const TypeIcon = getPostTypeIcon(post.type);
                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                      >
                        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full">
                          {post.coverImage && (
                            <div className="aspect-video overflow-hidden">
                              <img
                                src={post.coverImage || "/placeholder.svg"}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getPostTypeColor(post.type)}>
                                <TypeIcon className="w-3 h-3 mr-1" />
                                {post.type === "masjid" ? "Masjid" : "Artikel"}
                              </Badge>
                              {post.categories.slice(0, 1).map((cat) => (
                                <Badge
                                  key={cat.categoryId}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {cat.category.name}
                                </Badge>
                              ))}
                            </div>
                            <CardTitle className="line-clamp-2 text-base group-hover:text-primary transition-colors">
                              <Link href={`/posts/${post.slug}`}>
                                {post.title}
                              </Link>
                            </CardTitle>
                            {post.excerpt && (
                              <CardDescription className="line-clamp-2 text-sm">
                                {post.excerpt}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage
                                    src={
                                      post.author.avatar || "/placeholder.svg"
                                    }
                                    alt={post.author.fullname}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {post.author.fullname
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">
                                  {post.author.fullname}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                <span>{formatDate(post.publishedAt)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
