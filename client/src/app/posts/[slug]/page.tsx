"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeftIcon,
  CalendarIcon,
  TagIcon,
  ShareIcon,
  BookmarkIcon,
  MapPinIcon,
  BookOpenIcon,
  ImageIcon,
  XIcon,
  StarIcon,
  EyeIcon,
  HeartIcon,
} from "lucide-react";
import { EditModeToggle } from "@/components/edit-mode-toggle";
import { MasjidInfoCard } from "@/components/masjid-info-card";
import { RelatedPosts } from "@/components/related-posts";
import { TopCenterNavigation } from "@/components/reader/top-center-navigation";
import { BottomCenterNavigation } from "@/components/reader/bottom-center-navigation";
import { BottomRightController } from "@/components/reader/bottom-right-controller";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import type {
  Post,
  PostCategory,
  UpdatePostPayload,
} from "@/types/posts.types";
import { ReadingTime } from "@/components/reading-time";
import { PostService } from "@/service/posts.service";
import { ImageService } from "@/service/image.service";
import { fixImageUrlsInHtml } from "@/utils/imageUrlHelper";
import useSWR from "swr";
import { useAuth } from "@/app/providers";
import { useReaderControls } from "@/hooks/use-reader-controls";
import { CommentSection } from "@/components/comment/comment-section";
import { BookmarkService } from "@/service/bookmark.service";
import Image from "next/image";
import TipTapEditor from "@/components/tiptap-editor/index";

interface PostDetailPageProps {
  params: {
    slug: string;
  };
}

const fetcher = async (url: string) => {
  const slug = url.split("/").pop();
  if (!slug) throw new Error("Slug is missing from URL");
  const response = await PostService.getBySlug(slug);
  return response.data;
};

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = React.use(params as unknown as Promise<{ slug: string }>);
  const router = useRouter();
  const { user } = useAuth();
  const { showControls } = useReaderControls();

  const {
    data: post,
    error,
    isLoading,
    mutate,
  } = useSWR<Post, Error>(`/api/posts/${slug}`, fetcher, {
    revalidateOnFocus: false,
    onSuccess: (data) => {
      setEditData({
        title: data.title || "",
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        tags: data.tags,
      });
    },
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editData, setEditData] = useState<UpdatePostPayload>({});
  const [tagInput, setTagInput] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [rating, setRating] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [relatedPosts, setRelatedPosts] = useState([]);

  const canEdit =
    user && ["EDITOR", "ADMIN", "SUPER_ADMIN"].includes(user.role);

  useEffect(() => {
    if (post && !hasChanges) {
      setEditData({
        title: post.title || "",
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        tags: post.tags,
      });
      setBookmarkCount(Math.floor(Math.random() * 1000) + 100);
      setViewCount(Math.floor(Math.random() * 10000) + 1000);
      setRating(4.2 + Math.random() * 0.8);
      setLikeCount(Math.floor(Math.random() * 5000) + 500);
    }
  }, [post, hasChanges]);

  const handleToggleEdit = () => {
    if (isEditMode) {
      if (hasChanges) {
        if (
          confirm(
            "Anda memiliki perubahan yang belum disimpan. Yakin ingin membatalkan?"
          )
        ) {
          setIsEditMode(false);
          setHasChanges(false);
          if (post) {
            setEditData({
              title: post.title || "",
              content: post.content,
              excerpt: post.excerpt,
              coverImage: post.coverImage,
              tags: post.tags,
            });
          }
        }
      } else {
        setIsEditMode(false);
      }
    } else {
      setIsEditMode(true);
    }
  };

  const handleSave = async () => {
    if (!post || !hasChanges) return;
    setSaving(true);
    const loadingToastId = notify.loading("Menyimpan perubahan...");
    try {
      const response = await PostService.updateBySlug(slug, editData);
      await mutate(response.data.data, { revalidate: true });
      setIsEditMode(false);
      setHasChanges(false);
      notify.dismiss(loadingToastId);
      notify.success(response.data.message);
    } catch (err) {
      handleErrorResponse(err, loadingToastId);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = <T extends keyof UpdatePostPayload>(
    field: T,
    value: UpdatePostPayload[T]
  ) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleCoverImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const loadingToastId = notify.loading("Mengupload cover image...");
    try {
      const { data: uploadedImage } = await ImageService.upload(file);

      handleFieldChange("coverImage", uploadedImage.url);

      notify.dismiss(loadingToastId);
      notify.success("Cover image berhasil diupload!");
    } catch (err) {
      handleErrorResponse(err, loadingToastId);
    }
  };

  const handleContentImageUpload = async (file: File): Promise<string> => {
    const loadingToastId = notify.loading("Mengupload gambar konten...");
    try {
      const { data: uploadedImage } = await ImageService.upload(file);

      notify.dismiss(loadingToastId);
      notify.success("Gambar konten berhasil diupload!");

      return uploadedImage.url;
    } catch (err) {
      handleErrorResponse(err, loadingToastId);
      throw err;
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !editData.tags?.includes(tagInput.trim())) {
      handleFieldChange("tags", [...(editData.tags || []), tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleFieldChange(
      "tags",
      editData.tags?.filter((tag: string) => tag !== tagToRemove) || []
    );
  };

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!post?.id) return;

      try {
        const res = await BookmarkService.getAll();
        const bookmarkedPosts: Post[] = res.data.data;

        const isAlreadyBookmarked = bookmarkedPosts.some(
          (bookmarkedPost: Post) => bookmarkedPost.id === post.id
        );

        setIsBookmarked(isAlreadyBookmarked);
      } catch (error) {
        console.error("Gagal cek status bookmark:", error);
      }
    };

    checkBookmarkStatus();
  }, [post?.id]);

  const handleBookmark = async () => {
    if (!user) {
      notify.info("Silakan login terlebih dahulu untuk bookmark post ini.");
      return;
    }

    if (!post) {
      notify.error("Data post tidak tersedia");
      return;
    }

    try {
      if (isBookmarked) {
        await BookmarkService.remove(post.id);
        setBookmarkCount((prev) => prev - 1);
        notify.success("Bookmark dihapus");
      } else {
        await BookmarkService.add(post.id);
        setBookmarkCount((prev) => prev + 1);
        notify.success("Berhasil ditambahkan ke bookmark!");
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Bookmark error:", error);
      notify.error("Terjadi kesalahan saat memperbarui bookmark.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  const getPostTypeColor = (type: string) => {
    return type === "masjid"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  };

  const getPostTypeIcon = (type: string) => {
    return type === "masjid" ? MapPinIcon : BookOpenIcon;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <TopCenterNavigation
          title="Loading..."
          subtitle="Memuat konten"
          onBack={() => router.back()}
          showControls={showControls}
        />

        <div className="pt-20 container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse space-y-8">
            <div className="flex gap-8">
              <div className="w-64 h-80 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-4">
                <div className="h-12 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="flex gap-4">
                  <div className="h-10 bg-gray-200 rounded w-24" />
                  <div className="h-10 bg-gray-200 rounded w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <TopCenterNavigation
          title="Post Tidak Ditemukan"
          subtitle="Error"
          onBack={() => router.back()}
          showControls={showControls}
        />

        <div className="pt-20 container mx-auto px-4 py-8 max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Post Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-8">
            Post yang Anda cari tidak dapat ditemukan.
          </p>
          <Button asChild>
            <Link href="/posts">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Kembali ke Posts
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const TypeIcon = getPostTypeIcon(post.type);

  return (
    <div className="min-h-screen bg-white">
      {/* Reader Controls */}
      <TopCenterNavigation
        title={post?.title || "Loading..."}
        subtitle={post?.type === "masjid" ? "Masjid" : "Artikel"}
        onBack={() => router.back()}
        showControls={showControls}
      />

      <BottomCenterNavigation
        onBack={() => router.back()}
        showControls={showControls}
        relatedPosts={relatedPosts}
      />

      <BottomRightController showControls={showControls} />

      <div className="pt-20 container mx-auto px-4 py-8 max-w-6xl">
        <article className="space-y-8">
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cover Image */}
            <div className="lg:w-80 flex-shrink-0 relative">
              {isEditMode ? (
                <div className="space-y-4">
                  <Label>Cover Image</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("cover-upload")?.click()
                      }
                      className="flex-1"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      {editData.coverImage ? "Ganti Cover" : "Upload Cover"}
                    </Button>
                    {editData.coverImage && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFieldChange("coverImage", "")}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="hidden"
                  />
                  {editData.coverImage && (
                    <Image
                      src={`${editData.coverImage}`}
                      alt="Cover preview"
                      width={300}
                      height={225}
                      className="w-full aspect-[3/4] object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
                </div>
              ) : (
                post.coverImage && (
                  <Image
                    src={`${post.coverImage}`}
                    alt={post.title || "Cover"}
                    width={300}
                    height={225}
                    className="w-full aspect-[3/4] object-cover rounded-lg shadow-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )
              )}
            </div>

            {/* Post Info */}
            <div className="flex-1 space-y-6">
              {/* Post Type & Categories */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getPostTypeColor(post.type)}>
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {post.type === "masjid" ? "Masjid" : "Artikel"}
                </Badge>
                {post.categories.map((cat) => (
                  <Badge key={cat.categoryId} variant="outline">
                    {cat.category.name}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              {isEditMode ? (
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Post</Label>
                  <Input
                    id="title"
                    value={editData?.title || ""}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    className="text-2xl font-bold h-auto py-3"
                    disabled={isLoading || !post}
                  />
                </div>
              ) : (
                <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                  {post?.title || "Memuat judul..."}
                </h1>
              )}

              {/* Author Info */}
              <div className="text-muted-foreground">
                Oleh {post.author.fullname}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={handleBookmark}
                  className={isBookmarked ? "bg-primary/10 border-primary" : ""}
                >
                  <BookmarkIcon
                    className={`w-4 h-4 mr-2 ${
                      isBookmarked ? "fill-current" : ""
                    }`}
                  />
                  Bookmark
                </Button>
                <Button variant="outline">
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share
                </Button>
                {canEdit && (
                  <EditModeToggle
                    isEditMode={isEditMode}
                    onToggleEdit={handleToggleEdit}
                    onSave={handleSave}
                    onCancel={handleToggleEdit}
                    loading={saving}
                    hasChanges={hasChanges}
                  />
                )}
              </div>

              {/* Statistics */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-1 text-yellow-500">
                  <StarIcon className="w-4 h-4 fill-current" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-500">
                  <BookmarkIcon className="w-4 h-4" />
                  <span className="font-medium">
                    {formatNumber(bookmarkCount)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-green-500">
                  <EyeIcon className="w-4 h-4" />
                  <span className="font-medium">{formatNumber(viewCount)}</span>
                </div>
                <div className="flex items-center gap-1 text-red-500">
                  <HeartIcon className="w-4 h-4" />
                  <span className="font-medium">{formatNumber(likeCount)}</span>
                </div>
              </div>

              {/* Excerpt */}
              {isEditMode ? (
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={editData.excerpt || ""}
                    onChange={(e) =>
                      handleFieldChange("excerpt", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              ) : (
                post.excerpt && (
                  <p className="text-muted-foreground leading-relaxed">
                    {post.excerpt}
                  </p>
                )
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={
                        post.author.avatar ||
                        "/placeholder.svg?height=24&width=24&query=user avatar"
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
                  <span>{post.author.fullname}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Dipublikasikan {formatDate(post.publishedAt)}</span>
                </div>
                <ReadingTime content={post.content} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            {isEditMode ? (
              <div className="space-y-2">
                <Label>Konten</Label>
                <TipTapEditor
                  content={fixImageUrlsInHtml(editData.content || "")}
                  onChange={(content) => handleFieldChange("content", content)}
                  placeholder="Tulis konten post..."
                  onImageUpload={handleContentImageUpload}
                />
              </div>
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: fixImageUrlsInHtml(post.content),
                }}
              />
            )}
          </div>

          {/* Tags */}
          {isEditMode ? (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Tambahkan atau edit tags untuk post ini
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Masukkan tag..."
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <Button type="button" onClick={addTag}>
                    Tambah
                  </Button>
                </div>
                {editData.tags && editData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {editData.tags.map((tag: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                      >
                        #{tag}
                        <XIcon
                          className="ml-1 h-3 w-3"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            post.tags &&
            post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <TagIcon className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )
          )}

          {/* Masjid Info (if applicable) */}
          {post.type === "masjid" && <MasjidInfoCard post={post} />}

          <CommentSection postId={post.id} />

          {/* Related Posts */}
          <RelatedPosts currentPost={post} />
        </article>
      </div>
    </div>
  );
}
