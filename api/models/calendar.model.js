import mongoose from "mongoose";

// Definindo o esquema de Set

// Definindo o esquema de CalendarItems
const CalendarItemsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    comment: {
      type: String,
    },
    selectedItems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout',
      required: true,
    }],
  },
);

// Definindo o esquema de Calendar
const CalendarSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    calendarItems: [CalendarItemsSchema], // Corrigido para calendarItems
  },
  { timestamps: true } // Adiciona os campos createdAt e updatedAt automaticamente
);

const Calendar = mongoose.model("Calendar", CalendarSchema);

export default Calendar;