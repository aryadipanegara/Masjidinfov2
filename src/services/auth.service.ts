import * as jwt from "jsonwebtoken";
import prisma from "../prisma/client";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config";
import { Profile } from "passport-google-oauth20";

export interface JwtPayload {
  userId: number;
  role: string;
}

/**
 * Upsert user berdasarkan Google profile
 */
export async function upsertGoogleUser(profile: Profile) {
  const email = profile.emails?.[0].value!;
  const name = profile.displayName;
  const image = profile.photos?.[0].value || null;
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, image },
    create: { email, name, image },
  });
  return user;
}

/**
 * Issue JWT sesuai payload
 */
export function generateJwt(user: { id: number; role: string }): string {
  const payload: JwtPayload = {
    userId: user.id,
    role: user.role,
  };
  return jwt.sign(
    payload,
    JWT_SECRET as jwt.Secret,
    { expiresIn: JWT_EXPIRES_IN } // number of seconds
  );
}
