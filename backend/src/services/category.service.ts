import { prisma } from "../config/prisma.config";
import { Prisma } from "@prisma/client";

export const categoryService = {
  getCategories: async (
    page: number = 1,
    limit: number = 10,
    search: string = ""
  ) => {
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = search
      ? {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {};

    const [totalItems, categories] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      data: categories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
        hasNextPage: skip + categories.length < totalItems,
        hasPrevPage: page > 1,
      },
    };
  },

  getCategoryById: async (id: string) => {
    return prisma.category.findUnique({ where: { id } });
  },

  createCategory: async (name: string) => {
    return prisma.category.create({ data: { name } });
  },

  updateCategory: async (id: string, name: string) => {
    return prisma.category.update({
      where: { id },
      data: { name },
    });
  },

  deleteCategory: async (id: string) => {
    return prisma.category.delete({ where: { id } });
  },
};
