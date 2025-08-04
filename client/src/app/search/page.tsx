"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { debounce } from "lodash";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PostService } from "@/service/posts.service";
import type { Post, PostType } from "@/types/posts.types";
import { MainNavbar } from "@/components/main-navbar";
import { MainFooter } from "@/components/main-footer";
import Image from "next/image";
import { Search, Filter, BookOpen, MapPin, User, Loader2 } from "lucide-react";

const typeOptions = [
  {
    id: "masjid",
    label: "Masjid",
    icon: MapPin,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  {
    id: "artikel",
    label: "Artikel",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
];

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [typeTags, setTypeTags] = useState<string[]>([]);

  const toggleType = (type: string) => {
    setTypeTags((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const debouncedSearch = debounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  const { data: response, isLoading } = useSWR(
    searchQuery.length >= 3 ? [`/search?q=${searchQuery}`, typeTags] : null,
    async () => {
      const params: {
        search: string;
        limit: number;
        type?: PostType | undefined;
      } = {
        search: searchQuery,
        limit: 24,
      };
      if (typeTags.length > 0) {
        params.type = typeTags[0] as PostType;
      }
      const response = await PostService.getAll(params);
      return response.data;
    }
  );

  const posts = response?.data || [];

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) setSearchQuery(query);
  }, [searchParams]);

  const getTypeConfig = (type: string) => {
    return typeOptions.find((t) => t.id === type) || typeOptions[1];
  };

  return (
    <>
      <div className="min-h-screen ">
        <MainNavbar />

        {/* Hero Search Section */}
        <div className="bg-white  border-b border-gray-200  ">
          <div className="container mx-auto px-4 py-12 ">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold  ">Temukan Konten Terbaik</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Jelajahi ribuan artikel dan informasi masjid dari seluruh
                Indonesia
              </p>
            </div>

            {/* Main Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Cari artikel, masjid, atau topik yang menarik..."
                  defaultValue={searchQuery}
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200  rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
            {/* Enhanced Sidebar */}
            <aside className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Filter Pencarian</h3>
                </div>

                {/* Type Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Jenis Konten
                  </h4>
                  <div className="space-y-2">
                    {typeOptions.map((type) => {
                      const Icon = type.icon;
                      const isSelected = typeTags.includes(type.id);
                      return (
                        <Button
                          key={type.id}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleType(type.id)}
                          className="w-full justify-start gap-2 rounded-xl"
                        >
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {typeTags.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-medium mb-3 text-sm text-gray-600 dark:text-gray-400">
                    Filter Aktif
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {typeTags.map((type) => {
                      const config = getTypeConfig(type);
                      return (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                          onClick={() => toggleType(type)}
                        >
                          {config.label} ×
                        </Badge>
                      );
                    })}
                  </div>
                </Card>
              )}
            </aside>

            {/* Results Section */}
            <section className="space-y-6">
              {/* Results Header */}
              {searchQuery.length >= 3 && (
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Hasil Pencarian
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isLoading
                        ? "Mencari..."
                        : `${posts?.length || 0} hasil untuk "${searchQuery}"`}
                    </p>
                  </div>
                </div>
              )}

              {/* Results Content */}
              <AnimatePresence mode="wait">
                {searchQuery.length < 3 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                  >
                    <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Mulai Pencarian Anda
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                      Ketik minimal 3 karakter untuk memulai pencarian
                    </p>
                  </motion.div>
                ) : isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Mencari konten terbaik untuk Anda...
                    </p>
                  </motion.div>
                ) : posts && posts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                  >
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Tidak Ada Hasil
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      Coba gunakan kata kunci yang berbeda atau kurangi filter
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setTypeTags([]);
                      }}
                      className="rounded-xl"
                    >
                      Reset Pencarian
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                  >
                    {posts?.map((post: Post, index: number) => {
                      const typeConfig = getTypeConfig(post.type);
                      const TypeIcon = typeConfig.icon;

                      return (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-0  p-0">
                            <div className="relative aspect-[3/4] overflow-hidden">
                              <Image
                                src={`${post.coverImage}`}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                              {/* Type Badge */}
                              <div className="absolute top-2 left-2">
                                <Badge className={typeConfig.color}>
                                  <TypeIcon className="w-3 h-3 mr-1" />
                                  {typeConfig.label}
                                </Badge>
                              </div>

                              {/* Content Overlay */}
                              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                <Link href={`/posts/${post.slug}`}>
                                  <h4 className="font-semibold text-sm line-clamp-2 hover:text-primary-200 transition-colors mb-1">
                                    {post.title}
                                  </h4>
                                </Link>
                                <p className="text-xs opacity-90 flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {post.author?.fullname || "Anonim"}
                                </p>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>
        </div>
      </div>
      <MainFooter />
    </>
  );
}
