const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome é obrigatório."],
      trim: true,
      minlength: [1, "O nome não pode ficar vazio."],
      maxlength: [120, "O nome deve ter no máximo 120 caracteres."],
    },
    descricao: {
      type: String,
      required: [true, "A descrição é obrigatória."],
      trim: true,
      minlength: [1, "A descrição não pode ficar vazia."],
      maxlength: [1000, "A descrição deve ter no máximo 1000 caracteres."],
    },
    preco: {
      type: Number,
      required: [true, "O preço é obrigatório."],
      min: [0, "O preço deve ser maior ou igual a zero."],
      validate: { validator: Number.isFinite, message: "O preço deve ser finito." },
    },
    estoque: {
      type: Number,
      required: [true, "O estoque é obrigatório."],
      min: [0, "O estoque deve ser maior ou igual a zero."],
      validate: {
        validator: Number.isInteger,
        message: "O estoque deve ser um número inteiro.",
      },
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Product", productSchema);
