import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({
    username: username,
    email: email,
    password: hashedPassword,
  });

  try {
    const findExistUsername = await User.findOne({ username: username });
    if (findExistUsername)
      return next(
        errorHandler(500, "Um usuário com esse nome já existe, tente outro!")
      );
    const findExistEmail = await User.findOne({ email: email });
    if (findExistEmail)
      return next(
        errorHandler(500, "Um usuário com esse email já existe, tente outro!")
      );
    await newUser.save();
    res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Verificar se o usuário existe
    const validUser = await User.findOne({ email: email });
    if (!validUser) {
      return next(errorHandler(404, "Usuário ou senha incorreto"));
    }

    // Verificar a senha
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(401, "Usuário ou senha incorreto"));
    }

    // Gerar o token com expiração
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expira em 1 hora
    });

    // Excluir a senha dos dados que serão retornados
    const { password: hashedPassword, ...resto } = validUser._doc;

    // Configurar o cookie
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure em produção
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Configuração para produção
        path: "/",
      })
      .status(200)
      .json(resto);
  } catch (error) {
    next(errorHandler(400, "Oops, algo deu errado!"));
  }
};

export const google = async (req, res, next) => {
  try {
    const { email, name, photo } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      // Se já houver um usuário registrado com a conta Google, apenas cria o token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h", // Token expira em 1 hora
      });
      const { password: hashedPassword, ...resto } = user._doc;

      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Use secure em produção
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Configuração para produção
          path: "/",
        })
        .status(200)
        .json(resto);
    } else {
      // Caso não haja, cria um username e password genéricos baseando-se nas informações da conta Google
      const generatedPassword = Math.random().toString(36).slice(-8); // Um password de 8 dígitos aleatório para o usuário que logar com a conta Google
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10); // Criptografa o password
      const newUser = new User({
        username:
          name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-8),
        email,
        password: hashedPassword,
        profilePicture: photo,
      });

      // Salva no banco de dados
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1h", // Token expira em 1 hora
      });
      const { password: hashedPassword2, ...resto } = newUser._doc;

      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Use secure em produção
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Configuração para produção
          path: "/",
        })
        .status(200)
        .json(resto);
    }
  } catch (error) {
    next(errorHandler(400, "Oops, algo deu errado!"));
  }
};

export const signout = (req, res) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json({ message: "Desconectado com sucesso!" });
  } catch (error) {
    next(errorHandler(400, "Oops, algo deu errado!"));
  }
};
