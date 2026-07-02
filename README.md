# FlashStudy

Aplicativo mobile e web desenvolvido para auxiliar usuários no processo de aprendizagem ativa e repetição espaçada através de flashcards interativos. O sistema permite organizar conteúdos em categorias personalizadas, criar cartões de estudo, realizar sessões interativas de revisão e acompanhar métricas detalhadas de progresso.

---

## Informações Acadêmicas e Equipe

**Competência:** Desenvolver Aplicativos para Dispositivos Móveis e IoT  
**Local / Período:** Campina Grande/PB — 2026.1  

**Desenvolvedores:**
- Raffael Queiroga
- Rodrigo Lucas Oliveira Coelho
- Laerte Gomes Ferreira
- Maria Eduarda Almeida Ramos
- Luiz Matheus Rodrigues Lins
- Edson Kelvin Laurindo Araujo

---

## Sumário
1. [Objetivo do Projeto](#objetivo-do-projeto)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Modelo de Dados](#modelo-de-dados)
6. [Casos de Uso](#casos-de-uso)
7. [Segurança e Autenticação](#segurança-e-autenticação)
8. [Como Executar o Projeto via Docker](#como-executar-o-projeto-via-docker)

---

## Objetivo do Projeto

Fornecer uma plataforma ágil, responsiva e intuitiva para otimização do estudo de conteúdos diversos, possibilitando:
- Cadastro e autenticação segura de usuários.
- Gestão completa (CRUD) de categorias temáticas de estudo com personalização visual (cores e ícones).
- Gestão completa de flashcards (frente, verso e status de aprendizado).
- Execução de sessões de revisão dinâmica com animações fluidas em 3D.
- Registro automático de sessões e acompanhamento gráfico do progresso de aprendizagem.

---

## Arquitetura do Sistema

O projeto adota uma arquitetura Full-Stack modular, promovendo desacoplamento, escalabilidade e facilidade de manutenção entre a interface do cliente e os serviços de backend.

```
+-------------------------------------------------------------+
|              Frontend Mobile & Web (Expo / React Native)    |
|   Gerenciamento de Estado (Context API) | Navegação (Router)|
+-------------------------------------------------------------+
                               |
                               | HTTPS / REST API (Axios + Interceptor)
                               v
+-------------------------------------------------------------+
|              Backend Server (Node.js / Express)             |
|    Middlewares de Segurança | Validação Zod | Controllers   |
+-------------------------------------------------------------+
                               |
                               | Prisma ORM
                               v
+-------------------------------------------------------------+
|              Banco de Dados Relacional (PostgreSQL)         |
+-------------------------------------------------------------+
```

### Camadas do Sistema
- **Interface do Usuário:** Desenvolvida em React Native via Expo, compatível com plataformas mobile (Android/iOS) e navegadores Web.
- **Gerenciamento de Estado:** Centralizado via Context API (`AuthContext` e `AppContext`), sincronizado remotamente utilizando Axios.
- **Camada de Aplicação:** API REST reativa e tipada construída em Node.js com Express.
- **Persistência:** Banco de dados PostgreSQL com modelagem e migrações controladas pelo Prisma ORM.

---

## Tecnologias Utilizadas

| Tecnologia | Finalidade |
| :--- | :--- |
| **React Native / Expo** | Framework para desenvolvimento da interface mobile e web |
| **Expo Router** | Navegação baseada em arquivos e rotas protegidas |
| **React Native Reanimated** | Animações complexas rodando nativamente na UI thread (efeito flip 3D a 60fps) |
| **Node.js / Express** | Ambiente de execução e framework para a REST API |
| **TypeScript** | Tipagem estática end-to-end garantindo confiabilidade no código |
| **PostgreSQL** | Banco de dados relacional robusto para armazenamento de dados |
| **Prisma ORM** | Mapeamento objeto-relacional, tipagem de queries e controle de migrações |
| **Zod** | Validação rigorosa de esquemas de dados de entrada na API |
| **JSON Web Tokens (JWT)** | Autenticação stateless de requisições com rotação de Refresh Tokens |
| **Docker & Docker Compose** | Orquestração e conteinerização completa do ecossistema de serviços |

---

## Estrutura do Projeto

```
flash-study/
├── docker-compose.yml       # Orquestração raiz (Banco, API e Frontend Web)
├── backend/
│   ├── prisma/              # Schema do banco de dados e migrações SQL
│   └── src/
│       ├── config/          # Configurações de ambiente e banco de dados
│       ├── middlewares/     # Validação Zod, verificação JWT e tratamento de erros
│       ├── modules/         # Domínios da aplicação (auth, category, flashcard, reviewSession)
│       └── shared/          # Utilitários e classes de exceção customizadas
└── frontend/
    ├── app/                 # Rotas do Expo Router ((auth), (tabs), category, review)
    └── src/
        ├── components/      # Componentes visuais reutilizáveis (FlashCard, Modals, Lists)
        ├── context/         # Provedores de estado global (AuthContext, AppContext)
        ├── services/        # Cliente HTTP Axios com interceptores de autenticação
        └── types/           # Interfaces TypeScript globais
```

---

## Modelo de Dados

As principais entidades modeladas no banco de dados relacional compreendem:

- **User:** Armazena credenciais e vincula todas as categorias, sessões e tokens.
- **RefreshToken:** Controla a validade de sessões com suporte a revogação em cascata e rotação contínua.
- **Category:** Entidade agrupadora de flashcards, com metadados visuais (`color`, `icon`).
- **Flashcard:** Contém o conteúdo educacional (`front`, `back`) e flag de verificação (`learned`).
- **ReviewSession:** Histórico analítico de revisões executadas contendo métricas de acerto e volume.

---

## Casos de Uso

| Código | Caso de Uso | Descrição Resumida |
| :--- | :--- | :--- |
| **UC-01** | Autenticar Usuário | Acesso seguro utilizando e-mail e senha validados no servidor. |
| **UC-02** | Registrar Usuário | Criação de conta com verificação de e-mail único e hash de senha Bcrypt. |
| **UC-03** | Visualizar Categorias | Listagem em grid das categorias cadastradas com métricas em tempo real. |
| **UC-04** | Criar Categoria | Cadastro de nova disciplina/tópico com escolha de cor e ícone representativo. |
| **UC-05** | Criar Flashcard | Adição de cartão de estudo vinculando frente e verso a uma categoria. |
| **UC-06** | Revisar Flashcards | Sessão interativa de estudo com animação de virada 3D e ações de resposta. |
| **UC-07** | Marcar como Aprendido | Sinalização do cartão como dominado, removendo-o da fila pendente padrão. |
| **UC-08** | Visualizar Progresso | Acompanhamento analítico com barras de progresso e contagem de aproveitamento. |
| **UC-09** | Registrar Sessão | Gravação automática do desempenho após a conclusão de um ciclo de revisão. |
| **UC-10** | Excluir Flashcard | Remoção permanente de cartões individuais diretamente pela lista da categoria. |
| **UC-11** | Atualizar Categoria | Edição dos atributos conceituais ou visuais (nome, cor, ícone) da categoria. |
| **UC-12** | Deletar Categoria | Exclusão de categoria com remoção em cascata dos flashcards vinculados. |
| **UC-13** | Editar Flashcard | Modificação textual do conteúdo de perguntas e respostas existentes. |
| **UC-14** | Deletar Flashcard | Alternativa de remoção individual para manutenção da base de cartões. |
| **UC-15** | Logout / Refresh Token | Invalidação explícita de sessão ou renovação silenciosa via interceptor HTTP. |

---

## Segurança e Autenticação

A arquitetura implementa práticas consolidadas de segurança:
1. **Autenticação Stateless (JWT):** O servidor valida requisições sem dependência de sessão em memória, utilizando tokens de curta duração (`AccessToken`).
2. **Rotação de Tokens (Refresh Rotation):** Cada uso do `RefreshToken` gera um novo par de chaves e invalida o anterior, mitigando riscos de ataques de repetição (*Replay Attacks*).
3. **Interceptação Automática:** O cliente HTTP no frontend detecta respostas `401 Unauthorized`, solicita de forma transparente a renovação da sessão via `/api/auth/refresh` e reexecuta a requisição original.
4. **Validação Estrita de Inputs:** Todas as entradas de dados na API são validadas e sanitizadas com esquemas rigorosos da biblioteca **Zod**.

---

## Como Executar o Projeto via Docker

O projeto dispõe de configuração completa e automatizada para conteinerização com Docker Compose na raiz do repositório.

### Pré-requisitos
- **Docker** e **Docker Compose** instalados no sistema operacional.

### Passo a Passo

1. Clone o repositório e acesse a raiz do projeto:
   ```bash
   cd flash-study
   ```

2. Crie o arquivo de variáveis de ambiente a partir do exemplo fornecido:
   ```bash
   cp .env.example .env
   ```

3. Suba todos os serviços em segundo plano:
   ```bash
   docker compose up --build -d
   ```

4. Verifique o status dos contêineres:
   ```bash
   docker compose ps
   ```

O ambiente executará automaticamente as migrações do banco de dados e disponibilizará os seguintes serviços:
- **Frontend Web:** Acessível via navegador em `http://localhost:8081`
- **Backend API:** Acessível em `http://localhost:3333`
- **Banco de Dados PostgreSQL:** Porta interna mapeada em `localhost:5433`
