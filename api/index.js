import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import workoutRoutes from "./routes/workout.route.js";
import categoryRoutes from "./routes/category.route.js";
import calendarRoutes from "./routes/calendar.route.js";
import setRoutes from "./routes/set.route.js";
import resetRoutes from "./routes/reset.route.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDB conectado");
    app.listen(process.env.PORT || 3000, (req, res) => {
      console.log(`Servidor rodando na porta: 3000.`);
    });
  })
  .catch((err) => {
    console.log(err, "ERROR");
  });
const corsOptions = {
  origin: ["https://gym-bro-frontend.vercel.app", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Incluindo OPTIONS
  allowedHeaders: ["Content-Type", "Authorization"], // Adicione outros cabeçalhos se necessário
};

// Middleware de CORS
app.use(cors(corsOptions));

// Middleware para tratar solicitações OPTIONS
app.options('*', cors(corsOptions));

// Outros middlewares
app.use(cookieParser()); // Extrai as informações contidas nos cookies e as torna acessíveis para o servidor
app.use(express.json()); // Middleware usado para analisar o corpo das solicitações HTTP com formato JSON

// Suas rotas
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/set", setRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/reset", resetRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    error: message,
    statusCode: statusCode,
  });
});

export default app;