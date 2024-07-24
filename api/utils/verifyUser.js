import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) return next(errorHandler(401, "Você não está autentificado!"));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.cookie("access_token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        path: "/",
      });
      return next(errorHandler(403, "Você não está autentificado!"));
    }
      
      

    // Se o token for válido, gere um novo token
    const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    const expiryDate = new Date(Date.now() + 3600000);

    res.cookie("access_token", newToken, {
      httpOnly: true,
      expires: expiryDate,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
    });

    req.user = user;
    next();
  });
};
