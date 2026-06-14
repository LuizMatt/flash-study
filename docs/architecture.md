# FlashStudy — Arquitetura do Backend

## 1. Visão Geral

O backend do FlashStudy é uma API REST construída sobre **Node.js + Express**, usando **PostgreSQL** como banco de dados relacional e **Prisma** como ORM. A autenticação é baseada em **JWT** com par access token / refresh token.

```
┌──────────────────────────────────────────────────────┐
│                  Mobile App (Expo)                    │
│           React Native + Expo Router                 │
└────────────────────┬─────────────────────────────────┘
                     │  HTTPS / JSON
                     ▼
┌──────────────────────────────────────────────────────┐
│              API Gateway / Reverse Proxy              │
│            (Nginx ou Cloud Load Balancer)             │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│              Node.js + Express Server                │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Middleware Layer                               │ │
│  │  ├─ cors                                       │ │
│  │  ├─ helmet (security headers)                  │ │
│  │  ├─ express.json() (body parser)               │ │
│  │  ├─ morgan / pino (logging)                    │ │
│  │  ├─ rate-limiter                               │ │
│  │  └─ authMiddleware (JWT verification)          │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Router Layer                                   │ │
│  │  ├─ /api/auth/*                                │ │
│  │  ├─ /api/users/*                               │ │
│  │  ├─ /api/categories/*                          │ │
│  │  ├─ /api/flashcards/*                          │ │
│  │  └─ /api/review-sessions/*                     │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Controller Layer                               │ │
│  │  Recebe req/res, valida input, chama service    │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Service Layer (Business Logic)                 │ │
│  │  Regras de negócio, orquestração               │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Repository Layer (Data Access)                 │ │
│  │  Prisma Client queries                          │ │
│  └─────────────────────────────────────────────────┘ │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│              PostgreSQL Database                      │
│  ├─ users                                            │
│  ├─ refresh_tokens                                   │
│  ├─ categories                                       │
│  ├─ flashcards                                       │
│  └─ review_sessions                                  │
└──────────────────────────────────────────────────────┘
```

---

## 2. Padrões Arquiteturais

### 2.1 Layered Architecture (Arquitetura em Camadas)

| Camada | Responsabilidade | Exemplo |
|--------|-----------------|---------|
| **Router** | Declarar rotas e métodos HTTP, montar middlewares por rota | `authRoutes.ts` |
| **Middleware** | Cross-cutting concerns (auth, logging, rate limit, error handling) | `authMiddleware.ts` |
| **Controller** | Receber request, validar input (Zod), chamar service, retornar response | `flashcardController.ts` |
| **Service** | Regras de negócio, orquestração entre repositórios | `flashcardService.ts` |
| **Repository** | Acesso a dados via Prisma Client | `flashcardRepository.ts` |

### 2.2 Princípios aplicados

- **Separação de responsabilidades** — cada camada tem uma única razão para mudar.
- **Dependency Injection implícita** — services recebem repositories via import; em evolução futura, pode-se usar um container DI.
- **DTO Pattern** — objetos de entrada (request) e saída (response) são tipados e validados com **Zod**.
- **Error Handling centralizado** — um middleware global de erro captura exceções e retorna respostas padronizadas.
- **Stateless Auth** — JWT no header `Authorization: Bearer <token>`, sem sessão server-side (refresh tokens são armazenados no banco).

### 2.3 Fluxo de autenticação

```
1. POST /api/auth/register  → cria user, retorna { accessToken, refreshToken }
2. POST /api/auth/login     → valida credenciais, retorna { accessToken, refreshToken }
3. POST /api/auth/refresh   → recebe refreshToken, retorna novo { accessToken, refreshToken }
4. POST /api/auth/logout    → invalida refreshToken no banco

accessToken:  JWT com exp curto (15min), contém { userId, email }
refreshToken: JWT com exp longo (7d), armazenado na tabela refresh_tokens
```

---

## 3. Estrutura de Pastas do Backend

```
backend/
├── prisma/
│   ├── schema.prisma              # Schema do Prisma (modelos, relações)
│   ├── migrations/                # Migrations geradas pelo Prisma
│   └── seed.ts                    # Seed de dados iniciais
│
├── src/
│   ├── server.ts                  # Bootstrap do Express (app.listen)
│   ├── app.ts                     # Configuração do Express (middlewares globais, rotas)
│   │
│   ├── config/
│   │   ├── env.ts                 # Variáveis de ambiente validadas com Zod
│   │   ├── database.ts            # Instância singleton do PrismaClient
│   │   └── auth.ts                # Constantes JWT (secret, expiração)
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.ts      # Verifica e decodifica JWT
│   │   ├── errorHandler.ts        # Global error handler
│   │   ├── validate.ts            # Middleware genérico de validação (Zod)
│   │   └── rateLimiter.ts         # Rate limiting
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   └── auth.schemas.ts    # Zod schemas (register, login, refresh)
│   │   │
│   │   ├── user/
│   │   │   ├── user.routes.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.repository.ts
│   │   │   └── user.schemas.ts
│   │   │
│   │   ├── category/
│   │   │   ├── category.routes.ts
│   │   │   ├── category.controller.ts
│   │   │   ├── category.service.ts
│   │   │   ├── category.repository.ts
│   │   │   └── category.schemas.ts
│   │   │
│   │   ├── flashcard/
│   │   │   ├── flashcard.routes.ts
│   │   │   ├── flashcard.controller.ts
│   │   │   ├── flashcard.service.ts
│   │   │   ├── flashcard.repository.ts
│   │   │   └── flashcard.schemas.ts
│   │   │
│   │   └── reviewSession/
│   │       ├── reviewSession.routes.ts
│   │       ├── reviewSession.controller.ts
│   │       ├── reviewSession.service.ts
│   │       ├── reviewSession.repository.ts
│   │       └── reviewSession.schemas.ts
│   │
│   ├── shared/
│   │   ├── errors/
│   │   │   ├── AppError.ts        # Classe base de erro de aplicação
│   │   │   ├── NotFoundError.ts
│   │   │   ├── UnauthorizedError.ts
│   │   │   ├── ForbiddenError.ts
│   │   │   └── ConflictError.ts
│   │   │
│   │   ├── types/
│   │   │   └── express.d.ts       # Extensão de tipos (req.userId)
│   │   │
│   │   └── utils/
│   │       ├── hashPassword.ts    # bcrypt helpers
│   │       └── generateToken.ts   # JWT sign helpers
│   │
│   └── routes/
│       └── index.ts               # Agrega todas as rotas dos módulos
│
├── tests/
│   ├── unit/
│   │   └── ...
│   ├── integration/
│   │   └── ...
│   └── setup.ts
│
├── .env                           # Variáveis de ambiente (não commitado)
├── .env.example                   # Template de env vars
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.ts
└── README.md
```

---

## 4. Stack Tecnológica

| Categoria | Tecnologia | Justificativa |
|-----------|-----------|---------------|
| Runtime | Node.js 20 LTS | Requisito do projeto |
| Framework HTTP | Express 4.x | Maduro, grande ecossistema |
| Linguagem | TypeScript 5.x | Type safety, melhor DX |
| ORM | Prisma 6.x | Type-safe queries, migrations, seeding |
| Banco de dados | PostgreSQL 16 | Requisito do projeto |
| Autenticação | jsonwebtoken + bcryptjs | JWT access/refresh token |
| Validação | Zod | Schema-first, integra com TS |
| Logging | pino | Alta performance, JSON structured |
| Segurança | helmet, cors, express-rate-limit | Headers, CORS, rate limiting |
| Testes | Jest + Supertest | Unitários + integração |
| Linting | ESLint + Prettier | Consistência de código |

---

## 5. Variáveis de Ambiente

```env
# Servidor
PORT=3333
NODE_ENV=development

# Banco de dados
DATABASE_URL=postgresql://user:password@localhost:5432/flashstudy?schema=public

# JWT
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:8081
```

---

## 6. Convenções

| Item | Convenção |
|------|-----------|
| Nomeação de arquivos | `kebab-case` ou `camelCase` por módulo (ex: `auth.controller.ts`) |
| Nomeação de rotas | `kebab-case` plural (ex: `/api/review-sessions`) |
| Respostas de sucesso | `{ data: T }` com status 200/201 |
| Respostas de erro | `{ error: { message: string, code?: string } }` com status HTTP adequado |
| IDs | UUID v4 gerado pelo PostgreSQL (`gen_random_uuid()`) |
| Timestamps | `createdAt`, `updatedAt` em todas as tabelas, gerenciados pelo Prisma (`@default(now())`, `@updatedAt`) |
| Soft delete | Não utilizado inicialmente; pode ser adicionado via campo `deletedAt` |
