import jwt from "jsonwebtoken";
import { UserPayload } from "../types/auth.types";
import { ENV } from "../config/env.config";

export const generateToken = (payload: UserPayload): string => {
  console.log("🔐 Generating token with:", {
    payload,
    expiresIn: ENV.JWT_EXPIRES_IN,
    secretLength: ENV.JWT_SECRET.length,
  });
  const token = jwt.sign(payload, ENV.JWT_SECRET as jwt.Secret, {
    expiresIn: parseInt(ENV.JWT_EXPIRES_IN),
  });
  const decoded = jwt.decode(token) as UserPayload & {
    exp: number;
    iat: number;
  };
  console.log("🕒 Token generated:", {
    iat: new Date(decoded.iat * 1000).toISOString(),
    exp: new Date(decoded.exp * 1000).toISOString(),
    expiresInMinutes: (decoded.exp - decoded.iat) / 60,
  });
  return token;
};

export const verifyToken = (token: string): UserPayload => {
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as UserPayload & {
      exp: number;
    };
    console.log(
      "Token valid sampai:",
      new Date(decoded.exp * 1000).toISOString()
    );
    return decoded;
  } catch (err: any) {
    console.error("JWT Verify Error:", err.message);
    throw new Error("Token tidak valid atau sudah kadaluarsa.");
  }
};
