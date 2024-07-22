import Set from "../models/set.model.js";

import { errorHandler } from "../utils/error.js";

export const postSet = async (req, res, next) => {
  const userId = req.user.id
  const { name, comment, selectedItems } = req.body;

  const newSet = new Set({
    name,
    userId,
    comment,
    selectedItems: selectedItems,
  });

  try {
    await newSet.save();
    res
      .status(201)
      .json({ message: "Grupo criado com sucesso", group: newSet });
  } catch (error) {
    next(
      errorHandler(400, "Oops, algo deu errado!")
    );
  }
};

export const getSet = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const groups = await Set.find({ userId }).populate("selectedItems");
    res.status(200).json(groups);
  } catch (error) {
    next(
      errorHandler(400, "Oops, algo deu errado!")
    );
  }
};

export const updateSet = async (req, res, next) => {
  const { id } = req.params;
  const { name, comment, selectedItems } = req.body;

  try {
    
    if (!selectedItems.length) {
      return next(
        errorHandler(400, "Por favor preencha todos os campos obrigatórios!")
      );
    }

    // Atualizar o set
    const updatedSet = await Set.findByIdAndUpdate(
      id,
      {
        $set: {
          name: name,
          comment: comment,
          selectedItems: selectedItems,
        },
      },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updatedSet) {
      return next(
        errorHandler(404, "Grupo não encontrado!")
      );
    }

    res
      .status(200)
      .json({ message: "Set atualizado com sucesso" });
  } catch (error) {
    if (error._message && error._message.includes("Validation failed")) {
      return next(
        errorHandler(400, "Por favor preencha todos os campos obrigatórios!")
      );
    }
    next(
      errorHandler(400, "Oops, algo deu errado!")
    );
  }
};

export const deleteSets = async (req, res, next) => {
  const id  = req.params.id;

  try {
    await Set.findByIdAndDelete(id);
    res.status(200).json({ message: "Set deletado com sucesso!"});
  } catch (error) {
    next(
      errorHandler(400, "Oops, algo deu errado!")
    );

  }
};