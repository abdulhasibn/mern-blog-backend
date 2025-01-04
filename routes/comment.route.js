import express from "express";

import { verifyUser } from "../utils/verifyUser.js";
import {
  createComment,
  getAllComments,
  updateLikeForComment,
  editComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.route("/create").post(verifyUser, createComment);
router.route("/post/:postId").get(verifyUser, getAllComments);
router.route("/editComment/:commentId").patch(verifyUser, editComment);
router.route("/updateLikeForComments").patch(verifyUser, updateLikeForComment);
router.route("/deleteComment/:commentId").patch(verifyUser, deleteComment);

export default router;
