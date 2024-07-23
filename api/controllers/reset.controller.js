import User from "../models/user.model.js";
import ResetToken from '../models/reset.model.js';
import nodemailer from 'nodemailer';
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import { errorHandler } from "../utils/error.js";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  
  }
});

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado.' });
    }

    const token = bcryptjs.genSaltSync(10); // Gera um token usando bcrypt
    const hashedToken = bcryptjs.hashSync(token, 10); // Hash do token

    const resetToken = new ResetToken({
      token: hashedToken,
      userId: user._id,
      expires: Date.now() + 3600000, // 1 hora
    });
    await resetToken.save();
    const resetUrl = `${process.env.BASE_URL}/reset-password?token=${token}&id=${resetToken._id}`;

    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Redefinição de Senha',
      html: `<p>Você solicitou a redefinição de senha. Clique no link para redefinir sua senha: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.status(200).json({ message: 'E-mail de redefinição enviado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao enviar o e-mail de redefinição.' });
  }
};

export const resetPassword = async (req, res, next) => {
  const { newPassword } = req.body;
  const { token, id } = req.query;

  try {
    const now = new Date();//3h nas frente

    await ResetToken.deleteMany({ expires: { $lt: now } }); //limpa tokens expirados

    const resetToken = await ResetToken.findById(id);
    if (!resetToken || resetToken.expires < Date.now()) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }
    const isMatch = bcryptjs.compareSync(token, resetToken.token);
    if (!isMatch) {
      return res.status(400).json({ message: 'Token inválido.' });
    }

    const user = await User.findById(resetToken.userId);
    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado.' });
    }

    // Verificar se a nova senha é igual à senha atual
    if (bcryptjs.compareSync(newPassword, user.password)) {
      return res.status(400).json({ message: 'A nova senha não pode ser igual à senha atual.' });
    }

    // Atualizar a senha do usuário
    user.password = bcryptjs.hashSync(newPassword, 10);
    await user.save();

    // Excluir o token de redefinição
    await ResetToken.deleteOne({ _id: resetToken._id });

    res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao redefinir a senha.' });
  }
};