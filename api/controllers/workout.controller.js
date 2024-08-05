import Workout from "../models/workout.model.js";

import { errorHandler } from "../utils/error.js";

export const postWorkouts = async (req, res, next) => {
  const { name, rep, weight, serie, category, comment, exercisePicture } =
    req.body;
  if (!category) {
    return next(
      errorHandler(400, "Por favor preencha todos os campos obrigatórios!")
    );
  }
  const newWorkout = new Workout({
    name,
    rep,
    weight,
    serie,
    category,
    exercisePicture,
    comment,
    userId: req.user.id,
  });

  try {
    await newWorkout.save();
    return res.status(201).json({ message: "Treino salvo" });
  } catch (error) {
    if (error._message.includes("Workout validation failed")) {
      return next(
        errorHandler(400, "Por favor preencha todos os campos obrigatórios!")
      );
    }
    next(errorHandler(400, "Oops, algo deu errado!"));
  }
};

export const deleteWorkouts = async (req, res, next) => {
  const id = req.params.id;
  // erro esquisto que se tu colocar o id do usuario da successo no delete mas n deleta nada

  try {
    await Workout.findByIdAndDelete(id);
    res.status(200).send({ message: "Exclusão bem succedida!" });
  } catch (error) {
    next(errorHandler(400, "Oops, algo deu errado!"));
  }
};

export const getWorkouts = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const workouts = await Workout.find({ userId });

    res.status(200).json({
      workouts,
    });
  } catch (error) {
    next(errorHandler(400, "Oops, algo deu errado!"));
  }
};

export const getWorkout = async (req, res, next) => {
  const workoutId = req.params.id
  
  try {
    const workout = await Workout.findById( workoutId, );
    res.status(200).json({
      workout,
    });
  } catch (error) {
    next(errorHandler(400, "Oops, algo deu errado!"));
  }
};
export const updateWorkouts = async (req, res, next) => {

  try {
    const workoutUpdated = await Workout.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          rep: req.body.rep,
          weight: req.body.weight,
          serie: req.body.serie,
          exercisePicture: req.body.exercisePicture,
          category: req.body.category,
          comment: req.body.comment,
        },
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ message: "Atualização completa", workoutUpdated });
  } catch (error) {
    if (error._message.includes("Validation failed")) {
      return next(
        errorHandler(400, "Por favor preencha todos os campos obrigatórios!")
      );
    } else {
      next(errorHandler(400, "Oops, algo deu errado!"));
    }
  }
};
