# Tarefa 3: Módulo de Autenticação Completo

## Função da Task
Esta tarefa tem como função implementar as barreiras de controle de acesso e identificação dos usuários na API. Através deste módulo de autenticação, o backend passa a ser capaz de registrar novos usuários de forma segura, validar credenciais no login, emitir tokens JWT que atestam a identidade e gerenciar ciclos de vida de tokens através da tabela de Refresh Tokens (permitindo reconexões transparentes e logout seguro). É a garantia de que as informações de cada usuário estarão protegidas contra acessos de terceiros.

## Objetivos das Coisas (Por que cada item existe?)

* **Schemas de Autenticação (`src/modules/auth/auth.schemas.ts`)**: Define as regras estruturais e de validação dos dados de entrada.
  * `registerSchema`: Exige nome preenchido, e-mail sintaticamente válido e senha forte (mínimo de caracteres).
  * `loginSchema`: Exige e-mail e senha.
  * `refreshSchema`: Exige a string do refresh token para validação.
  * *Objetivo*: Impedir requests malformados de gastarem processamento nas camadas de banco e regras de negócio.
* **Repositório de Autenticação (`src/modules/auth/auth.repository.ts`)**: Isola o acesso à base de dados. Contém métodos de busca de usuário por e-mail, criação do registro de usuário, inserção de Refresh Token no banco, busca de token ativo e exclusão de token no logout. Centralizar essas queries facilita migrações ou testes futuros com mocks de banco de dados.
* **Serviço de Autenticação (`src/modules/auth/auth.service.ts`)**: Onde reside toda a lógica de negócio de segurança:
  * **Registro**: Garante que o e-mail não esteja duplicado (lançando `ConflictError`), encripta a senha e salva o registro.
  * **Login**: Localiza o usuário, compara a senha e gera os tokens se as credenciais estiverem corretas.
  * **Refresh**: Implementa a rotação de refresh token (Token Rotation). Quando o app solicita um novo access token usando um refresh token, o backend invalida o refresh token antigo no banco e gera um par de tokens totalmente novo, mitigando riscos de roubo ou clonagem de tokens.
  * **Logout**: Remove o refresh token do banco de dados, garantindo que o dispositivo deslogado não consiga mais renovar o acesso.
* **Controlador de Autenticação (`src/modules/auth/auth.controller.ts`)**: Responsável por traduzir requisições HTTP em comandos para o serviço de autenticação e retornar as respostas formatadas em JSON com os códigos HTTP semânticos correspondentes (201 Created para registros com sucesso, 200 OK para login e refresh).
* **Roteador de Autenticação (`src/modules/auth/auth.routes.ts`)**: Expõe os endpoints `POST /register`, `POST /login`, `POST /refresh` e `POST /logout`. Acopla o middleware `validate` a cada rota para triagem de inputs e protege a rota de logout com o middleware de autenticação.
* **Testes Unitários (`tests/unit/auth.service.test.ts`)**: Validam a lógica isolada do `AuthService` usando mocks do banco de dados. Garante que erros de regras de negócio (como senhas incorretas ou registro de usuários com e-mail duplicado) sejam lançados sob as condições corretas.
* **Testes de Integração (`tests/integration/auth.routes.test.ts`)**: Testam o fluxo ponta a ponta simulando requisições HTTP reais de cadastro, login, refresh e logout contra uma base de testes limpa do PostgreSQL. Garante que a API, middlewares e banco de dados funcionam em perfeita harmonia.

---

## Checklist de Execução

- [ ] 3.1 Definir schemas Zod para validação das rotas de autenticação (`src/modules/auth/auth.schemas.ts`).
- [ ] 3.2 Implementar a camada de repositório para interações de banco relacionadas a Usuários e Refresh Tokens (`src/modules/auth/auth.repository.ts`).
- [ ] 3.3 Desenvolver o serviço de regras de negócio (`src/modules/auth/auth.service.ts`).
- [ ] 3.4 Desenvolver o controlador HTTP (`src/modules/auth/auth.controller.ts`).
- [ ] 3.5 Criar o roteador específico de autenticação (`src/modules/auth/auth.routes.ts`).
- [ ] 3.6 Registrar o roteador de autenticação no roteador principal (`src/routes/index.ts`).
- [ ] 3.7 Validar fluxos de autenticação através de cliente REST (Postman/Insomnia/VS Code REST Client).
- [ ] 3.8 Desenvolver cobertura de testes unitários para a classe `AuthService`.
- [ ] 3.9 Desenvolver testes de integração ponta a ponta (E2E) para as rotas do módulo de autenticação.
