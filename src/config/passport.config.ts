import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../config/prisma.config";
import { generateToken } from "../services/jwt.service";
import { UserPayload } from "../types/auth.types";
import { ENV } from "./env.config";

// Enable req access inside GoogleStrategy callback
passport.use(
  new GoogleStrategy(
    {
      clientID: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      callbackURL: ENV.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
      passReqToCallback: true, // ✅ Penting agar bisa akses req.user
    },
    async (
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (err: any, user?: any, info?: any) => void
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(
            new Error("Email tidak ditemukan di profil Google"),
            null
          );
        }

        const googleId = profile.id;

        // ⛳️ Cek apakah user sedang login → CONNECT MODE
        const loggedInUser = req.user; // didapat dari auth middleware

        if (loggedInUser) {
          const user = await prisma.user.findUnique({
            where: { id: loggedInUser.userId },
          });
          if (!user) return done(new Error("User tidak ditemukan"), null);

          // 💡 Hubungkan akun Google ke akun yang sedang login
          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: googleId,
              },
            },
            create: {
              userId: user.id,
              type: "oauth",
              provider: "google",
              providerAccountId: googleId,
              accessToken,
              refreshToken,
              idToken: "",
            },
            update: {
              accessToken,
              refreshToken,
              idToken: "",
            },
          });

          await prisma.user.update({
            where: { id: user.id },
            data: {
              hasGoogleAccount: true,
              fullname: profile.displayName || user.fullname,
              avatar: profile.photos?.[0]?.value || user.avatar,
            },
          });

          const payload: UserPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
          };

          const token = generateToken(payload);
          return done(null, { token, connected: true });
        }

        // 🟢 LOGIN MODE
        let user = await prisma.user.findUnique({ where: { email } });

        // ✅ Auto-register jika belum ada
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              fullname: profile.displayName || "",
              avatar: profile.photos?.[0]?.value || "",
              hasGoogleAccount: true,
              role: "VIEWER", // ganti sesuai kebutuhan
            },
          });
        }

        const existingAccount = await prisma.account.findFirst({
          where: {
            provider: "google",
            providerAccountId: googleId,
          },
        });

        if (!existingAccount) {
          await prisma.account.create({
            data: {
              userId: user.id,
              type: "oauth",
              provider: "google",
              providerAccountId: googleId,
              accessToken,
              refreshToken,
              idToken: "",
            },
          });
        } else {
          await prisma.account.update({
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: googleId,
              },
            },
            data: {
              accessToken,
              refreshToken,
              idToken: "",
            },
          });
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            hasGoogleAccount: true,
            fullname: profile.displayName || user.fullname,
            avatar: profile.photos?.[0]?.value || user.avatar,
          },
        });

        const payload: UserPayload = {
          userId: user.id,
          email: user.email,
          role: user.role,
        };

        const token = generateToken(payload);
        return done(null, { token });
      } catch (err: any) {
        console.error("Google OAuth Error:", err);
        return done(err, null);
      }
    }
  )
);

// 🧠 Optional: only required if using session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

export default passport;
