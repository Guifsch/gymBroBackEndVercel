import express from "express";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/reset.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();
router.post('/forgot-password', verifyToken, forgotPassword);
router.post('/reset-password', verifyToken, resetPassword);
export default router;
