import express from "express";
import {
  postCategorys,
  getCategorys,
  updateCategorys,
  deleteCategorys
} from "../controllers/category.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();
router.post("/categorys", verifyToken, postCategorys);
router.get("/categorys", verifyToken, getCategorys);
router.put("/update/:id", verifyToken, updateCategorys);
router.delete("/categorys/:itemId/categoryItems/:categoryItemId", verifyToken, deleteCategorys);


export default router;


