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
      return next(errorHandler(500, "Um usuário com esse nome já existe, tente outro!"));
    const findExistEmail = await User.findOne({ email: email });
    if (findExistEmail)
      return next(errorHandler(500, "Um usuário com esse email já existe, tente outro!"));
    await newUser.save();
    res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email: email });
    if (!validUser)
      return next(errorHandler(404, "Usuário ou senha incorreto"));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword)
      return next(errorHandler(401, "Usuário ou senha incorreto"));
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET); // Tokken com o segredo
    const { password: hashedPassword, ...resto } = validUser._doc; // Não retornar a senha com a resposta apenas o "resto" do login como medida de segurança
    // const expiryDate = new Date(Date.now() + 3600000); // 1hora
    const expiryDate = new Date(Date.now() + 9999999); // ao infinito e alem
    // const expiryDate = new Date(Date.now() + 3600); // 3segundos
    res
      .cookie("access_token", token, { httpOnly: true, expires: expiryDate })
      .status(200)
      .json(resto);
  } catch (error) {
    next(
      errorHandler(400, "Oops, algo deu errado!")
    );
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      //se já houver um usuário registrado com a conta google, apenas criará o token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: hashedPassword, ...resto } = user._doc;
      const expiryDate = new Date(Date.now() + 3600000); // 1hora
          // const expiryDate = new Date(Date.now() + 3600); // 3segundos
      res
        .cookie("access_token", token, { httpOnly: true, expires: expiryDate })
        .status(200)
        .json(resto);
      //caso não haja, cria username e password genéricos baseando-se nas informações da conta google
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8); // um password de 8 digitos aleatório para o usuário que logar com a conta google
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10); // criptografa o password
      const newUser = new User({
        // cria um username juntando o nome e o sobrenome e adicionando números no final dos dados retirados da conta google
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-8).toString(),
        email: req.body.email,
        password: hashedPassword,
        profilePicture: req.body.photo,
      });
      //salva no banco de dados
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: hashedPassword2, ...resto } = newUser._doc;
      const expiryDate = new Date(Date.now() + 3600000);
      res
        .cookie("access_token", token, { httpOnly: true, expires: expiryDate })
        .status(200)
        .json(resto);
    }
  } catch (error) {
    next(
      errorHandler(400, "Oops, algo deu errado!")
    );
  }
};

export const signout = (req, res) => {
  try {
    res.clearCookie("access_token").status(200).json({message: "Desconectado com sucesso!"});
  } catch (error) {
    next(
      errorHandler(400, "Oops, algo deu errado!")
    );
  }

};
