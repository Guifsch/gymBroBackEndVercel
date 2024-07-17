import mongoose from "mongoose";

const categoryitemsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    }
  },
);

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    categoryItems: [categoryitemsSchema] // Definindo um array de objetos
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
