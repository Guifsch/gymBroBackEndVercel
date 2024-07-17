import express from "express";
import {
  postSet,
  getSet,
  updateSet,
  deleteSets
} from "../controllers/set.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();
router.post("/sets", verifyToken, postSet);
router.get("/sets", verifyToken, getSet);
router.post("/update/:id", verifyToken, updateSet);
router.delete("/delete/:id", verifyToken, deleteSets);

export default router;


