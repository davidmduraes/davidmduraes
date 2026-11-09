const express = require("express");
const swaggerUi = require("swagger-ui-express");
const Product = require("./models/product");
const { createProductsRouter } = require("./routes/products");
const { openapi } = require("./openapi");

function createApp({ jwtSecret = process.env.JWT_SECRET, productModel = Product } = {}) {
  if (!jwtSecret) {
    throw new Error("A variável JWT_SECRET é obrigatória.");
  }

  const app = express();
  app.use(express.json({ limit: "100kb" }));
  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi));
  app.get("/api-docs.json", (_req, res) => res.status(200).json(openapi));
  app.use("/api/produtos", createProductsRouter(productModel, jwtSecret));

  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: "O corpo JSON é inválido." },
      });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: error.message },
      });
    }
    if (error.type === "entity.too.large") {
      return res.status(413).json({
        error: {
          code: "PAYLOAD_TOO_LARGE",
          message: "O corpo excede o limite permitido.",
        },
      });
    }

    console.error("Erro ao processar requisição:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno do servidor.",
      },
    });
  });

  return app;
}

module.exports = { createApp };
