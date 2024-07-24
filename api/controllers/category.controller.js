import Category from "../models/category.model.js";
import { errorHandler } from "../utils/error.js";

export const postCategorys = async (req, res, next) => {
  if (req.body.categoryItems.length === 0) {
    return next(errorHandler(400, "Itens vazios não podem ser salvos!"));
  }
  const { categoryItems } = req.body;
  const newCategorys = new Category({
    ...req.body,
    userId: req.user.id,
  });
  try {
    const names = categoryItems.map((item) => item.name);
    const duplicatesInRequest = names.filter(
      (item, index) => names.indexOf(item) !== index
    );

    if (duplicatesInRequest.length > 0) {
      return next(errorHandler(400, `Itens duplicados não são permitidos!`));
    }
    await newCategorys.save();

    res.status(200).json({ message: "Categoria salva com sucesso" });
  } catch (error) {
    if (error._message.includes("Category validation failed")) {
      return next(errorHandler(400, "Por favor preencha todos os campos!"));
    }
    next(error);
  }
};

export const getCategorys = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const categorys = await Category.find({ userId });
    res.status(200).json(categorys);
  } catch (error) {
    next(errorHandler(400, "Oops, algo deu errado!"));
  }
};

export const updateCategorys = async (req, res, next) => {
  const { id } = req.params;
  const { categoryItems } = req.body;

  if (req.body.categoryItems.length === 0) {
    return next(errorHandler(400, `Nada foi modificado!`));
  }

  try {
    // Verificar se há duplicatas em categoryItems do corpo da requisição
    const names = categoryItems.map((item) => item.name);
    const duplicatesInRequest = names.filter(
      (item, index) => names.indexOf(item) !== index
    );

    if (duplicatesInRequest.length > 0) {
      return next(errorHandler(400, `Itens duplicados não são permitidos!`));
    }

    const item = await Category.findById(id);

    if (!item) {
      return next(errorHandler(404, "Item ou itens não encontrados!"));
    }

    // Cria um array com os nomes das categorias existentes no item
    const existingNames = item.categoryItems.map((findItem) => findItem.name);

    // Verificar se há duplicatas entre a requisição e os itens existentes
    const duplicatesWithExisting = names.filter((name) =>
      existingNames.includes(name)
    );

    if (duplicatesWithExisting.length > 0) {
      return next(errorHandler(400, `Itens duplicados não são permitidos!`));
    }

    // Cria um array para armazenar novos itens de categoria que serão adicionados
    const updatedCategoryItems = [];

    // Itera sobre cada novo item de categoria enviado na requisição
    categoryItems.forEach((newItem) => {
      // Encontra o índice do item no array existente pelo nome
      const index = existingNames.indexOf(newItem.name);

      // Se o item já existir (índice > -1), atualiza-o
      if (index > -1) {
        // Combina o item existente com o novo item usando o operador spread
        item.categoryItems[index] = {
          ...item.categoryItems[index].toObject(),
          ...newItem,
        };
      } else {
        // Se o item não existir, adiciona-o ao array de novos itens
        updatedCategoryItems.push(newItem);
      }
    });

    // Adiciona todos os novos itens ao array de categorias do item
    updatedCategoryItems.forEach((newItem) => item.categoryItems.push(newItem));

    await item.save();
    res.status(200).json({ message: "Categoria salva com sucesso" });
  } catch (error) {
    if (error._message.includes("Category validation failed")) {
      return next(errorHandler(400, "Por favor preencha todos os campos!"));
    }
    next(error);
  }
};

export const deleteCategorys = async (req, res, next) => {
  const { itemId, categoryItemId } = req.params;

  try {
    const item = await Category.findById(itemId);

    // Se o item não for encontrado, retorna uma resposta 404
    if (!item) {
      return next(errorHandler(404, "Item não encontrado!"));
    }

    // Filtra o array 'categoryItems', removendo o item com o '_id' correspondente a 'categoryItemId'
    item.categoryItems = item.categoryItems.filter(
      (categoryItem) => categoryItem._id.toString() !== categoryItemId
    );

    // Se 'categoryItems' estiver vazio após a remoção, exclui o item inteiro
    if (item.categoryItems.length === 0) {
      await Category.findByIdAndDelete(itemId);
      return res
        .status(200)
        .send({ message: "Categoria e todos os seus itens foram excluídos." });
    }

    await item.save();
    res.status(200).send({ message: "Exclusão bem succedida!" });
  } catch (error) {
    next(errorHandler(400, "Oops, algo deu errado!"));
  }
};
