const allowedFields = new Set(["nome", "descricao", "preco", "estoque"]);

function validateProductPayload(body, { partial = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "O corpo da requisição deve ser um objeto JSON." };
  }

  const keys = Object.keys(body);
  const unknownFields = keys.filter((key) => !allowedFields.has(key));
  if (unknownFields.length > 0) {
    return { error: `Campos não permitidos: ${unknownFields.join(", ")}.` };
  }
  if (partial && keys.length === 0) {
    return { error: "Informe ao menos um campo para atualizar." };
  }

  const requiredFields = partial
    ? keys
    : ["nome", "descricao", "preco", "estoque"];
  for (const field of requiredFields) {
    if (!Object.hasOwn(body, field)) {
      return { error: `O campo ${field} é obrigatório.` };
    }
  }

  if (
    Object.hasOwn(body, "nome") &&
    (typeof body.nome !== "string" ||
      body.nome.trim().length === 0 ||
      body.nome.trim().length > 120)
  ) {
    return { error: "O nome deve conter de 1 a 120 caracteres." };
  }
  if (
    Object.hasOwn(body, "descricao") &&
    (typeof body.descricao !== "string" ||
      body.descricao.trim().length === 0 ||
      body.descricao.length > 1000)
  ) {
    return { error: "A descrição deve conter de 1 a 1000 caracteres." };
  }
  if (
    Object.hasOwn(body, "preco") &&
    (typeof body.preco !== "number" ||
      !Number.isFinite(body.preco) ||
      body.preco < 0)
  ) {
    return { error: "O preço deve ser um número finito maior ou igual a zero." };
  }
  if (
    Object.hasOwn(body, "estoque") &&
    (!Number.isInteger(body.estoque) || body.estoque < 0)
  ) {
    return { error: "O estoque deve ser um número inteiro maior ou igual a zero." };
  }

  return { value: body };
}

module.exports = { validateProductPayload };
