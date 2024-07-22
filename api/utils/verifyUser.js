import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";
import User from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
  const accessToken = req.cookies.access_token; // Access token do cookie
  const refreshToken = req.cookies.refresh_token; // Refresh token do cookie

  if (!accessToken) {
    return next(errorHandler(401, 'Você não está autenticado!'));
  }

  try {
    // Verificar se o access token é válido
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Se o access token expirou, verificar o refresh token
      if (!refreshToken) {
        return next(errorHandler(401, 'Refresh token não fornecido.'));
      }

      try {
        // Verificar o refresh token
        const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
        const user = await User.findById(decodedRefreshToken.id);

        if (!user) {
          return next(errorHandler(401, 'Usuário não encontrado.'));
        }

        // Gerar novos tokens
        const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '15m', 
        });

        const newRefreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_JWT_SECRET, {
          expiresIn: '7d',
        });

        // Definir novos tokens nos cookies
        res.cookie('access_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // https
          sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // https
          path: '/',
        });

        res.cookie('refresh_token', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', 
          sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', 
          path: '/',
        });

        // Atualizar o usuário no req
        req.user = decodedRefreshToken;

        return next();
      } catch (err) {
        return next(errorHandler(403, 'Refresh token inválido.'));
      }
    } else {
      return next(errorHandler(403, 'Token inválido.'));
    }
  }
};

// export const verifyToken = (req, res, next) => {
//   const token = req.cookies.access_token;

//   if (!token) return next(errorHandler(401, "Você não está autentificado!"));

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return next(errorHandler(403, "Seu token não é válido!"));

//     req.user = user;
//     next();
//   });
// };
