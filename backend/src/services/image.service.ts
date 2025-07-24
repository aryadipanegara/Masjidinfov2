import { prisma } from "../config/prisma.config";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(__dirname, "../../public/images");
const PUBLIC_URL_PREFIX = "/images";
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const ensureDirectoryExistence = (filePath: string) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
};

const isAllowedMimeType = (mimetype: string): boolean => {
  return ALLOWED_MIME_TYPES.includes(mimetype);
};

export const imageService = {
  uploadImage: async (
    buffer: Buffer,
    originalname: string,
    mimetype: string,
    altText?: string,
    caption?: string,
    postId?: string
  ) => {
    if (!originalname || !mimetype) {
      throw new Error("Nama file dan tipe mime diperlukan.");
    }

    if (!isAllowedMimeType(mimetype)) {
      throw new Error(
        `Tipe file tidak didukung: ${mimetype}. Hanya ${ALLOWED_MIME_TYPES.join(
          ", "
        )} yang diperbolehkan.`
      );
    }

    try {
      const fileExt = path.extname(originalname).toLowerCase() || ".jpg";
      const filenameWithoutExt = path
        .basename(originalname, fileExt)
        .replace(/[^a-zA-Z0-9-_]/g, "_");
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = `${filenameWithoutExt}-${uniqueSuffix}${fileExt}`;

      const fullPath = path.join(UPLOAD_DIR, filename);

      ensureDirectoryExistence(fullPath);
      fs.writeFileSync(fullPath, buffer);

      const publicUrl = `${PUBLIC_URL_PREFIX}/${filename}`;

      const savedImage = await prisma.image.create({
        data: {
          url: publicUrl,
          altText: altText || null,
          caption: caption || null,
          postId: postId || null,
        },
      });

      return savedImage;
    } catch (error: any) {
      console.error("Local Upload Error:", error);
      throw new Error(
        error.message || "Gagal menyimpan gambar ke penyimpanan lokal"
      );
    }
  },

  getImages: async (postId?: string) => {
    return prisma.image.findMany({
      where: postId ? { postId } : undefined,
      orderBy: { order: "asc" as const },
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

  deleteImageByPath: async function (imageUrl: string) {
    try {
      if (!imageUrl || !imageUrl.startsWith(PUBLIC_URL_PREFIX)) {
        console.warn(
          `Invalid or non-local image URL for deletion: ${imageUrl}`
        );
        return;
      }

      const relativePath = imageUrl.substring(PUBLIC_URL_PREFIX.length);
      const absolutePath = path.join(UPLOAD_DIR, relativePath);

      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
        console.log(`Deleted local file: ${absolutePath}`);
      } else {
        console.warn(`File not found for deletion: ${absolutePath}`);
      }
    } catch (error) {
      console.error("Error deleting local file by path:", error);
    }
  },

  deleteImageById: async function (id: string) {
    try {
      const imageRecord = await prisma.image.findUnique({
        where: { id },
      });

      if (!imageRecord) {
        console.warn(`Image with ID ${id} not found in database.`);
        return;
      }

      await this.deleteImageByPath(imageRecord.url);

      await prisma.image.delete({
        where: { id },
      });

      console.log(`Successfully deleted image record and file for ID: ${id}`);
    } catch (error) {
      console.error("Error deleting image by ID:", error);
      throw new Error("Gagal menghapus gambar dari sistem.");
    }
  },
};
