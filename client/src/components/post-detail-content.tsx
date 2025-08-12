"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import { EditModeToggle } from "@/components/edit-mode-toggle";
import { TopCenterNavigation } from "@/components/reader/top-center-navigation";
import { BottomCenterNavigation } from "@/components/reader/bottom-center-navigation";
import { BottomRightController } from "@/components/reader/bottom-right-controller";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import type {
  Post,
  UpdatePostPayload,
  PostCategory,
  PostType,
  PostStatus,
} from "@/types/posts.types";
import { ReadingTime } from "@/components/reading-time";
import { PostService } from "@/service/posts.service";
import { ImageService } from "@/service/image.service";
import { CategoryService } from "@/service/category.service";
import { fixImageUrlsInHtml } from "@/utils/imageUrlHelper";
import useSWR from "swr";
import { useAuth } from "@/app/providers";
import { useReaderControls } from "@/hooks/use-reader-controls";
import { CommentSection } from "@/components/comment/comment-section";
import { BookmarkService } from "@/service/bookmark.service";
import Image from "next/image";
import TipTapEditor from "@/components/tiptap-editor/index";
import { ShareModal } from "@/components/share-modal";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

interface PostDetailContentProps {
  initialPost: Post;
}

const postFetcher = async (url: string) => {
  const slug = url.split("/").pop();
  if (!slug) throw new Error("Slug is missing from URL");
  const response = await PostService.getBySlug(slug);
  return response.data.data;
};

const categoryFetcher = async () => {
  const response = await CategoryService.getAll();
  return response.data.data || [];
};

const MAX_EXCERPT_LENGTH = 180;

export function PostDetailContent({ initialPost }: PostDetailContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showControls, setShowControls, isScrolledToBottom } =
    useReaderControls();

  const {
    data: post,
    error,
    isLoading,
    mutate,
  } = useSWR<Post, Error>(`/api/posts/${initialPost.slug}`, postFetcher, {
    revalidateOnFocus: false,
    fallbackData: initialPost,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useSWR<
    PostCategory[]
  >("/api/categories", categoryFetcher, {
    revalidateOnFocus: false,
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
  const [isExcerptExpanded, setIsExcerptExpanded] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCancelEditConfirm, setShowCancelEditConfirm] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const commentSectionRef = useRef<HTMLDivElement>(null);
  const [isBottomNavAbsolute, setIsBottomNavAbsolute] = useState(false);

  const canEdit =
    user && ["EDITOR", "ADMIN", "SUPER_ADMIN"].includes(user.role);

  useEffect(() => {
    if (post && !hasChanges) {
      setEditData({
        title: post.title || "",
        slug: post.slug || "",
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        tags: post.tags,
        type: post.type,
        status: post.status,
        categoryIds: post.categories.map((cat) => cat.categoryId),
      });
      setSelectedCategories(post.categories.map((cat) => cat.categoryId));
      setBookmarkCount(post.bookmarkCount ?? 0);
      setViewCount(post.viewCount ?? 0);
      setRating(4.2 + Math.random() * 0.8);
    }
  }, [post, hasChanges]);

  useEffect(() => {
    const handleScrollPosition = () => {
      if (commentSectionRef.current) {
        const commentSectionTop =
          commentSectionRef.current.getBoundingClientRect().top;
        const viewportHeight = window.innerHeight;
        const navHeight = 100;

        if (commentSectionTop < viewportHeight - navHeight - 20) {
          setIsBottomNavAbsolute(true);
        } else {
          setIsBottomNavAbsolute(false);
        }
      }
    };

    window.addEventListener("scroll", handleScrollPosition);
    handleScrollPosition();

    return () => {
      window.removeEventListener("scroll", handleScrollPosition);
    };
  }, []);

  const confirmCancelEdit = () => {
    setIsEditMode(false);
    setHasChanges(false);
    if (post) {
      setEditData({
        title: post.title || "",
        slug: post.slug || "",
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        tags: post.tags,
        type: post.type,
        status: post.status,
        categoryIds: post.categories.map((cat) => cat.categoryId),
      });
      setSelectedCategories(post.categories.map((cat) => cat.categoryId));
    }
    setShowCancelEditConfirm(false);
    setShowControls(true);
  };

  const handleToggleEdit = () => {
    if (isEditMode) {
      if (hasChanges) {
        setShowCancelEditConfirm(true);
      } else {
        setIsEditMode(false);
        setShowControls(true);
      }
    } else {
      setIsEditMode(true);
      setShowControls(false);
    }
  };

  const handleSave = async () => {
    if (!post || !hasChanges) return;
    setSaving(true);
    const loadingToastId = notify.loading("Menyimpan perubahan...");
    try {
      const response = await PostService.updateBySlug(post.slug, editData);
      await mutate(response.data.data, { revalidate: true });
      setIsEditMode(false);
      setHasChanges(false);
      notify.dismiss(loadingToastId);
      notify.success(response.data.message);
      setShowControls(true);
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

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newSelection = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];
      handleFieldChange("categoryIds", newSelection);
      return newSelection;
    });
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

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  if (isLoading && !post) {
    return (
      <div className="min-h-screen bg-white">
        <TopCenterNavigation
          title="Loading..."
          subtitle="Memuat konten"
          onBack={() => router.back()}
          showControls={showControls && !isEditMode}
          isEditMode={isEditMode}
        />
        <div className="pt-20 container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse space-y-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-64 sm:w-80 h-80 sm:h-96 bg-gray-200 rounded-lg" />
              <div className="space-y-4 w-full max-w-md">
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
                <div className="flex justify-center gap-4">
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
          showControls={showControls && !isEditMode}
          isEditMode={isEditMode}
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

  const displayExcerpt =
    post.excerpt &&
    post.excerpt.length > MAX_EXCERPT_LENGTH &&
    !isExcerptExpanded
      ? `${post.excerpt.substring(0, MAX_EXCERPT_LENGTH)}...`
      : post.excerpt;

  return (
    <div className="min-h-screen bg-white">
      {/* Reader Controls */}
      <TopCenterNavigation
        title={post?.title || "Loading..."}
        subtitle={
          post?.type === "masjid"
            ? "Masjid"
            : post?.type === "sejarah"
            ? "Sejarah"
            : post?.type === "kisah"
            ? "Kisah"
            : post?.type === "ziarah"
            ? "Ziarah"
            : post?.type === "refleksi"
            ? "Refleksi"
            : post?.type === "tradisi"
            ? "Tradisi"
            : "Loading..."
        }
        onBack={() => router.back()}
        showControls={showControls && !isEditMode}
        isEditMode={isEditMode}
      />
      <BottomRightController
        showControls={showControls && !isEditMode}
        isEditMode={isEditMode}
        isScrolledToBottom={isScrolledToBottom}
      />

      <div className="pt-20 container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        <article className="space-y-6 sm:space-y-8">
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Cover Image Section */}
            <div className="lg:w-80 flex-shrink-0 relative flex flex-col items-center lg:items-start">
              <label
                htmlFor="cover-upload-edit"
                className={`relative w-full max-w-xs sm:max-w-sm lg:max-w-full aspect-[3/4] rounded-xl shadow-2xl overflow-hidden cursor-pointer group ${
                  isEditMode ? "border-2 border-dashed border-blue-500" : ""
                }`}
              >
                {editData.coverImage ? (
                  <Image
                    src={`${editData.coverImage}`}
                    alt={editData.title || "Cover"}
                    width={320}
                    height={427}
                    className="w-full h-full object-cover"
                    sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, 320px"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                {isEditMode && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-white text-center">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-sm font-medium">Ganti Cover</span>
                    </div>
                  </div>
                )}
                <input
                  id="cover-upload-edit"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                  disabled={!isEditMode}
                />
              </label>
              {isEditMode && editData.coverImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFieldChange("coverImage", "")}
                  className="mt-2"
                >
                  <XIcon className="h-4 w-4 mr-1" /> Hapus Cover
                </Button>
              )}
            </div>

            {/* Post Info Section */}
            <div className="flex-1 space-y-6 text-center lg:text-left">
              {/* Post Type & Categories (Display Only) */}
              {!isEditMode && (
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <Badge className={getPostTypeColor(post.type)}>
                    <TypeIcon className="w-3 h-3 mr-1" />
                    {post.type === "masjid"
                      ? "Masjid"
                      : post.type === "sejarah"
                      ? "Sejarah"
                      : post.type === "kisah"
                      ? "Kisah"
                      : post.type === "ziarah"
                      ? "Ziarah"
                      : post.type === "refleksi"
                      ? "Refleksi"
                      : "Tradisi"}
                  </Badge>
                  {post.categories.map((cat) => (
                    <Badge key={cat.categoryId} variant="outline">
                      {cat.category.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Title (Editable in Edit Mode) */}
              {isEditMode ? (
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="sr-only">
                    Judul Post
                  </Label>
                  <Input
                    id="edit-title"
                    value={editData?.title || ""}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold h-auto py-3 text-center lg:text-left"
                    disabled={isLoading || !post}
                  />
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-gray-900">
                  {post?.title || "Memuat judul..."}
                </h1>
              )}

              {/* Slug (Editable in Edit Mode) */}
              {isEditMode && (
                <div className="space-y-2">
                  <Label htmlFor="edit-slug" className="sr-only">
                    Slug (URL)
                  </Label>
                  <Input
                    id="edit-slug"
                    value={editData?.slug || ""}
                    onChange={(e) => handleFieldChange("slug", e.target.value)}
                    placeholder="url-friendly-slug"
                    className="text-center lg:text-left"
                  />
                </div>
              )}

              {/* Author Info */}
              <p className="text-sm text-gray-600">
                Oleh {post.author.fullname}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <Button
                  variant="outline"
                  onClick={handleBookmark}
                  className={`flex-1 sm:flex-none ${
                    isBookmarked
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-white border-gray-200 text-gray-700"
                  }`}
                >
                  <BookmarkIcon
                    className={`w-4 h-4 mr-2 ${
                      isBookmarked ? "fill-current" : ""
                    }`}
                  />
                  Bookmark
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 sm:flex-none"
                >
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Bagikan
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

              {/* Post Type & Status (Editable in Edit Mode - NEW POSITION) */}
              {isEditMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-sm mx-auto lg:mx-0">
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Tipe Post</Label>
                    <Select
                      value={editData.type as PostType}
                      onValueChange={(value: PostType) =>
                        handleFieldChange("type", value)
                      }
                    >
                      <SelectTrigger id="edit-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masjid">Masjid</SelectItem>
                        <SelectItem value="sejarah">Sejarah</SelectItem>
                        <SelectItem value="kisah">Kisah</SelectItem>
                        <SelectItem value="ziarah">Ziarah</SelectItem>
                        <SelectItem value="refleksi">Refleksi</SelectItem>
                        <SelectItem value="tradisi">Tradisi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status Post</Label>
                    <Select
                      value={editData.status as PostStatus}
                      onValueChange={(value: PostStatus) =>
                        handleFieldChange("status", value)
                      }
                    >
                      <SelectTrigger id="edit-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm">
                <div className="flex items-center gap-1 text-orange-500">
                  <StarIcon className="w-4 h-4 fill-current" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-green-500">
                  <BookmarkIcon className="w-4 h-4" />
                  <span className="font-medium">
                    {formatNumber(bookmarkCount)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <EyeIcon className="w-4 h-4" />
                  <span className="font-medium">{formatNumber(viewCount)}</span>
                </div>
              </div>

              {/* Excerpt (Editable in Edit Mode) */}
              {isEditMode ? (
                <div className="space-y-2">
                  <Label htmlFor="edit-excerpt" className="sr-only">
                    Excerpt (Ringkasan)
                  </Label>
                  <Textarea
                    id="edit-excerpt"
                    value={editData.excerpt || ""}
                    onChange={(e) =>
                      handleFieldChange("excerpt", e.target.value)
                    }
                    placeholder="Tulis ringkasan singkat tentang post ini..."
                    rows={3}
                    className="text-center lg:text-left"
                  />
                </div>
              ) : (
                post.excerpt && (
                  <div className="text-gray-600 leading-relaxed text-sm max-w-sm mx-auto lg:mx-0">
                    <p>{displayExcerpt}</p>
                    {post.excerpt.length > MAX_EXCERPT_LENGTH && (
                      <Button
                        variant="link"
                        onClick={() => setIsExcerptExpanded(!isExcerptExpanded)}
                        className="p-0 h-auto text-blue-600 hover:text-blue-700"
                      >
                        {isExcerptExpanded
                          ? "Baca Lebih Sedikit"
                          : "Baca Selengkapnya"}
                      </Button>
                    )}
                  </div>
                )
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
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
          <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
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

          {/* Categories (Editable in Edit Mode) */}
          {isEditMode && (
            <Card>
              <CardHeader>
                <CardTitle>Kategori</CardTitle>
                <CardDescription>
                  Pilih kategori yang sesuai dengan post ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCategories ? (
                  <div className="text-muted-foreground">
                    Memuat kategori...
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category: PostCategory) => (
                      <Badge
                        key={category.id}
                        variant={
                          selectedCategories.includes(category.id)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => handleCategoryToggle(category.id)}
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
              <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                <TagIcon className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )
          )}

          <div className="relative w-full flex justify-center">
            <BottomCenterNavigation
              onBack={() => router.back()}
              showControls={showControls && !isEditMode}
              isEditMode={isEditMode}
              isBottomNavAbsolute={isBottomNavAbsolute}
            />
          </div>

          {/* Comment Section dengan ref */}
          <div ref={commentSectionRef}>
            <CommentSection postId={post.id} />
          </div>
        </article>
      </div>

      {/* Share Modal */}
      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        title={post?.title || "Post"}
        url={currentUrl}
      />

      {/* Cancel Edit Confirmation Dialog */}
      <ConfirmationDialog
        open={showCancelEditConfirm}
        onOpenChange={setShowCancelEditConfirm}
        title="Batalkan Perubahan?"
        description="Anda memiliki perubahan yang belum disimpan. Yakin ingin membatalkan dan kembali ke mode tampilan?"
        onConfirm={confirmCancelEdit}
        confirmText="Ya, Batalkan"
        cancelText="Tidak, Lanjutkan Edit"
        variant="destructive"
      />
    </div>
  );
}
