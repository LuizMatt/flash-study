# FlashStudy — Especificação da API REST

## Convenções Gerais

| Item | Valor |
|------|-------|
| Base URL | `http://localhost:3333/api` |
| Content-Type | `application/json` |
| Autenticação | Header `Authorization: Bearer <accessToken>` |
| Formato de ID | UUID v4 |
| Formato de data | ISO 8601 (`2025-01-15T10:30:00.000Z`) |

### Resposta de sucesso

```json
{
  "data": { ... }
}
```

### Resposta de erro

```json
{
  "error": {
    "message": "Descrição do erro",
    "code": "VALIDATION_ERROR"
  }
}
```

### Códigos de erro comuns

| Código HTTP | Code | Quando |
|-------------|------|--------|
| 400 | `VALIDATION_ERROR` | Payload inválido |
| 401 | `UNAUTHORIZED` | Token ausente, expirado ou inválido |
| 403 | `FORBIDDEN` | Recurso pertence a outro usuário |
| 404 | `NOT_FOUND` | Recurso não encontrado |
| 409 | `CONFLICT` | Recurso duplicado (ex: email, nome de categoria) |
| 429 | `RATE_LIMITED` | Muitas requisições |
| 500 | `INTERNAL_ERROR` | Erro inesperado no servidor |

---

## 1. Auth — Autenticação

### 1.1 Registro

Cria um novo usuário e retorna tokens de autenticação.

```
POST /api/auth/register
```

**Autenticação:** ❌ Pública

**Request Body:**

```json
{
  "name": "João Silva",
  "email": "joao@gmail.com",
  "password": "minhasenha123"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `name` | string | ✅ | Min 2, max 100 caracteres |
| `email` | string | ✅ | Email válido, max 255 caracteres |
| `password` | string | ✅ | Min 6, max 128 caracteres |

**Response: 201 Created**

```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "João Silva",
      "email": "joao@gmail.com",
      "createdAt": "2025-01-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Erros possíveis:**
- `409 Conflict` — Email já cadastrado

---

### 1.2 Login

Autentica um usuário existente.

```
POST /api/auth/login
```

**Autenticação:** ❌ Pública

**Request Body:**

```json
{
  "email": "joao@gmail.com",
  "password": "minhasenha123"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `email` | string | ✅ | Email válido |
| `password` | string | ✅ | Não vazio |

**Response: 200 OK**

```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "João Silva",
      "email": "joao@gmail.com",
      "createdAt": "2025-01-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Erros possíveis:**
- `401 Unauthorized` — Email ou senha inválidos

---

### 1.3 Refresh Token

Renova o access token usando um refresh token válido.

```
POST /api/auth/refresh
```

**Autenticação:** ❌ Pública (usa refresh token no body)

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response: 200 OK**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

> O refresh token antigo é revogado e um novo par é gerado (rotação de token).

**Erros possíveis:**
- `401 Unauthorized` — Refresh token inválido, expirado ou revogado

---

### 1.4 Logout

Revoga o refresh token atual.

```
POST /api/auth/logout
```

**Autenticação:** 🔒 JWT obrigatório

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response: 200 OK**

```json
{
  "data": {
    "message": "Logout realizado com sucesso"
  }
}
```

---

## 2. Users — Usuários

### 2.1 Obter perfil do usuário autenticado

```
GET /api/users/me
```

**Autenticação:** 🔒 JWT obrigatório

**Response: 200 OK**

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@gmail.com",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "stats": {
      "totalCategories": 3,
      "totalFlashcards": 45,
      "totalLearned": 28
    }
  }
}
```

---

### 2.2 Atualizar perfil

```
PATCH /api/users/me
```

**Autenticação:** 🔒 JWT obrigatório

**Request Body (parcial):**

```json
{
  "name": "João da Silva"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `name` | string | ❌ | Min 2, max 100 caracteres |

**Response: 200 OK**

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João da Silva",
    "email": "joao@gmail.com",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 3. Categories — Categorias / Decks

### 3.1 Listar categorias do usuário

```
GET /api/categories
```

**Autenticação:** 🔒 JWT obrigatório

**Query Parameters:**

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `page` | integer | 1 | Página atual |
| `limit` | integer | 20 | Itens por página (max 50) |

**Response: 200 OK**

```json
{
  "data": [
    {
      "id": "cat-uuid-1",
      "name": "Redes e IoT",
      "color": "#2563EB",
      "icon": "globe-outline",
      "createdAt": "2025-01-10T00:00:00.000Z",
      "updatedAt": "2025-01-10T00:00:00.000Z",
      "_count": {
        "flashcards": 21,
        "learnedFlashcards": 8
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### 3.2 Obter uma categoria por ID

```
GET /api/categories/:id
```

**Autenticação:** 🔒 JWT obrigatório

**Response: 200 OK**

```json
{
  "data": {
    "id": "cat-uuid-1",
    "name": "Redes e IoT",
    "color": "#2563EB",
    "icon": "globe-outline",
    "createdAt": "2025-01-10T00:00:00.000Z",
    "updatedAt": "2025-01-10T00:00:00.000Z",
    "_count": {
      "flashcards": 21,
      "learnedFlashcards": 8
    }
  }
}
```

**Erros possíveis:**
- `404 Not Found` — Categoria não encontrada
- `403 Forbidden` — Categoria não pertence ao usuário

---

### 3.3 Criar categoria

```
POST /api/categories
```

**Autenticação:** 🔒 JWT obrigatório

**Request Body:**

```json
{
  "name": "Matemática",
  "color": "#16A34A",
  "icon": "calculator-outline"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `name` | string | ✅ | Min 1, max 100, único por usuário |
| `color` | string | ✅ | Hex color válido (#RRGGBB) |
| `icon` | string | ❌ | Default: `book-outline` |

**Response: 201 Created**

```json
{
  "data": {
    "id": "new-cat-uuid",
    "name": "Matemática",
    "color": "#16A34A",
    "icon": "calculator-outline",
    "createdAt": "2025-06-14T10:00:00.000Z",
    "updatedAt": "2025-06-14T10:00:00.000Z"
  }
}
```

**Erros possíveis:**
- `409 Conflict` — Já existe categoria com esse nome para este usuário

---

### 3.4 Atualizar categoria

```
PATCH /api/categories/:id
```

**Autenticação:** 🔒 JWT obrigatório

**Request Body (parcial):**

```json
{
  "name": "Redes de Computadores",
  "color": "#0891B2"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `name` | string | ❌ | Min 1, max 100, único por usuário |
| `color` | string | ❌ | Hex color válido |
| `icon` | string | ❌ | Nome de ícone válido |

**Response: 200 OK**

```json
{
  "data": {
    "id": "cat-uuid-1",
    "name": "Redes de Computadores",
    "color": "#0891B2",
    "icon": "globe-outline",
    "createdAt": "2025-01-10T00:00:00.000Z",
    "updatedAt": "2025-06-14T11:00:00.000Z"
  }
}
```

**Erros possíveis:**
- `404 Not Found` / `403 Forbidden`
- `409 Conflict` — Nome duplicado

---

### 3.5 Deletar categoria

Deleta a categoria e todos os flashcards associados (cascade).

```
DELETE /api/categories/:id
```

**Autenticação:** 🔒 JWT obrigatório

**Response: 204 No Content**

**Erros possíveis:**
- `404 Not Found` / `403 Forbidden`

---

## 4. Flashcards

### 4.1 Listar flashcards de uma categoria

```
GET /api/categories/:categoryId/flashcards
```

**Autenticação:** 🔒 JWT obrigatório

**Query Parameters:**

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `page` | integer | 1 | Página atual |
| `limit` | integer | 50 | Itens por página (max 100) |
| `status` | string | `all` | Filtro: `all`, `learned`, `pending` |
| `sort` | string | `createdAt` | Campo de ordenação: `createdAt` |
| `order` | string | `desc` | Direção: `asc` ou `desc` |

**Response: 200 OK**

```json
{
  "data": [
    {
      "id": "fc-uuid-1",
      "categoryId": "cat-uuid-1",
      "front": "O Wi-Fi é baseado em qual padrão?",
      "back": "IEEE 802.11",
      "learned": false,
      "createdAt": "2025-01-11T00:00:00.000Z",
      "updatedAt": "2025-01-11T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 21,
    "totalPages": 1
  }
}
```

---

### 4.2 Listar flashcards para revisão

Retorna flashcards não aprendidos, opcionalmente filtrados por categoria.

```
GET /api/flashcards/review
```

**Autenticação:** 🔒 JWT obrigatório

**Query Parameters:**

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `categoryId` | UUID | — | Opcional. Filtra por categoria |

**Response: 200 OK**

```json
{
  "data": [
    {
      "id": "fc-uuid-1",
      "categoryId": "cat-uuid-1",
      "front": "O Wi-Fi é baseado em qual padrão?",
      "back": "IEEE 802.11",
      "learned": false,
      "createdAt": "2025-01-11T00:00:00.000Z"
    }
  ]
}
```

---

### 4.3 Criar flashcard

```
POST /api/categories/:categoryId/flashcards
```

**Autenticação:** 🔒 JWT obrigatório

**Request Body:**

```json
{
  "front": "Qual protocolo usa a porta 443?",
  "back": "HTTPS"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `front` | string | ✅ | Min 1, max 1000 |
| `back` | string | ✅ | Min 1, max 2000 |

**Response: 201 Created**

```json
{
  "data": {
    "id": "new-fc-uuid",
    "categoryId": "cat-uuid-1",
    "front": "Qual protocolo usa a porta 443?",
    "back": "HTTPS",
    "learned": false,
    "createdAt": "2025-06-14T10:00:00.000Z",
    "updatedAt": "2025-06-14T10:00:00.000Z"
  }
}
```

**Erros possíveis:**
- `404 Not Found` — Categoria não encontrada
- `403 Forbidden` — Categoria não pertence ao usuário

---

### 4.4 Atualizar flashcard

```
PATCH /api/flashcards/:id
```

**Autenticação:** 🔒 JWT obrigatório

**Request Body (parcial):**

```json
{
  "front": "Texto atualizado da frente",
  "back": "Texto atualizado do verso"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `front` | string | ❌ | Min 1, max 1000 |
| `back` | string | ❌ | Min 1, max 2000 |

**Response: 200 OK**

```json
{
  "data": {
    "id": "fc-uuid-1",
    "categoryId": "cat-uuid-1",
    "front": "Texto atualizado da frente",
    "back": "Texto atualizado do verso",
    "learned": false,
    "createdAt": "2025-01-11T00:00:00.000Z",
    "updatedAt": "2025-06-14T12:00:00.000Z"
  }
}
```

---

### 4.5 Marcar flashcard como aprendido / pendente

```
PATCH /api/flashcards/:id/learned
```

**Autenticação:** 🔒 JWT obrigatório

**Request Body:**

```json
{
  "learned": true
}
```

**Response: 200 OK**

```json
{
  "data": {
    "id": "fc-uuid-1",
    "learned": true,
    "updatedAt": "2025-06-14T12:00:00.000Z"
  }
}
```

---

### 4.6 Resetar status learned de uma categoria

Marca todos os flashcards de uma categoria (ou todos) como `learned: false`.

```
POST /api/flashcards/reset-learned
```

**Autenticação:** 🔒 JWT obrigatório

**Request Body:**

```json
{
  "categoryId": "cat-uuid-1"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `categoryId` | UUID | ❌ | Se omitido, reseta todos os cards do usuário |

**Response: 200 OK**

```json
{
  "data": {
    "message": "21 flashcards resetados",
    "count": 21
  }
}
```

---

### 4.7 Deletar flashcard

```
DELETE /api/flashcards/:id
```

**Autenticação:** 🔒 JWT obrigatório

**Response: 204 No Content**

**Erros possíveis:**
- `404 Not Found` / `403 Forbidden`

---

## 5. Review Sessions — Sessões de Revisão

### 5.1 Listar sessões do usuário

```
GET /api/review-sessions
```

**Autenticação:** 🔒 JWT obrigatório

**Query Parameters:**

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `categoryId` | UUID | — | Filtra por categoria |
| `page` | integer | 1 | Página |
| `limit` | integer | 20 | Itens por página |

**Response: 200 OK**

```json
{
  "data": [
    {
      "id": "rs-uuid-1",
      "categoryId": "cat-uuid-1",
      "date": "2025-02-01T00:00:00.000Z",
      "total": 21,
      "correct": 15,
      "createdAt": "2025-02-01T00:00:00.000Z",
      "category": {
        "id": "cat-uuid-1",
        "name": "Redes e IoT",
        "color": "#2563EB"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 5.2 Criar sessão de revisão

```
POST /api/review-sessions
```

**Autenticação:** 🔒 JWT obrigatório

**Request Body:**

```json
{
  "categoryId": "cat-uuid-1",
  "date": "2025-06-14T10:30:00.000Z",
  "total": 21,
  "correct": 18
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `categoryId` | UUID | ❌ | Null = revisão geral |
| `date` | string (ISO 8601) | ✅ | Data válida |
| `total` | integer | ✅ | >= 1 |
| `correct` | integer | ✅ | >= 0, <= total |

**Response: 201 Created**

```json
{
  "data": {
    "id": "new-rs-uuid",
    "userId": "user-uuid",
    "categoryId": "cat-uuid-1",
    "date": "2025-06-14T10:30:00.000Z",
    "total": 21,
    "correct": 18,
    "createdAt": "2025-06-14T10:30:00.000Z"
  }
}
```

---

## 6. Resumo de Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/api/auth/register` | ❌ | Registro de usuário |
| `POST` | `/api/auth/login` | ❌ | Login |
| `POST` | `/api/auth/refresh` | ❌ | Renovar access token |
| `POST` | `/api/auth/logout` | 🔒 | Logout (revogar refresh token) |
| `GET` | `/api/users/me` | 🔒 | Perfil do usuário |
| `PATCH` | `/api/users/me` | 🔒 | Atualizar perfil |
| `GET` | `/api/categories` | 🔒 | Listar categorias |
| `GET` | `/api/categories/:id` | 🔒 | Obter categoria |
| `POST` | `/api/categories` | 🔒 | Criar categoria |
| `PATCH` | `/api/categories/:id` | 🔒 | Atualizar categoria |
| `DELETE` | `/api/categories/:id` | 🔒 | Deletar categoria |
| `GET` | `/api/categories/:categoryId/flashcards` | 🔒 | Listar flashcards da categoria |
| `POST` | `/api/categories/:categoryId/flashcards` | 🔒 | Criar flashcard |
| `GET` | `/api/flashcards/review` | 🔒 | Cards para revisão |
| `PATCH` | `/api/flashcards/:id` | 🔒 | Atualizar flashcard |
| `PATCH` | `/api/flashcards/:id/learned` | 🔒 | Marcar learned/pendente |
| `POST` | `/api/flashcards/reset-learned` | 🔒 | Resetar learned |
| `DELETE` | `/api/flashcards/:id` | 🔒 | Deletar flashcard |
| `GET` | `/api/review-sessions` | 🔒 | Listar sessões |
| `POST` | `/api/review-sessions` | 🔒 | Criar sessão |

**Total: 20 endpoints**
