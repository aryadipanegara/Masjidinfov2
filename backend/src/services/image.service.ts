import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.config";
import fs from "fs";
import path from "path";
import { GetImagesOptions } from "../types/image.types";

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
    userId?: string // ⚠️ ini bisa undefined/null
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

    // 🔥 VALIDASI: userId WAJIB ADA
    if (!userId) {
      throw new Error("Unauthorized: User tidak terautentikasi.");
    }

    // Opsional: Cek apakah user benar-benar ada di database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Unauthorized: User tidak ditemukan di database.");
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
          uploadedById: userId, // ✅ sekarang pasti ada
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
  getImages: async (opts: GetImagesOptions = {}) => {
    const {
      page = 1,
      limit = 12,
      search = "",
      postId,
      uploadedById,
      includeDeleted = false,
      dateFrom,
      dateTo,
      sort = "order-asc",
    } = opts;

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 12;
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.ImageWhereInput = {
      ...(includeDeleted ? {} : { isDeleted: false }),
      ...(postId ? { postId } : {}),
      ...(uploadedById ? { uploadedById } : {}),
      ...(search
        ? {
            OR: [
              { caption: { contains: search, mode: "insensitive" } },
              { altText: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...((dateFrom || dateTo) && {
        uploadedAt: {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo ? { lte: new Date(dateTo) } : {}),
        },
      }),
    };

    const orderBy: Prisma.ImageOrderByWithRelationInput[] = (() => {
      switch (sort) {
        case "newest":
          return [{ uploadedAt: "desc" }];
        case "oldest":
          return [{ uploadedAt: "asc" }];
        case "order-desc":
          return [{ order: "desc" }, { uploadedAt: "desc" }];
        case "order-asc":
        default:
          return [{ order: "asc" }, { uploadedAt: "desc" }];
      }
    })();

    const [totalItems, images] = await Promise.all([
      prisma.image.count({ where }),
      prisma.image.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy,
        include: {
          uploadedBy: { select: { id: true, fullname: true, avatar: true } },
        },
      }),
    ]);

    return {
      data: images,
      pagination: {
        currentPage: safePage,
        totalPages: Math.ceil(totalItems / safeLimit),
        totalItems,
        itemsPerPage: safeLimit,
        hasNextPage: skip + images.length < totalItems,
        hasPrevPage: safePage > 1,
      },
    };
  },

  getImageById: async (id: string, includeDeleted = false) => {
    return prisma.image.findFirst({
      where: { id, ...(includeDeleted ? {} : { isDeleted: false }) },
      include: {
        uploadedBy: { select: { id: true, fullname: true, avatar: true } },
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
