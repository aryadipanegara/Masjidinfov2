import { Request, Response } from "express";
import { categoryService } from "../services/category.service";

export const getCategories = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const result = await categoryService.getCategories(page, limit, search);
  res.json(result);
};

export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await categoryService.getCategoryById(id);
  if (!category) {
    return res.status(404).json({ error: "Kategori tidak ditemukan" });
  }

  res.json(category);
};

export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Nama kategori wajib diisi" });
  }

  const category = await categoryService.createCategory(name);
  res.status(201).json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Nama kategori wajib diisi" });
  }

  const category = await categoryService.updateCategory(id, name);
  res.json(category);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  await categoryService.deleteCategory(id);
  res.status(204).end();
};
