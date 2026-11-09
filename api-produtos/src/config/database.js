const mongoose = require("mongoose");

async function connectDatabase(uri) {
  if (!uri) {
    throw new Error("A variável MONGODB_URI é obrigatória.");
  }
  await mongoose.connect(uri);
}

module.exports = { connectDatabase };
