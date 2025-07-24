import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/prisma.config";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const imageService = {
  uploadImage: async (
    buffer: Buffer,
    originalname: string,
    mimetype: string,
    altText?: string,
    caption?: string,
    postId?: string
  ) => {
    const fileExt = originalname.split(".").pop() || "jpg";
    const filename = `${uuidv4()}.${fileExt}`;
    const bucket = process.env.SUPABASE_BUCKET!;
    const supabaseUrl = process.env.SUPABASE_URL!;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: mimetype,
      });

    if (error) throw new Error("Gagal upload ke Supabase");

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;

    // ✅ Simpan ke database
    const savedImage = await prisma.image.create({
      data: {
        url: publicUrl,
        altText: altText || null,
        caption: caption || null,
        postId: postId || null,
      },
    });

    return savedImage;
  },

  getImages: async (postId?: string) => {
    return prisma.image.findMany({
      where: postId ? { postId } : undefined,
      orderBy: { order: "asc" },
    });
  },

  getImageById: async (id: string) => {
    return prisma.image.findUnique({ where: { id } });
  },

  updateImage: async (
    id: string,
    data: Partial<{
      caption: string;
      altText: string;
      order: number;
    }>
  ) => {
    return prisma.image.update({
      where: { id },
      data,
    });
  },

  deleteImage: async (id: string) => {
    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) throw new Error("Gambar tidak ditemukan");

    // Optional: hapus dari Supabase storage juga
    const fileName = image.url.split("/").pop()!;
    await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .remove([fileName]);

    // Hapus dari DB
    return prisma.image.delete({ where: { id } });
  },
};
