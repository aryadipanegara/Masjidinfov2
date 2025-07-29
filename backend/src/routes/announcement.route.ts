import { Router } from "express";
import {
  getActiveAnnouncement,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcement.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

router.get("/announcement", getActiveAnnouncement);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  getAllAnnouncements
);
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  createAnnouncement
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  updateAnnouncement
);
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  toggleAnnouncement
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  deleteAnnouncement
);

export default router;
