require("dotenv").config();

const mongoose = require("mongoose");
const { createApp } = require("./app");
const { connectDatabase } = require("./config/database");

async function startServer() {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("A variável PORT deve ser um número entre 1 e 65535.");
  }

  const app = createApp();
  await connectDatabase(process.env.MONGODB_URI);
  const server = app.listen(port, () => {
    console.log(`API de produtos disponível na porta ${port}.`);
  });

  const shutdown = () => {
    server.close(() => {
      mongoose.connection.close().finally(() => process.exit(0));
    });
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

startServer().catch((error) => {
  console.error("Não foi possível iniciar a API:", error.message);
  process.exitCode = 1;
});
