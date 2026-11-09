const productProperties = {
  nome: { type: "string", minLength: 1, maxLength: 120, example: "Teclado" },
  descricao: {
    type: "string",
    minLength: 1,
    maxLength: 1000,
    example: "USB mecânico",
  },
  preco: { type: "number", minimum: 0, example: 199.9 },
  estoque: { type: "integer", minimum: 0, example: 12 },
};

const errorContent = {
  "application/json": {
    schema: {
      type: "object",
      properties: {
        error: {
          type: "object",
          required: ["code", "message"],
          properties: {
            code: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
  },
};

const openapi = {
  openapi: "3.0.3",
  info: {
    title: "API de Gerenciamento de Produtos",
    version: "1.0.0",
    description:
      "CRUD protegido por JWT Bearer. Não há emissão ou gestão de usuários/tokens nesta API; tokens HS256 devem ser emitidos por provedor confiável que compartilhe JWT_SECRET.",
  },
  servers: [{ url: "/" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Produto: {
        type: "object",
        required: ["_id", "nome", "descricao", "preco", "estoque"],
        properties: {
          _id: { type: "string", example: "65f1a9b3c4d5e6f708192a3b" },
          ...productProperties,
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/produtos": {
      post: {
        summary: "Criar produto",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nome", "descricao", "preco", "estoque"],
                properties: productProperties,
                additionalProperties: false,
              },
            },
          },
        },
        responses: {
          201: {
            description: "Produto criado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Produto" },
              },
            },
          },
          400: { description: "Dados inválidos.", content: errorContent },
          401: {
            description: "Token ausente, inválido ou expirado.",
            content: errorContent,
          },
        },
      },
      get: {
        summary: "Listar produtos",
        responses: {
          200: {
            description: "Produtos do mais recente para o mais antigo.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Produto" },
                },
              },
            },
          },
          401: {
            description: "Token ausente, inválido ou expirado.",
            content: errorContent,
          },
        },
      },
    },
    "/api/produtos/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
        },
      ],
      put: {
        summary: "Atualizar campos de um produto",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                minProperties: 1,
                properties: productProperties,
                additionalProperties: false,
              },
            },
          },
        },
        responses: {
          200: {
            description: "Produto atualizado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Produto" },
              },
            },
          },
          400: { description: "Id ou dados inválidos.", content: errorContent },
          401: {
            description: "Token ausente, inválido ou expirado.",
            content: errorContent,
          },
          404: { description: "Produto não encontrado.", content: errorContent },
        },
      },
      delete: {
        summary: "Excluir produto",
        responses: {
          204: { description: "Produto excluído." },
          400: { description: "Id inválido.", content: errorContent },
          401: {
            description: "Token ausente, inválido ou expirado.",
            content: errorContent,
          },
          404: { description: "Produto não encontrado.", content: errorContent },
        },
      },
    },
  },
};

module.exports = { openapi };
