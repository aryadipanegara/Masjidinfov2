"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { debounce } from "lodash";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { PostService } from "@/service/posts.service";
import type { Post } from "@/types/posts.types";

const mockAuthors = [
  { id: "author1", name: "Dr. Ahmad Historian" },
  { id: "author2", name: "Prof. Maria Gonzalez" },
];

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [typeTags, setTypeTags] = useState<string[]>([]);
  const [authorFilter, setAuthorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const toggleType = (type: string) => {
    setTypeTags((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const debouncedSearch = debounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  const { data: posts, isLoading } = useSWR(
    searchQuery.length >= 3
      ? [`/search?q=${searchQuery}&sort=${sortBy}`, typeTags, authorFilter]
      : null,
    async () => {
      const params: any = { search: searchQuery, sort: sortBy };
      if (typeTags.length > 0) params.type = typeTags;
      if (authorFilter !== "all") params.author = authorFilter;
      const response = await PostService.getAll(params);
      return response.data.data;
    }
  );

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) setSearchQuery(query);
  }, [searchParams]);

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="space-y-4 bg-muted p-4 rounded-xl">
          <div>
            <h3 className="font-semibold mb-2">Type</h3>
            <div className="flex flex-wrap gap-2">
              {["Mirror", "Project"].map((type) => (
                <Button
                  key={type}
                  variant={typeTags.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleType(type)}
                  className="rounded-full"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Author</h3>
            <Select value={authorFilter} onValueChange={setAuthorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Author</SelectItem>
                {mockAuthors.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </aside>

        {/* Results */}
        <section className="space-y-6">
          {/* Search bar + sort */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Input
              placeholder="Cari judul..."
              defaultValue={searchQuery}
              onChange={(e) => debouncedSearch(e.target.value)}
              className="max-w-md"
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Terbaru</SelectItem>
                <SelectItem value="popular">Populer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results grid */}
          {searchQuery.length < 3 ? (
            <p className="text-muted-foreground">
              Ketik minimal 3 karakter untuk mencari.
            </p>
          ) : isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : posts && posts.length === 0 ? (
            <p className="text-muted-foreground">Tidak ada hasil ditemukan.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {posts?.map((post: Post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl overflow-hidden bg-muted shadow"
                >
                  <div className="aspect-[3/4] relative">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1">
                      <Badge className="bg-red-500 text-white">UP</Badge>
                    </div>
                  </div>
                  <div className="p-2 text-sm">
                    <Link href={`/posts/${post.slug}`}>
                      <h4 className="font-semibold line-clamp-2 hover:text-primary">
                        {post.title}
                      </h4>
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      CH.{post.author?.fullname || "??"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
