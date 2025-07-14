// src/types/express/index.d.ts
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      // definisikan shape user yang kamu pakai di JWT
      user?: { userId: string; role: string };
    }
  }
}
