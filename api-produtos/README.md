# API de Gerenciamento de Produtos

API REST em Node.js com Express e MongoDB para criar, listar, atualizar e excluir produtos. O modelo contém `nome`, `descricao`, `preco` e `estoque`.

## Requisitos

- Node.js 20 ou superior e npm
- MongoDB local ou gerenciado

## Instalação e execução

```sh
npm install
```

Copie `.env.example` para `.env` e configure:

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `PORT` | não | Porta HTTP; padrão `3000` |
| `MONGODB_URI` | sim | URI de conexão ao MongoDB |
| `JWT_SECRET` | sim | Segredo compartilhado para validar JWT HS256 |

```sh
npm start
```

Swagger interativo: `http://localhost:3000/api-docs`. Especificação OpenAPI: `http://localhost:3000/api-docs.json`. Health check: `http://localhost:3000/health`.

## Autenticação

Todas as rotas CRUD exigem `Authorization: Bearer <token>`. O servidor verifica assinatura, validade e algoritmo HS256 usando `JWT_SECRET`. O repositório não contém usuários, login, emissão nem renovação de tokens; estes devem ser fornecidos por um provedor confiável que compartilhe o segredo. Token ausente, malformado, inválido ou expirado retorna `401 Unauthorized`. Não publique o segredo nem use o valor de exemplo em produção.

## Endpoints

| Método | Rota | Resultado |
| --- | --- | --- |
| `POST` | `/api/produtos` | Cria o produto (`201`) |
| `GET` | `/api/produtos` | Lista produtos (`200`) |
| `PUT` | `/api/produtos/{id}` | Atualiza um ou mais campos (`200`) |
| `DELETE` | `/api/produtos/{id}` | Exclui o produto (`204`) |

Exemplo de criação (todos os campos são obrigatórios):

```json
{
  "nome": "Teclado",
  "descricao": "USB mecânico",
  "preco": 199.9,
  "estoque": 12
}
```

Preço deve ser número não negativo; estoque, inteiro não negativo. Campos desconhecidos são rejeitados. Dados ou IDs inválidos retornam `400`; produto ausente em atualização/exclusão retorna `404`. Erros inesperados retornam `500` sem detalhes internos.

## Testes

```sh
npm test
```

Os testes exercitam autenticação, CRUD, validação, códigos de erro e endpoints Swagger/saúde usando um modelo simulado, sem exigir MongoDB.
