"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, MapPinIcon, BookOpenIcon } from "lucide-react";
import handleErrorResponse from "@/utils/handleErrorResponse";
import type { Post } from "@/types/posts.types";
import { PostService } from "@/service/posts.service";
import Image from "next/image";

interface RelatedPostsProps {
  currentPost: Post;
}

export function RelatedPosts({ currentPost }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        const categoryId = currentPost.categories[0]?.categoryId;
        const params: { limit?: number; type?: string; categoryId?: string } = {
          limit: 3,
        };

        if (categoryId) {
          params.categoryId = categoryId;
        } else {
          params.type = currentPost.type;
        }

        const response = await PostService.getAll(params);
        // Filter out current post
        const filtered = response.data.data.filter(
          (post) => post.id !== currentPost.id
        );
        setRelatedPosts(filtered.slice(0, 3));
      } catch (error) {
        handleErrorResponse(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [currentPost]);

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

  if (loading || relatedPosts.length === 0) {
    return null;
  }

  return (
    <Card className="mt-12">
      <CardHeader>
        <CardTitle>Artikel Terkait</CardTitle>
        <CardDescription>
          Post lainnya yang mungkin menarik untuk Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedPosts.map((post) => {
            const TypeIcon = getPostTypeIcon(post.type);
            return (
              <div key={post.id} className="group">
                <Link href={`/posts/${post.slug}`}>
                  {post.coverImage && (
                    <div className="aspect-video overflow-hidden rounded-lg mb-3">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 80vw, (max-width: 1024px) 50vw, 25vw"
                        priority={false}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Badge className={getPostTypeColor(post.type)}>
                      <TypeIcon className="w-3 h-3 mr-1" />
                      {post.type === "masjid" ? "Masjid" : "Artikel"}
                    </Badge>
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar className="h-5 w-5">
                        <AvatarImage
                          src={post.author.avatar || "/placeholder.svg"}
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
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
