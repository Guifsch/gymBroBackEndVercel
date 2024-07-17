import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";

export const users = async (req, res, next) => {
  const allUsers = await User.find({}).sort({ createdAt: -1 });
  res.json(allUsers);
};

export const getUser = async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      return next(errorHandler(404, "Usuário não encontrado!"));
    }
    const { password, ...resto } = user._doc;
    res.status(200).json(resto);
  } catch (error) {
    next(
      errorHandler(400, "Oops, algo deu errado!")
    );
  }
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(
      errorHandler(401, "Você só pode atualizar a sua própria conta!")
    ); //verifica se a pessoa que está querendo atualizar o perfil é realmente a dona do perfil
  }

  if (!req.body.username || !req.body.email || !req.body.profilePicture)
  {
    return next(
      errorHandler(401, "Por favor preencha todos os campos obrigatórios!")
    ); 
  }
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          profilePicture: req.body.profilePicture,
        },
      },
      { new: true, runValidators: true  }
    );
    const { password, ...resto } = updatedUser._doc;
    res.status(200).json(resto);
  } catch (error) {
    next(
      errorHandler(400, "Oops, algo deu errado!")
    );
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "Você não está autentificado!"));
  }
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("Usuário deletado com successo!");
  } catch (error) {
    next(
      errorHandler(400, "Oops, algo deu errado!")
    );
  }
};
