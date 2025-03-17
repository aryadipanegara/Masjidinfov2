import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/authService";
import { registerSchema, loginSchema } from "../utils/validation";

export const register = async (req: Request, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const { user, token } = await registerUser(validation.data);
    res.status(201).json({ message: "Registrasi berhasil", token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const { user, token } = await loginUser(validation.data);
    res.json({ message: "Login berhasil", token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
