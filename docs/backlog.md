# FlashStudy — Backlog Técnico

Backlog priorizado do zero ao deploy. Cada tarefa tem uma estimativa de esforço e suas dependências.

> **Legenda de esforço:** 🟢 Pequeno (< 2h) | 🟡 Médio (2-4h) | 🔴 Grande (> 4h)

---

## Fase 1 — Setup do Projeto

Objetivo: ter o projeto Node.js rodando com TypeScript, Express e Prisma conectando no PostgreSQL.

| # | Tarefa | Esforço | Dependência |
|---|--------|---------|-------------|
| 1.1 | Criar pasta `backend/` e inicializar com `npm init` | 🟢 | — |
| 1.2 | Instalar dependências de produção: `express`, `prisma`, `@prisma/client`, `jsonwebtoken`, `bcryptjs`, `zod`, `cors`, `helmet`, `pino`, `pino-pretty`, `express-rate-limit`, `dotenv` | 🟢 | 1.1 |
| 1.3 | Instalar dependências de dev: `typescript`, `tsx`, `@types/express`, `@types/jsonwebtoken`, `@types/bcryptjs`, `@types/cors`, `eslint`, `prettier`, `jest`, `ts-jest`, `supertest`, `@types/supertest` | 🟢 | 1.1 |
| 1.4 | Configurar `tsconfig.json` (strict, paths, outDir) | 🟢 | 1.3 |
| 1.5 | Configurar ESLint + Prettier | 🟢 | 1.3 |
| 1.6 | Criar `.env.example` e `.env` com variáveis de ambiente | 🟢 | 1.1 |
| 1.7 | Criar `src/config/env.ts` — validação de env vars com Zod | 🟢 | 1.2, 1.4 |
| 1.8 | Criar `src/app.ts` — configuração base do Express (cors, helmet, json, morgan) | 🟡 | 1.7 |
| 1.9 | Criar `src/server.ts` — bootstrap com `app.listen()` | 🟢 | 1.8 |
| 1.10 | Adicionar scripts no `package.json`: `dev`, `build`, `start`, `lint` | 🟢 | 1.9 |
| 1.11 | Testar que o servidor sobe e responde em `GET /health` | 🟢 | 1.9 |

**Entregável:** Servidor Express rodando em `localhost:3333` com healthcheck.

---

## Fase 2 — Banco de Dados e Prisma

Objetivo: modelar o banco, gerar migrations e ter o Prisma Client pronto.

| # | Tarefa | Esforço | Dependência |
|---|--------|---------|-------------|
| 2.1 | Inicializar Prisma (`npx prisma init`) | 🟢 | 1.2 |
| 2.2 | Criar `prisma/schema.prisma` com todos os modelos (User, RefreshToken, Category, Flashcard, ReviewSession) | 🟡 | 2.1 |
| 2.3 | Configurar `DATABASE_URL` apontando para PostgreSQL local | 🟢 | 2.1 |
| 2.4 | Gerar primeira migration (`npx prisma migrate dev --name init`) | 🟢 | 2.2, 2.3 |
| 2.5 | Criar `src/config/database.ts` — instância singleton do PrismaClient | 🟢 | 2.4 |
| 2.6 | Criar `prisma/seed.ts` com dados de teste (usuário, categorias, flashcards) | 🟡 | 2.4 |
| 2.7 | Validar seed com `npx prisma db seed` | 🟢 | 2.6 |

**Entregável:** Banco PostgreSQL com todas as tabelas criadas e dados de seed.

---

## Fase 3 — Infraestrutura Compartilhada

Objetivo: criar os building blocks reutilizados por todos os módulos.

| # | Tarefa | Esforço | Dependência |
|---|--------|---------|-------------|
| 3.1 | Criar `src/shared/errors/` — AppError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError | 🟡 | 1.8 |
| 3.2 | Criar `src/middlewares/errorHandler.ts` — global error handling middleware | 🟡 | 3.1 |
| 3.3 | Criar `src/middlewares/validate.ts` — middleware genérico de validação com Zod | 🟢 | 1.2 |
| 3.4 | Criar `src/shared/utils/hashPassword.ts` — funções `hashPassword()` e `comparePassword()` com bcrypt | 🟢 | 1.2 |
| 3.5 | Criar `src/shared/utils/generateToken.ts` — funções `generateAccessToken()`, `generateRefreshToken()`, `verifyToken()` | 🟡 | 1.2 |
| 3.6 | Criar `src/config/auth.ts` — constantes JWT (secrets, expiração) | 🟢 | 1.7 |
| 3.7 | Criar `src/middlewares/authMiddleware.ts` — verificar JWT e injetar `req.userId` | 🟡 | 3.5, 3.6 |
| 3.8 | Criar `src/shared/types/express.d.ts` — declaração de tipo estendido para Request | 🟢 | 3.7 |
| 3.9 | Criar `src/middlewares/rateLimiter.ts` — rate limiting para rotas de auth | 🟢 | 1.2 |
| 3.10 | Criar `src/routes/index.ts` — agregador de rotas | 🟢 | 1.8 |

**Entregável:** Middlewares e utilities prontos para uso nos módulos.

---

## Fase 4 — Módulo de Autenticação

Objetivo: registro, login, refresh token e logout funcionais.

| # | Tarefa | Esforço | Dependência |
|---|--------|---------|-------------|
| 4.1 | Criar `src/modules/auth/auth.schemas.ts` — schemas Zod (registerSchema, loginSchema, refreshSchema) | 🟢 | 3.3 |
| 4.2 | Criar `src/modules/auth/auth.repository.ts` — CRUD de User e RefreshToken via Prisma | 🟡 | 2.5 |
| 4.3 | Criar `src/modules/auth/auth.service.ts` — lógica de register, login, refresh, logout | 🔴 | 3.4, 3.5, 4.2 |
| 4.4 | Criar `src/modules/auth/auth.controller.ts` — handlers HTTP | 🟡 | 4.3 |
| 4.5 | Criar `src/modules/auth/auth.routes.ts` — declarar rotas POST /register, /login, /refresh, /logout | 🟢 | 4.4, 3.7 |
| 4.6 | Registrar rotas de auth no agregador | 🟢 | 4.5, 3.10 |
| 4.7 | Testar fluxo completo: register → login → refresh → logout (manual com REST client) | 🟡 | 4.6 |
| 4.8 | Escrever testes unitários para auth.service | 🟡 | 4.3 |
| 4.9 | Escrever testes de integração para rotas de auth | 🟡 | 4.7 |

**Entregável:** Autenticação JWT completa com rotação de refresh token.

---

## Fase 5 — Módulo de Usuário

Objetivo: perfil do usuário (GET e PATCH /me).

| # | Tarefa | Esforço | Dependência |
|---|--------|---------|-------------|
| 5.1 | Criar `src/modules/user/user.schemas.ts` — updateProfileSchema | 🟢 | 3.3 |
| 5.2 | Criar `src/modules/user/user.repository.ts` — findById, update | 🟢 | 2.5 |
| 5.3 | Criar `src/modules/user/user.service.ts` — getProfile (com stats), updateProfile | 🟡 | 5.2 |
| 5.4 | Criar `src/modules/user/user.controller.ts` | 🟢 | 5.3 |
| 5.5 | Criar `src/modules/user/user.routes.ts` — GET/PATCH /me (protegidas) | 🟢 | 5.4, 3.7 |
| 5.6 | Registrar rotas e testar | 🟢 | 5.5 |

**Entregável:** Endpoints de perfil do usuário.

---

## Fase 6 — Módulo de Categorias

Objetivo: CRUD completo de categorias com isolamento por usuário.

| # | Tarefa | Esforço | Dependência |
|---|--------|---------|-------------|
| 6.1 | Criar `src/modules/category/category.schemas.ts` — createSchema, updateSchema, listQuerySchema | 🟢 | 3.3 |
| 6.2 | Criar `src/modules/category/category.repository.ts` — findAll, findById, create, update, delete (com contagens) | 🟡 | 2.5 |
| 6.3 | Criar `src/modules/category/category.service.ts` — lógica de negócio (verificar unicidade de nome, ownership) | 🟡 | 6.2 |
| 6.4 | Criar `src/modules/category/category.controller.ts` | 🟡 | 6.3 |
| 6.5 | Criar `src/modules/category/category.routes.ts` — GET, POST, PATCH, DELETE (todas protegidas) | 🟢 | 6.4, 3.7 |
| 6.6 | Registrar rotas e testar manualmente | 🟢 | 6.5 |
| 6.7 | Testes unitários do service | 🟡 | 6.3 |
| 6.8 | Testes de integração das rotas | 🟡 | 6.6 |

**Entregável:** CRUD de categorias protegido por JWT com isolamento por usuário.

---

## Fase 7 — Módulo de Flashcards

Objetivo: CRUD de flashcards + endpoints específicos (review, mark learned, reset).

| # | Tarefa | Esforço | Dependência |
|---|--------|---------|-------------|
| 7.1 | Criar `src/modules/flashcard/flashcard.schemas.ts` — create, update, markLearned, resetLearned, listQuery, reviewQuery | 🟡 | 3.3 |
| 7.2 | Criar `src/modules/flashcard/flashcard.repository.ts` — CRUD + queries específicas (por categoria, por status, update em batch) | 🟡 | 2.5 |
| 7.3 | Criar `src/modules/flashcard/flashcard.service.ts` — lógica com verificação de ownership via category | 🔴 | 7.2, 6.2 |
| 7.4 | Criar `src/modules/flashcard/flashcard.controller.ts` | 🟡 | 7.3 |
| 7.5 | Criar `src/modules/flashcard/flashcard.routes.ts` — todas as rotas (nested em categories + standalone) | 🟡 | 7.4, 3.7 |
| 7.6 | Registrar rotas e testar manualmente | 🟢 | 7.5 |
| 7.7 | Testes unitários | 🟡 | 7.3 |
| 7.8 | Testes de integração | 🟡 | 7.6 |

**Entregável:** CRUD de flashcards + endpoints de revisão.

---

## Fase 8 — Módulo de Sessões de Revisão

Objetivo: criação e listagem de sessões de revisão.

| # | Tarefa | Esforço | Dependência |
|---|--------|---------|-------------|
| 8.1 | Criar `src/modules/reviewSession/reviewSession.schemas.ts` — createSchema, listQuerySchema | 🟢 | 3.3 |
| 8.2 | Criar `src/modules/reviewSession/reviewSession.repository.ts` — create, findAll | 🟢 | 2.5 |
| 8.3 | Criar `src/modules/reviewSession/reviewSession.service.ts` | 🟡 | 8.2 |
| 8.4 | Criar `src/modules/reviewSession/reviewSession.controller.ts` | 🟢 | 8.3 |
| 8.5 | Criar `src/modules/reviewSession/reviewSession.routes.ts` | 🟢 | 8.4, 3.7 |
| 8.6 | Registrar rotas e testar | 🟢 | 8.5 |
| 8.7 | Testes | 🟡 | 8.3 |

**Entregável:** Endpoints de sessões de revisão.

---

## Fase 9 — Integração Frontend ↔ Backend

Objetivo: conectar o app Expo ao backend real, substituindo mocks.

| # | Tarefa | Esforço | Dependência |
|---|--------|---------|-------------|
| 9.1 | Criar camada de API client no frontend (`src/services/api.ts`) com Axios ou fetch wrapper | 🟡 | Fases 4-8 |
| 9.2 | Implementar interceptor de refresh token automático no API client | 🟡 | 9.1 |
| 9.3 | Armazenar tokens com `expo-secure-store` | 🟡 | 9.1 |
| 9.4 | Refatorar `AuthContext.tsx` para usar API real em vez de `serviceMock.ts` | 🟡 | 9.1, 9.3 |
| 9.5 | Refatorar `AppReducer.ts` / `AppContext.tsx` para buscar dados da API (ou migrar para React Query) | 🔴 | 9.1 |
| 9.6 | Adaptar tela de login para tratar loading states e erros da API | 🟡 | 9.4 |
| 9.7 | Adaptar tela de registro | 🟡 | 9.4 |
| 9.8 | Adaptar tela de categorias para listar da API | 🟡 | 9.5 |
| 9.9 | Adaptar tela de criação de flashcard para POST na API | 🟡 | 9.5 |
| 9.10 | Adaptar detalhe de categoria para buscar flashcards da API | 🟡 | 9.5 |
| 9.11 | Adaptar ReviewFlow para usar API (mark learned, create session) | 🟡 | 9.5 |
| 9.12 | Adaptar tela de progresso para buscar dados da API | 🟡 | 9.5 |
| 9.13 | Remover `mockData.ts` e `serviceMock.ts` | 🟢 | 9.4-9.12 |
| 9.14 | Teste end-to-end de todas as funcionalidades | 🔴 | 9.13 |

**Entregável:** App funcionando integralmente com o backend real.

---

## Fase 10 — Qualidade e Segurança

Objetivo: hardening, testes finais e documentação.

| # | Tarefa | Esforço | Dependência |
|---|--------|---------|-------------|
| 10.1 | Configurar Jest (`jest.config.ts`) e setup de testes | 🟡 | 1.3 |
| 10.2 | Atingir cobertura mínima de 80% nos services | 🔴 | Fases 4-8 |
| 10.3 | Implementar limpeza automática de refresh tokens expirados (cron job ou query scheduled) | 🟡 | 4.2 |
| 10.4 | Adicionar rate limiting específico em rotas de auth (5 req/min por IP) | 🟢 | 3.9 |
| 10.5 | Validar que nenhum endpoint retorna `passwordHash` | 🟢 | Fases 4-8 |
| 10.6 | Adicionar logging estruturado em todas as camadas | 🟡 | 1.2 |
| 10.7 | Criar README.md do backend com instruções de setup | 🟡 | — |

**Entregável:** Backend seguro, testado e documentado.

---

## Fase 11 — Deploy

Objetivo: colocar o backend em produção.

| # | Tarefa | Esforço | Dependência |
|---|--------|---------|-------------|
| 11.1 | Criar `Dockerfile` e `docker-compose.yml` (Node + PostgreSQL) | 🟡 | Fase 10 |
| 11.2 | Configurar variáveis de ambiente de produção | 🟢 | 11.1 |
| 11.3 | Configurar CI/CD (GitHub Actions): lint, test, build, deploy | 🔴 | 11.1 |
| 11.4 | Provisionar banco PostgreSQL em cloud (Railway, Supabase, Neon, ou AWS RDS) | 🟡 | — |
| 11.5 | Deploy do backend (Railway, Render, Fly.io ou AWS) | 🟡 | 11.1, 11.4 |
| 11.6 | Configurar domínio + HTTPS (se aplicável) | 🟡 | 11.5 |
| 11.7 | Executar migrations em produção (`prisma migrate deploy`) | 🟢 | 11.5 |
| 11.8 | Atualizar `API_BASE_URL` no frontend para apontar para produção | 🟢 | 11.5 |
| 11.9 | Teste de fumaça em produção | 🟡 | 11.7, 11.8 |
| 11.10 | Monitoramento básico (healthcheck + alertas de erro) | 🟡 | 11.5 |

**Entregável:** Backend em produção, acessível pelo app mobile.

---

## Resumo de Fases

| Fase | Descrição | Tarefas | Estimativa |
|------|-----------|---------|------------|
| 1 | Setup do Projeto | 11 | ~4h |
| 2 | Banco de Dados e Prisma | 7 | ~4h |
| 3 | Infraestrutura Compartilhada | 10 | ~6h |
| 4 | Módulo de Autenticação | 9 | ~10h |
| 5 | Módulo de Usuário | 6 | ~3h |
| 6 | Módulo de Categorias | 8 | ~8h |
| 7 | Módulo de Flashcards | 8 | ~10h |
| 8 | Módulo de Sessões de Revisão | 7 | ~4h |
| 9 | Integração Frontend ↔ Backend | 14 | ~16h |
| 10 | Qualidade e Segurança | 7 | ~8h |
| 11 | Deploy | 10 | ~10h |
| **Total** | | **97 tarefas** | **~83h** |

---

## Ordem de Execução Sugerida

```
Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6 → Fase 7 → Fase 8
                                                                      ↓
                                          Fase 10 ← ─ ─ ─ ─ ─ ─ ─ ─ ┘
                                             ↓
                                          Fase 9
                                             ↓
                                          Fase 11
```

> **Nota:** A Fase 9 (integração) pode começar em paralelo a partir da Fase 4, integrando módulo a módulo conforme são concluídos. A Fase 10 pode ser feita de forma contínua ao longo das Fases 4-8.
