"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, SaveIcon, ImageIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { PostService } from "@/service/posts.service";
import { ImageService } from "@/service/image.service";
import { CategoryService } from "@/service/category.service";
import { MasjidService } from "@/service/masjid.service";
import useSWR from "swr";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import useAuth from "@/hooks/useAuth";
import { CreatePostPayload, PostCategory, PostType } from "@/types/posts.types";
import TipTapEditor from "@/components/tiptap-editor/index";
import Image from "next/image";
import { CreateMasjidPayload } from "@/types/masjid.types";

const categoryFetcher = async () => {
  const response = await CategoryService.getAll();
  return response.data.data || [];
};

export default function CreatePostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { data: categories = [], isLoading: isLoadingCategories } = useSWR<
    PostCategory[]
  >("/api/categories", categoryFetcher, {
    revalidateOnFocus: false,
  });

  const [postData, setPostData] = useState<CreatePostPayload>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    tags: [],
    type: "sejarah",
    coverImage: "",
    categoryIds: [],
    imageIds: [],
    status: "DRAFT",
  });

  const [masjidData, setMasjidData] = useState<CreateMasjidPayload>({
    namaLokal: "",
    alamat: "",
    kota: "",
    provinsi: "",
    negara: "",
    tahunDibangun: "",
    arsitek: "",
    gaya: "",
    mapsUrl: "",
    sumberFoto: "",
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Check permission
  useEffect(() => {
    if (user && !["EDITOR", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      notify.error("Anda tidak memiliki izin untuk membuat post");
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (postData.title) {
      const slug = postData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setPostData((prev) => ({ ...prev, slug }));
    }
  }, [postData.title]);

  const handleContentImageUpload = async (file: File): Promise<string> => {
    const loadingToastId = notify.loading("Mengupload gambar konten...");
    try {
      const { data: uploadedImage } = await ImageService.upload(file);

      setPostData((prev) => ({
        ...prev,
        imageIds: [...(prev.imageIds ?? []), uploadedImage.id],
      }));

      notify.dismiss(loadingToastId);
      notify.success("Gambar konten berhasil diupload!");

      return uploadedImage.url;
    } catch (error) {
      handleErrorResponse(error, loadingToastId);
      throw error;
    }
  };

  const handleCoverImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const loadingToastId = notify.loading("Mengupload cover image...");
    try {
      const uploadResult = await ImageService.upload(file);
      const imageData = uploadResult.data;
      setPostData((prev) => ({
        ...prev,
        coverImage: imageData.url,
      }));

      notify.dismiss(loadingToastId);
      notify.success("Cover image berhasil diupload!");
    } catch (error) {
      handleErrorResponse(error, loadingToastId);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !postData.tags?.includes(tagInput.trim())) {
      setPostData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPostData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag: string) => tag !== tagToRemove) || [],
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newSelection = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];
      setPostData((prevPost) => ({
        ...prevPost,
        categoryIds: newSelection,
      }));
      return newSelection;
    });
  };

  const handleSubmit = async () => {
    if (!postData.title.trim() || !postData.content.trim()) {
      notify.error("Judul dan konten wajib diisi");
      return;
    }

    setLoading(true);
    const loadingToastId = notify.loading("Menyimpan post...");

    try {
      const postResponse = await PostService.create({
        ...postData,
        status: "DRAFT",
      } as CreatePostPayload);
      const createdPost = postResponse.data;

      if (postData.type === "masjid") {
        try {
          await MasjidService.create(createdPost.id, masjidData);
        } catch (masjidError) {
          console.error("Failed to create masjid info:", masjidError);
        }
      }

      notify.dismiss(loadingToastId);
      notify.success("Post berhasil dibuat!");
      router.push(`/posts/${createdPost.slug}`);
    } catch (error) {
      handleErrorResponse(error, loadingToastId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" asChild>
          <Link href="/posts">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Kembali ke Posts
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Tulis Post Baru</h1>
          <p className="text-muted-foreground">
            Buat artikel atau dokumentasi masjid dengan editor yang powerful dan
            gratis
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
            <CardDescription>
              Atur judul, tipe, dan kategori post Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Post</Label>
              <Input
                id="title"
                value={postData.title}
                onChange={(e) =>
                  setPostData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Masukkan judul post..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={postData.slug}
                onChange={(e) =>
                  setPostData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="url-friendly-slug"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipe Post</Label>
                <Select
                  value={postData.type}
                  onValueChange={(value: PostType) =>
                    setPostData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
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
                    {postData.coverImage ? "Ganti Cover" : "Upload Cover"}
                  </Button>
                  {postData.coverImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setPostData((prev) => ({ ...prev, coverImage: "" }))
                      }
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
                {postData.coverImage && (
                  <Image
                    src={`${postData.coverImage}`}
                    alt="Cover preview"
                    width={600}
                    height={128}
                    className="object-cover rounded-md"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt (Ringkasan)</Label>
              <Textarea
                id="excerpt"
                value={postData.excerpt}
                onChange={(e) =>
                  setPostData((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                placeholder="Tulis ringkasan singkat tentang post ini..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Kategori</CardTitle>
            <CardDescription>
              Pilih kategori yang sesuai dengan post Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCategories ? (
              <div className="text-muted-foreground">Memuat kategori...</div>
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

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>
              Tambahkan tag untuk memudahkan pencarian
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
            {postData.tags && postData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {postData.tags.map((tag: string, index: number) => (
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

        {/* Content Editor - The Star of the Show! */}
        <Card>
          <CardHeader>
            <CardTitle>Konten</CardTitle>
            <CardDescription>
              Tulis konten post Anda dengan editor yang powerful dan gratis -
              tanpa fitur berbayar!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TipTapEditor
              content={postData.content}
              onChange={(content) =>
                setPostData((prev) => ({ ...prev, content }))
              }
              onImageUpload={handleContentImageUpload}
              placeholder="Mulai menulis konten yang menginspirasi tentang sejarah Islam, masjid bersejarah, atau kisah-kisah menarik..."
            />
          </CardContent>
        </Card>

        {/* Masjid Info (conditional) */}
        {postData.type === "masjid" && (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Masjid</CardTitle>
              <CardDescription>
                Lengkapi informasi detail tentang masjid
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="namaLokal">Nama Lokal</Label>
                  <Input
                    id="namaLokal"
                    value={masjidData.namaLokal}
                    onChange={(e) =>
                      setMasjidData((prev) => ({
                        ...prev,
                        namaLokal: e.target.value,
                      }))
                    }
                    placeholder="Nama masjid dalam bahasa lokal"
                  />
                </div>
                <div>
                  <Label htmlFor="tahunDibangun">Tahun Dibangun</Label>
                  <Input
                    id="tahunDibangun"
                    value={masjidData.tahunDibangun}
                    onChange={(e) =>
                      setMasjidData((prev) => ({
                        ...prev,
                        tahunDibangun: e.target.value,
                      }))
                    }
                    placeholder="Tahun pembangunan"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea
                  id="alamat"
                  value={masjidData.alamat}
                  onChange={(e) =>
                    setMasjidData((prev) => ({
                      ...prev,
                      alamat: e.target.value,
                    }))
                  }
                  placeholder="Alamat lengkap masjid"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="kota">Kota</Label>
                  <Input
                    id="kota"
                    value={masjidData.kota}
                    onChange={(e) =>
                      setMasjidData((prev) => ({
                        ...prev,
                        kota: e.target.value,
                      }))
                    }
                    placeholder="Kota"
                  />
                </div>
                <div>
                  <Label htmlFor="provinsi">Provinsi</Label>
                  <Input
                    id="provinsi"
                    value={masjidData.provinsi}
                    onChange={(e) =>
                      setMasjidData((prev) => ({
                        ...prev,
                        provinsi: e.target.value,
                      }))
                    }
                    placeholder="Provinsi"
                  />
                </div>
                <div>
                  <Label htmlFor="negara">Negara</Label>
                  <Input
                    id="negara"
                    value={masjidData.negara}
                    onChange={(e) =>
                      setMasjidData((prev) => ({
                        ...prev,
                        negara: e.target.value,
                      }))
                    }
                    placeholder="Negara"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="arsitek">Arsitek</Label>
                  <Input
                    id="arsitek"
                    value={masjidData.arsitek}
                    onChange={(e) =>
                      setMasjidData((prev) => ({
                        ...prev,
                        arsitek: e.target.value,
                      }))
                    }
                    placeholder="Nama arsitek"
                  />
                </div>
                <div>
                  <Label htmlFor="gaya">Gaya Arsitektur</Label>
                  <Input
                    id="gaya"
                    value={masjidData.gaya}
                    onChange={(e) =>
                      setMasjidData((prev) => ({
                        ...prev,
                        gaya: e.target.value,
                      }))
                    }
                    placeholder="Gaya arsitektur"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mapsUrl">Google Maps URL</Label>
                  <Input
                    id="mapsUrl"
                    value={masjidData.mapsUrl}
                    onChange={(e) =>
                      setMasjidData((prev) => ({
                        ...prev,
                        mapsUrl: e.target.value,
                      }))
                    }
                    placeholder="Link Google Maps"
                  />
                </div>
                <div>
                  <Label htmlFor="sumberFoto">Sumber Foto</Label>
                  <Input
                    id="sumberFoto"
                    value={masjidData.sumberFoto}
                    onChange={(e) =>
                      setMasjidData((prev) => ({
                        ...prev,
                        sumberFoto: e.target.value,
                      }))
                    }
                    placeholder="Sumber foto/kredit"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/posts">Batal</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <SaveIcon className="mr-2 h-4 w-4" />
            {loading ? "Menyimpan..." : "Publikasikan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
