"use client";

import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import { PostService } from "@/service/posts.service";
import type { Post } from "@/types/posts.types";

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "";

export function HeroCarousel() {
  const { data: posts, isLoading } = useSWR("/posts?limit=5", async () => {
    const response = await PostService.getAll({ limit: 5 });
    return response.data.data;
  });

  if (isLoading || !posts) {
    return <div className="h-[400px] bg-muted animate-pulse rounded-xl" />;
  }

  return (
    <Carousel className="w-full container mx-auto px-8">
      <CarouselContent>
        {posts.map((post: Post, index) => (
          <CarouselItem key={post.id} className="basis-full">
            <motion.div
              className="relative w-full h-[400px] rounded-xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <img
                src={`${backendBaseUrl}${post.coverImage}`}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent z-10" />
              <div className="absolute z-20 left-6 bottom-6 text-white max-w-[60%] space-y-3">
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                  {post.title}
                </h2>
                <p className="text-sm md:text-base text-white/80 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag: string, i: number) => (
                    <Badge key={i} className="bg-orange-500 text-white">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-white text-black hover:bg-gray-200 mt-2"
                >
                  <Link href={`/posts/${post.slug}`}>Baca Sekarang</Link>
                </Button>
              </div>
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
