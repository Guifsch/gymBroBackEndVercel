import Calendar from "../models/calendar.model.js";
import { errorHandler } from "../utils/error.js";

export const postCalendar = async (req, res, next) => {
  const userId = req.user.id;
  const { calendarItems } = req.body;

  try {
    // Verificar se já existe um calendário para o usuário
    let calendar = await Calendar.findOne({ userId });

    if (!calendar) {
      // Se o calendário não existe, criar um novo
      const newCalendar = new Calendar({
        userId,
        calendarItems,
      });

      await newCalendar.save();
      return res.status(201).json({ message: "Calendário criado com sucesso" });
    } else {
      // Atualizar o calendário existente
      calendar.calendarItems = calendarItems.map((item) => {
        return {
          name: item.name,
          start: item.start,
          comment: item.comment,
          selectedItems: item.selectedItems,
        };
      });

      await calendar.save();
      return res
        .status(200)
        .json({ message: "Calendário atualizado com sucesso" });
    }
  } catch (error) {
    next(errorHandler(400, "Oops, algo deu errado!"));
  }
};

export const getCalendar = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const calendar = await Calendar.find({ userId }).populate({
      path: "calendarItems",
      populate: {
        path: "selectedItems",
        model: "Workout",
      },
    });
    res.status(200).json(calendar);
  } catch (error) {
    next(errorHandler(400, "Oops, algo deu errado!"));
  }
};
