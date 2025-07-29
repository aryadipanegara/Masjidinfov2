import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getHistory } from "../controllers/history.controller";

const router = Router();

router.use(authenticate);

router.get("/", authenticate, getHistory);

export default router;
