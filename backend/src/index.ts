import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import session from "express-session";
import cors from "cors";
import morgan from "morgan";
import { ENV } from "./config/env.config";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.routes";
import passport from "passport";
import cookieParser from "cookie-parser";

const app = express();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MasjidInfo API",
      version: "2.0.0",
      description: "Dokumentasi REST API MasjidInfo",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:5173", // kalau masih dipakai untuk testing
  "https://masjidinfo.net", // contoh production
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: ENV.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 10 },
  })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API Berjalan!" });
});

app.listen(ENV.PORT, () => {
  console.log(`Server jalan di http://localhost:${ENV.PORT}`);
});
