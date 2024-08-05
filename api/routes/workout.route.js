import express from "express";
import {
  deleteWorkouts,
  getWorkouts,
  postWorkouts,
  updateWorkouts,
  getWorkout
} from "../controllers/workout.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();
router.post("/workouts", verifyToken, postWorkouts);
router.get("/workouts", verifyToken, getWorkouts);
router.get("/workout/:id", verifyToken, getWorkout)
router.delete("/workouts/:id", verifyToken, deleteWorkouts);
router.post("/update/:id", verifyToken, updateWorkouts);



export default router;


