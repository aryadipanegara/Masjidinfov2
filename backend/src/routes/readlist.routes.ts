import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import {
  addPost,
  createReadList,
  getMyReadLists,
  getReadListPosts,
  removePost,
} from "../controllers/readlist.controller";

const router = Router();

router.use(authenticate);

router.post("/", authenticate, createReadList);
router.get("/", authenticate, getMyReadLists);
router.get("/:readListId/posts", authenticate, getReadListPosts);
router.post("/:readListId/posts/:postId", authenticate, addPost);
router.delete("/:readListId/posts/:postId", authenticate, removePost);

export default router;
