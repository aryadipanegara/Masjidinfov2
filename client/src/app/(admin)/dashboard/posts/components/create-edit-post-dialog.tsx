"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { TipTapEditor } from "@/components/tiptap-editor";
import type {
  Post,
  CreatePostPayload,
  PostType,
  PostStatus,
} from "@/types/posts.types";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import { PostService } from "@/service/posts.service";
import { ImageService } from "@/service/image.service";
import Image from "next/image";

interface CreateEditPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: Post | null;
  onSuccess: () => void;
}

const POST_TYPES = [
  { value: "masjid", label: "Masjid" },
  { value: "sejarah", label: "Sejarah" },
  { value: "ziarah", label: "Ziarah" },
  { value: "artikel", label: "Artikel" },
  { value: "berita", label: "Berita" },
];

const POST_STATUS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
];

export function CreateEditPostDialog({
  open,
  onOpenChange,
  post,
  onSuccess,
}: CreateEditPostDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreatePostPayload>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    type: "sejarah",
    status: "DRAFT",
    tags: [],
    coverImage: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");

  const isEditing = !!post;

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        type: post.type || "sejarah",
        status: post.status || "DRAFT",
        tags: post.tags || [],
        coverImage: post.coverImage || "",
      });
      setCoverImagePreview(post.coverImage || "");
    } else {
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        type: "sejarah",
        status: "DRAFT",
        tags: [],
        coverImage: "",
      });
      setCoverImagePreview("");
    }
    setTagInput("");
    setCoverImageFile(null);
  }, [post, open]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.error("File harus berupa gambar");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify.error("Ukuran file maksimal 5MB");
      return;
    }

    setCoverImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadCoverImage = async (): Promise<string> => {
    if (!coverImageFile) return formData.coverImage || "";

    try {
      const response = await ImageService.upload(coverImageFile);
      return response.data.url;
    } catch {
      throw new Error("Failed to upload cover image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      notify.error("Judul dan konten harus diisi");
      return;
    }

    setLoading(true);
    const toastId = notify.loading(
      isEditing ? "Mengupdate postingan..." : "Membuat postingan..."
    );

    try {
      let coverImageUrl = formData.coverImage || "";
      if (coverImageFile) {
        coverImageUrl = await uploadCoverImage();
      }

      const payload: CreatePostPayload = {
        ...formData,
        coverImage: coverImageUrl,
      } as CreatePostPayload;

      if (isEditing && post) {
        await PostService.update(post.id, payload);
        notify.success("Postingan berhasil diupdate!", toastId);
      } else {
        await PostService.create(payload);
        notify.success("Postingan berhasil dibuat!", toastId);
      }

      onSuccess();
    } catch (error) {
      handleErrorResponse(error, toastId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Postingan" : "Buat Postingan Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update informasi postingan"
              : "Buat postingan baru untuk website"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Masukkan judul postingan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="url-friendly-slug"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
              }
              placeholder="Ringkasan singkat postingan"
              rows={3}
            />
          </div>

          {/* Type and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipe Postingan</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value as PostType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POST_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as PostStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POST_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="cursor-pointer"
                />
              </div>
              {coverImagePreview && (
                <div className="w-20 h-20 rounded-lg overflow-hidden border">
                  <Image
                    src={`${coverImagePreview}` || "/placeholder.svg"}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    width={800}
                    height={450}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Tambah tag"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Tambah
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <Label>Konten *</Label>
            <TipTapEditor
              content={formData.content || ""}
              onChange={(content) =>
                setFormData((prev) => ({ ...prev, content }))
              }
              placeholder="Tulis konten postingan di sini..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isEditing
                  ? "Mengupdate..."
                  : "Membuat..."
                : isEditing
                ? "Update Postingan"
                : "Buat Postingan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
