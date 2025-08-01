"use client";

import useSWR from "swr";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { PostService } from "@/service/posts.service";
import type { Post } from "@/types/posts.types";
import Image from "next/image";

export function HeroCarousel() {
  const { data: posts, isLoading } = useSWR("/posts?limit=5", async () => {
    const response = await PostService.getAll({ limit: 5 });
    return response.data.data;
  });

  if (isLoading || !posts) {
    return <div className="h-[420px] bg-muted animate-pulse rounded-xl" />;
  }

  return (
    <div className="w-full container mx-auto px-4 py-8">
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {posts.map((post: Post) => (
            <CarouselItem
              key={post.id}
              className="pl-2 md:pl-4 basis-full md:basis-4/5 lg:basis-3/4"
            >
              <div className="relative flex items-center w-full h-[420px] rounded-xl overflow-hidden bg-black">
                {/* Background Image */}
                <Image
                  src={`${post.coverImage}`}
                  alt={post.title}
                  fill
                  className="absolute inset-0 object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 75vw"
                  priority={false}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-10" />

                {/* Text Content */}
                <div className="relative z-20 flex flex-col justify-center p-6 md:p-8 lg:p-12 w-full md:w-[55%] space-y-3 md:space-y-4 text-white">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight drop-shadow-md">
                    {post.title}
                  </h2>
                  <p className="text-sm md:text-base text-white/80 line-clamp-2 max-w-lg">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {post.tags?.map((tag: string, i: number) => (
                      <Badge
                        key={i}
                        className={`text-white px-3 py-1 rounded-md text-xs font-medium ${
                          tag.toLowerCase() === "new"
                            ? "bg-orange-500"
                            : tag.toLowerCase() === "popular"
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Button */}
                  <Button
                    asChild
                    size="sm"
                    className="bg-white text-black hover:bg-gray-200 mt-2 font-semibold w-fit"
                  >
                    <Link href={`/posts/${post.slug}`}>Baca Sekarang</Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
