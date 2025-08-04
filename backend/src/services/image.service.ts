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
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
};

const isAllowedMimeType = (mimetype: string): boolean =>
  ALLOWED_MIME_TYPES.includes(mimetype);

export const imageService = {
  uploadImage: async (
    buffer: Buffer,
    originalname: string,
    mimetype: string,
    altText?: string,
    caption?: string,
    postId?: string,
    userId?: string
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
      const baseName = path
        .basename(originalname, fileExt)
        .replace(/[^a-zA-Z0-9-_]/g, "_");
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${baseName}-${uniqueSuffix}${fileExt}`;

      const fullPath = path.join(UPLOAD_DIR, filename);
      ensureDirectoryExistence(fullPath);
      fs.writeFileSync(fullPath, buffer);

      const publicUrl = `${process.env.BACKEND_URL}${PUBLIC_URL_PREFIX}/${filename}`;

      const savedImage = await prisma.image.create({
        data: {
          url: publicUrl,
          altText: altText || null,
          caption: caption || null,
          postId: postId || null,
          uploadedById: userId || null,
        },
      });

      return savedImage;
    } catch (err: any) {
      console.error("Local Upload Error:", err);
      throw new Error(
        err.message || "Gagal menyimpan gambar ke penyimpanan lokal"
      );
    }
  },

  getImages: async (postId?: string) => {
    return prisma.image.findMany({
      where: {
        isDeleted: false,
        ...(postId ? { postId } : {}),
      },
      orderBy: { order: "asc" },
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullname: true,
            avatar: true,
          },
        },
      },
    });
  },

  getImageById: async (id: string) => {
    return prisma.image.findUnique({
      where: { id, isDeleted: false },
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullname: true,
            avatar: true,
          },
        },
      },
    });
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
    const imageRecord = await prisma.image.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!imageRecord) {
      throw new Error(`Image with ID ${id} not found`);
    }

    await prisma.image.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  },

  restoreImageById: async function (id: string) {
    await prisma.image.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
    });
  },
};
