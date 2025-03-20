import { Request, Response } from "express";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "../services/userService";
import { successResponse, errorResponse } from "../utils/responseUtil";

// Mengambil profil pengguna
export const getProfileHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // Ambil userId dari token
    const user = await getUserProfile(userId);

    if (!user) {
      return errorResponse(res, "User not found", "Not Found", 404);
    }

    successResponse(res, user, "Profile retrieved successfully");
  } catch (error: any) {
    errorResponse(
      res,
      error.message || "Failed to retrieve profile",
      "Internal Server Error",
      500
    );
  }
};

// Memperbarui profil pengguna
export const updateProfileHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email } = req.body;

    const updatedUser = await updateUserProfile(userId, { name, email });
    successResponse(res, updatedUser, "Profile updated successfully");
  } catch (error: any) {
    errorResponse(
      res,
      error.message || "Failed to update profile",
      "Internal Server Error",
      500
    );
  }
};

// Mengubah password pengguna
export const changePasswordHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { oldPassword, newPassword } = req.body;

    await changePassword(userId, oldPassword, newPassword);
    successResponse(res, null, "Password changed successfully");
  } catch (error: any) {
    errorResponse(
      res,
      error.message || "Failed to change password",
      "Internal Server Error",
      500
    );
  }
};
