import express from "express";
import {
  createPost,
  getPosts,
  deletePost,
  updatePost,
} from "../controllers/post.controller.js";
import { verifyUser } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create", verifyUser, createPost);
router.get("/getPosts", getPosts);
router.delete("/deletePost/:postId/:userId", verifyUser, deletePost);
router.put("/updatePost/:postId/:userId", verifyUser, updatePost);

export default router;
