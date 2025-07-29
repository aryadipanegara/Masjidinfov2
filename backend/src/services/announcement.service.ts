import { prisma } from "../config/prisma.config";

export const announcementService = {
  getActiveAnnouncement: async () => {
    return prisma.announcement.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  },

  getAnnouncements: async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [totalItems, data] = await Promise.all([
      prisma.announcement.count(),
      prisma.announcement.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
        hasNextPage: skip + data.length < totalItems,
        hasPrevPage: page > 1,
      },
    };
  },

  createAnnouncement: async (message: string) => {
    return prisma.announcement.create({
      data: { message },
    });
  },

  updateAnnouncement: async (id: string, message: string) => {
    return prisma.announcement.update({
      where: { id },
      data: { message },
    });
  },

  toggleAnnouncement: async (id: string, isActive: boolean) => {
    return prisma.announcement.update({
      where: { id },
      data: { isActive },
    });
  },

  deleteAnnouncement: async (id: string) => {
    return prisma.announcement.delete({
      where: { id },
    });
  },
};
