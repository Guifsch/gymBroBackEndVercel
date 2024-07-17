import express from "express";
import {
  users,
  updateUser,
  deleteUser,
  getUser
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/users", verifyToken, users);
router.post("/update/:id", verifyToken, updateUser);
router.get("/user/:id", verifyToken, getUser);
router.delete("/delete/:id", verifyToken, deleteUser);

export default router;
