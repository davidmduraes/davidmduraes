const express = require("express");
const mongoose = require("mongoose");
const { authenticate } = require("../middleware/authenticate");
const { validateProductPayload } = require("../validation/product");

function createProductsRouter(Product, jwtSecret) {
  const router = express.Router();
  router.use(authenticate(jwtSecret));

  router.post("/", async (req, res, next) => {
    const validation = validateProductPayload(req.body);
    if (validation.error) {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: validation.error },
      });
    }

    try {
      const product = await Product.create(validation.value);
      return res.status(201).json(product);
    } catch (error) {
      return next(error);
    }
  });

  router.get("/", async (_req, res, next) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.status(200).json(products);
    } catch (error) {
      return next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: "O id do produto é inválido." },
      });
    }

    const validation = validateProductPayload(req.body, { partial: true });
    if (validation.error) {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: validation.error },
      });
    }

    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        validation.value,
        { new: true, runValidators: true },
      );
      if (!product) {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Produto não encontrado." },
        });
      }
      return res.status(200).json(product);
    } catch (error) {
      return next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: "O id do produto é inválido." },
      });
    }

    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Produto não encontrado." },
        });
      }
      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = { createProductsRouter };
