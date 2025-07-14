import "dotenv/config";
import express from "express";
import session from "express-session";
import passport from "passport";
import { PORT, JWT_SECRET } from "./config";
import authRoutes from "./routes/auth.routes";
import postsRoutes from "./routes/post.routes";
import "./middleware/passport";

const app = express();

app.use(express.json());
app.use(
  session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get("/health", (_req, res) => res.send("OK"));

// Auth endpoints
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);

// Global error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
