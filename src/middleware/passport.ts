import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import prisma from "../prisma/client";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} from "../config";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile: Profile, done) => {
      try {
        const email = profile.emails![0].value;
        const name = profile.displayName;
        const image = profile.photos?.[0].value || null;

        // Upsert user
        const user = await prisma.user.upsert({
          where: { email },
          update: { name, image },
          create: { email, name, image },
        });

        done(null, user);
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  )
);
