import express from "express";
import {
  getCalendar,
  postCalendar,
} from "../controllers/calendar.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();
router.post("/calendar", verifyToken, postCalendar);
router.get("/calendar", verifyToken, getCalendar);

export default router;
