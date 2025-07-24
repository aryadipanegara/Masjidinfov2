"use client";

import type React from "react";
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
} from "lucide-react";
import { TipTapEditor } from "@/components/tiptap-editor";
import { EditModeToggle } from "@/components/edit-mode-toggle";
import { MasjidInfoCard } from "@/components/masjid-info-card";
import { RelatedPosts } from "@/components/related-posts";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import type {
  Post,
  PostCategory,
  UpdatePostPayload,
} from "@/types/posts.types";
import { ReadingTime } from "@/components/reading-time";
import { PostBreadcrumb } from "@/components/post-breadcrumb";
import useAuth from "@/hooks/useAuth";
import { PostService } from "@/service/posts.service";
import { ImageService } from "@/service/image.service";
import { fixImageUrlsInHtml } from "@/utils/imageUrlHelper";
import useSWR from "swr";

interface PostDetailPageProps {
  params: {
    slug: string;
  };
}

// Define a fetcher function for SWR
const fetcher = async (url: string) => {
  const slug = url.split("/").pop();
  if (!slug) throw new Error("Slug is missing from URL");
  const response = await PostService.getBySlug(slug);
  return response.data;
};

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = params;
  const router = useRouter();
  const { user } = useAuth();

  // Use SWR to fetch and manage post data
  const {
    data: post,
    error,
    isLoading,
    mutate, // mutate function to revalidate data
  } = useSWR<Post, Error>(`/api/posts/${slug}`, fetcher, {
    revalidateOnFocus: false,
    // When post data updates, update editData
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

  const canEdit =
    user && ["EDITOR", "ADMIN", "SUPER_ADMIN"].includes(user.role);

  // Initialize editData when post data is loaded or changes, or reset on cancel
  useEffect(() => {
    if (post && !hasChanges) {
      // Only update if no unsaved changes, or on initial load
      setEditData({
        title: post.title || "",
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        tags: post.tags,
      });
    }
  }, [post, hasChanges]);

  const handleToggleEdit = () => {
    if (isEditMode) {
      // Cancel edit
      if (hasChanges) {
        if (
          confirm(
            "Anda memiliki perubahan yang belum disimpan. Yakin ingin membatalkan?"
          )
        ) {
          setIsEditMode(false);
          setHasChanges(false);
          // Reset edit data to current post data from SWR
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
      // Update the SWR cache with the new data from the response and revalidate
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

  const handleFieldChange = (field: keyof UpdatePostPayload, value: any) => {
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
      const response = await ImageService.upload(file);
      const uploadedImageData = response.data.data;
      // Update editData with the new cover image URL immediately for preview
      handleFieldChange("coverImage", uploadedImageData.url);
      notify.dismiss(loadingToastId);
      notify.success("Cover image berhasil diupload!");
    } catch (err) {
      handleErrorResponse(err, loadingToastId);
    }
  };

  // This function matches the new TipTapEditorProps onImageUpload signature
  const handleContentImageUpload = async (file: File): Promise<string> => {
    const loadingToastId = notify.loading("Mengupload gambar konten...");
    try {
      const response = await ImageService.upload(file);
      const uploadedImageUrl = response.data.data.url; // Assuming this is the relative path
      notify.dismiss(loadingToastId);
      notify.success("Gambar konten berhasil diupload!");
      return uploadedImageUrl; // Return the URL for TipTap to insert
    } catch (err) {
      handleErrorResponse(err, loadingToastId);
      throw err; // Re-throw to indicate upload failure to TipTap
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  // Handle loading state from SWR
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-32" />
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  // Handle error state from SWR or if post data is null
  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
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
    );
  }

  const TypeIcon = getPostTypeIcon(post.type);
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" asChild>
          <Link href="/posts">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Kembali ke Posts
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <ShareIcon className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <BookmarkIcon className="w-4 h-4 mr-2" />
            Bookmark
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
      </div>

      {/* Breadcrumb */}
      {post && <PostBreadcrumb post={post} />}

      <article className="space-y-8">
        {/* Header */}
        <header className="space-y-6">
          {/* Post Type & Categories */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={getPostTypeColor(post.type)}>
              <TypeIcon className="w-3 h-3 mr-1" />
              {post.type === "masjid" ? "Masjid" : "Artikel"}
            </Badge>
            {post.categories.map((cat: PostCategory) => (
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
              {post?.title || "Memuat judul..."}{" "}
            </h1>
          )}

          {/* Excerpt */}
          {isEditMode ? (
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={editData.excerpt || ""}
                onChange={(e) => handleFieldChange("excerpt", e.target.value)}
                rows={3}
              />
            </div>
          ) : (
            post.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            )
          )}

          {/* Cover Image */}
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
                <img
                  // Use editData.coverImage for immediate preview in edit mode
                  src={`${backendBaseUrl}${editData.coverImage}`}
                  alt="Cover preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
            </div>
          ) : (
            post.coverImage && (
              <img
                // Use post.coverImage for display in view mode
                src={`${backendBaseUrl}${post.coverImage}`}
                alt={post.title || "Cover"}
                className="w-full h-64 lg:h-96 object-cover rounded-lg"
              />
            )
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    post.author.avatar ||
                    "/placeholder.svg?height=32&width=32&query=user avatar"
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
              <span>Oleh {post.author.fullname}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>Dipublikasikan {formatDate(post.publishedAt)}</span>
            </div>
            <ReadingTime content={post.content} />
            {post.updatedAt !== post.publishedAt && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>Diperbarui {formatDate(post.updatedAt)}</span>
              </div>
            )}
          </div>
        </header>

        <Separator />

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {isEditMode ? (
            <div className="space-y-2">
              <Label>Konten</Label>
              <TipTapEditor
                content={fixImageUrlsInHtml(editData.content || "")}
                onChange={(content) => handleFieldChange("content", content)}
                placeholder="Tulis konten post..."
                onImageUpload={handleContentImageUpload} // This now matches the new TipTapEditorProps
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

        {/* Related Posts */}
        <RelatedPosts currentPost={post} />
      </article>
    </div>
  );
}
