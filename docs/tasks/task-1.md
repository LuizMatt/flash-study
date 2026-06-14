# Tarefa 1: Setup do Projeto e Banco de Dados (PostgreSQL + Prisma)

## Função da Task
Esta tarefa tem como função estabelecer toda a base infraestrutural do backend, criando um ambiente de desenvolvimento robusto, tipado e pronto para comunicação com o banco de dados. Sem esta base, não é possível desenvolver nenhuma das regras de negócio subsequentes, pois ela define a estrutura do compilador, a conexão persistente e a inicialização da API.

## Objetivos das Coisas (Por que cada item existe?)

* **`backend/` (Inicialização)**: Criar uma pasta separada na raiz do projeto para isolar as dependências do servidor das dependências do app Expo React Native, evitando conflitos de pacotes Node.
* **Dependências de Produção**:
  * `express`: Framework HTTP minimalista para lidar com requisições, rotas e middlewares.
  * `prisma` & `@prisma/client`: ORM moderno para manipulação type-safe do banco PostgreSQL.
  * `zod`: Validador de dados schema-first para garantir integridade dos inputs recebidos.
  * `helmet`: Adiciona headers de segurança HTTP para mitigar ataques comuns.
  * `cors`: Permite que o app Expo em execução local/dispositivo acesse a API do backend sem bloqueios de segurança de origem.
  * `pino` & `pino-pretty`: Logging de altíssima performance para rastrear fluxos e depurar erros no terminal.
  * `express-rate-limit`: Protege a API contra ataques de brute-force e Denial of Service (DoS).
* **Dependências de Desenvolvimento**:
  * `typescript`: Adiciona tipagem estática ao JavaScript para detectar erros antes da execução.
  * `tsx`: Permite executar arquivos TypeScript diretamente em tempo de desenvolvimento sem necessidade de compilação prévia manual.
  * `jest` & `ts-jest` & `supertest`: Suite para testes de unidade e testes de integração de rotas sem necessidade de subir o servidor de rede real.
* **`tsconfig.json`**: Configura o compilador TypeScript com regras rígidas (`strict: true`), obrigando tipagens corretas e evitando o uso de `any` implícito, garantindo robustez de tipos.
* **ESLint & Prettier**: Automação da qualidade de código. O ESLint detecta más práticas e bugs estáticos; o Prettier força um padrão visual consistente de formatação (ponto e vírgula, aspas, quebras de linha).
* **`.env` e `src/config/env.ts`**:
  * `.env`: Guarda variáveis de ambiente sensíveis (segredos JWT, credenciais de banco) locais. Nunca deve ser enviado ao Git.
  * `src/config/env.ts`: Valida no startup se as variáveis do `.env` estão corretas usando Zod. Se faltar alguma configuração essencial (como `DATABASE_URL` ou `JWT_ACCESS_SECRET`), a API falha na hora (Fail Fast) com mensagens explicativas, em vez de dar erro em runtime posteriormente.
* **`prisma/schema.prisma`**: Coração da persistência. Define todas as tabelas (User, RefreshToken, Category, Flashcard, ReviewSession) com UUIDs v4, relações (ex: um flashcard obrigatoriamente pertence a uma categoria) e chaves estrangeiras. Mapeia propriedades camelCase para colunas snake_case no banco PostgreSQL.
* **`prisma/seed.ts`**: Script para popular o banco de dados inicial com dados fictícios estruturados (um usuário padrão, algumas categorias pré-definidas e flashcards de teste). Evita que o desenvolvedor precise cadastrar dados na mão toda vez que resetar o banco de dados.
* **`src/app.ts` vs `src/server.ts`**:
  * `src/app.ts`: Configura o Express, injeta os middlewares globais e as rotas. Não inicia escuta de rede. Isso facilita rodar testes de integração usando Supertest sem abrir conexões de rede ativas.
  * `src/server.ts`: Importa a instância configurada do `app` e roda o `app.listen()` na porta de rede desejada, conectando de fato a API à rede local.
* **`GET /health`**: Um endpoint de diagnóstico rápido (healthcheck) útil para que balanceadores de carga, plataformas de deploy ou o time de infraestrutura saibam instantaneamente se a API está online e respondendo.

---

## Checklist de Execução

- [ ] 1.1 Criar pasta `backend/` na raiz do projeto e inicializar com `npm init -y`.
- [ ] 1.2 Instalar dependências de produção listadas no plano.
- [ ] 1.3 Instalar dependências de dev listadas no plano.
- [ ] 1.4 Configurar o `tsconfig.json` do TypeScript com regras rígidas (`strict`).
- [ ] 1.5 Configurar ferramentas de linting e formatação (ESLint + Prettier).
- [ ] 1.6 Criar os arquivos `.env` e `.env.example` com as variáveis necessárias.
- [ ] 1.7 Criar `src/config/env.ts` para validação em tempo de execução das variáveis com Zod.
- [ ] 1.8 Inicializar a estrutura do Prisma ORM (`npx prisma init`).
- [ ] 1.9 Construir a modelagem de entidades no `prisma/schema.prisma` com todas as tabelas.
- [ ] 1.10 Configurar a URL de conexão local com o banco de dados PostgreSQL.
- [ ] 1.11 Gerar e executar a migration inicial (`npx prisma migrate dev --name init`).
- [ ] 1.12 Criar singleton do PrismaClient em `src/config/database.ts` para evitar conexões duplicadas.
- [ ] 1.13 Desenvolver o script de semente (`prisma/seed.ts`) com dados de teste.
- [ ] 1.14 Criar a aplicação Express base (`src/app.ts`) e o arquivo de inicialização do servidor (`src/server.ts`).
- [ ] 1.15 Configurar os scripts executáveis no `package.json` (`dev`, `build`, `start`, `lint`).
- [ ] 1.16 Desenvolver e testar o endpoint de healthcheck (`GET /health`).
