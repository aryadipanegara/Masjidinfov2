import { Response } from "express";

export const successResponse = (
  res: Response,
  data: any,
  message: string = "Success",
  status: number = 200
): void => {
  res.status(status).json({ status, message, data });
};

export const errorResponse = (
  res: Response,
  error: string,
  message: string = "Error",
  status: number = 400
): void => {
  res.status(status).json({ status, message, error });
};
