import { Router } from "express";
import passport from "passport";
import { googleCallback } from "../controllers/auth.controller";

const router = Router();

// Step 1: Redirect to Google consent
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Step 2: Handle callback and issue JWT
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/", // bisa ke halaman error
  }),
  googleCallback
);

export default router;
