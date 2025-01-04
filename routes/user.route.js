import express from "express";

import {
  updateUser,
  deleteUser,
  getUsers,
} from "../controllers/user.controller.js";
import { verifyUser } from "../utils/verifyUser.js";
const router = express.Router();

router.put("/update/:userId", verifyUser, updateUser);
router.delete("/delete/:userId", verifyUser, deleteUser);
router.get("/getUsers", verifyUser, getUsers);

export default router;
