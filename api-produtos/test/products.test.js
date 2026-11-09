const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const { createApp } = require("../src/app");

const secret = "test-secret-for-api";
const productId = "65f1a9b3c4d5e6f708192a3b";
const token = jwt.sign({ sub: "tester" }, secret, { algorithm: "HS256" });

function createProductModel() {
  const records = new Map();
  return {
    records,
    create: async (data) => {
      const product = {
        _id: productId,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      records.set(productId, product);
      return product;
    },
    find: () => ({ sort: async () => [...records.values()] }),
    findByIdAndUpdate: async (id, data) => {
      const product = records.get(id);
      if (!product) return null;
      Object.assign(product, data, { updatedAt: new Date().toISOString() });
      return product;
    },
    findByIdAndDelete: async (id) => {
      const product = records.get(id);
      records.delete(id);
      return product || null;
    },
  };
}

let products;
let app;

before(() => {
  products = createProductModel();
  app = createApp({ jwtSecret: secret, productModel: products });
});

after(() => products.records.clear());

test("rejeita requisições sem token Bearer", async () => {
  const response = await request(app).get("/api/produtos").expect(401);
  assert.equal(response.body.error.code, "UNAUTHORIZED");
});

test("rejeita token assinado com outro segredo", async () => {
  const invalidToken = jwt.sign({ sub: "tester" }, "wrong-secret");
  await request(app)
    .get("/api/produtos")
    .set("Authorization", `Bearer ${invalidToken}`)
    .expect(401);
});

test("cria, lista, atualiza parcialmente e exclui produto", async () => {
  const authorization = `Bearer ${token}`;
  const payload = {
    nome: "Teclado",
    descricao: "USB mecânico",
    preco: 199.9,
    estoque: 12,
  };

  const created = await request(app)
    .post("/api/produtos")
    .set("Authorization", authorization)
    .send(payload)
    .expect(201);
  assert.equal(created.body.nome, payload.nome);
  assert.equal(created.body.preco, payload.preco);

  const listed = await request(app)
    .get("/api/produtos")
    .set("Authorization", authorization)
    .expect(200);
  assert.equal(listed.body.length, 1);
  assert.equal(listed.body[0]._id, productId);

  const updated = await request(app)
    .put(`/api/produtos/${productId}`)
    .set("Authorization", authorization)
    .send({ estoque: 7 })
    .expect(200);
  assert.equal(updated.body.estoque, 7);
  assert.equal(updated.body.nome, payload.nome);

  await request(app)
    .delete(`/api/produtos/${productId}`)
    .set("Authorization", authorization)
    .expect(204);
});

test("rejeita dados inválidos e ids malformados", async () => {
  const authorization = `Bearer ${token}`;
  const response = await request(app)
    .post("/api/produtos")
    .set("Authorization", authorization)
    .send({ nome: " ", descricao: "Inválido", preco: -1, estoque: 1.5 })
    .expect(400);
  assert.equal(response.body.error.code, "BAD_REQUEST");

  await request(app)
    .put("/api/produtos/invalid-id")
    .set("Authorization", authorization)
    .send({ estoque: 2 })
    .expect(400);
});

test("retorna 404 para produto inexistente", async () => {
  const authorization = `Bearer ${token}`;
  const unknownId = "65f1a9b3c4d5e6f708192a3c";
  await request(app)
    .put(`/api/produtos/${unknownId}`)
    .set("Authorization", authorization)
    .send({ estoque: 3 })
    .expect(404);
  await request(app)
    .delete(`/api/produtos/${unknownId}`)
    .set("Authorization", authorization)
    .expect(404);
});

test("expõe especificação OpenAPI e health check", async () => {
  await request(app).get("/api-docs/").expect(200);
  await request(app)
    .get("/api-docs.json")
    .expect(200)
    .expect((response) => {
      assert.equal(response.body.openapi, "3.0.3");
      assert.ok(response.body.paths["/api/produtos/{id}"].delete);
    });
  await request(app).get("/health").expect(200, { status: "ok" });
});

test("exige o segredo JWT", () => {
  assert.throws(() => createApp({ jwtSecret: "" }), /JWT_SECRET/);
});
