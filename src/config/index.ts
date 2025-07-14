import dotenv from "dotenv";
dotenv.config();

export const PORT: number = parseInt(process.env.PORT || "4000", 10);

export const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET: string = process.env.GOOGLE_CLIENT_SECRET!;
export const GOOGLE_CALLBACK_URL: string = process.env.GOOGLE_CALLBACK_URL!;

export const JWT_SECRET: string = process.env.JWT_SECRET!;
export const JWT_EXPIRES_IN: number = parseInt(
  process.env.JWT_EXPIRES_IN || "3600",
  10
);
