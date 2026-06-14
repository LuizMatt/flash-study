# Tarefa 2: Infraestrutura Compartilhada e Utilitários Globais

## Função da Task
Esta tarefa desenvolve os alicerces compartilhados (Shared Infrastructure) e aspectos transversais (cross-cutting concerns) do sistema. O objetivo é criar utilitários reutilizáveis de segurança, padronização de tratamento de erros e validação automática de dados. Isso evita a duplicação de lógica repetitiva nos controladores e serviços do sistema, garantindo um código limpo, consistente e seguro em todos os módulos.

## Objetivos das Coisas (Por que cada item existe?)

* **Erros Customizados (`src/shared/errors/`)**:
  * `AppError`: Classe base para erros esperados da aplicação (regras de negócio violadas). Contém mensagem e status HTTP específico.
  * `NotFoundError`, `UnauthorizedError`, `ConflictError`, `ForbiddenError`: Especializações com códigos HTTP adequados (404, 401, 409, 403) para tornar a comunicação do erro autoexplicativa.
* **Middleware de Erros Global (`src/middlewares/errorHandler.ts`)**: Captura centralizada de exceções. Qualquer erro lançado em qualquer controlador ou serviço é interceptado por este middleware, impedindo que o Express responda com páginas HTML padrão ou que stack traces técnicos de banco de dados vazem para o usuário final. Retorna um JSON padronizado com `{ error: { message, code } }`.
* **Middleware de Validação (`src/middlewares/validate.ts`)**: Automatiza a validação de inputs usando schemas do Zod. Ele intercepta a requisição antes de chegar ao controlador e valida o corpo (`body`), parâmetros de URL (`params`) ou parâmetros de busca (`query`). Se houver algum tipo incorreto ou campo faltando, ele devolve imediatamente uma resposta `400 Bad Request` com os detalhes da validação.
* **Helpers de Hashing (`src/shared/utils/hashPassword.ts`)**: Funções encapsuladas usando `bcryptjs`.
  * `hashPassword()`: Transforma a senha em texto puro em um hash criptográfico seguro irreversível antes de gravar no banco de dados.
  * `comparePassword()`: Valida se a senha enviada no login corresponde ao hash salvo, de forma segura contra ataques de temporização.
* **Helpers de Token (`src/shared/utils/generateToken.ts` e `src/config/auth.ts`)**:
  * `generateAccessToken()`: Emite um token de curta duração (ex: 15 minutos) contendo o ID do usuário para autorizar chamadas rápidas à API.
  * `generateRefreshToken()`: Emite um token de longa duração (ex: 7 dias) para que o aplicativo possa solicitar novos tokens de acesso sem que o usuário tenha que redigitar a senha.
  * `src/config/auth.ts`: Armazena os tempos de expiração e segredos de criptografia usados na assinatura de tokens.
* **Middleware de Autenticação (`src/middlewares/authMiddleware.ts`)**: Protege rotas restritas. Lê o header `Authorization: Bearer <token>`, decodifica o JWT usando a chave secreta e valida se o token expirou. Se o token for válido, extrai o ID do usuário do payload e o disponibiliza para as camadas seguintes.
* **Extensão de Tipo (`src/shared/types/express.d.ts`)**: Por padrão, o Express não possui a propriedade `userId` no objeto `Request`. Este arquivo estende a tipagem global do Express para que o TypeScript reconheça a atribuição `req.userId = decoded.sub` sem gerar erros de compilação.
* **Rate Limiter (`src/middlewares/rateLimiter.ts`)**: Limita o número de requisições por IP em determinado período de tempo (ex: no máximo 5 requisições de login por minuto). Isso evita ataques de força bruta que tentam adivinhar senhas repetidamente.
* **Agregador de Rotas (`src/routes/index.ts`)**: Um ponto central que importa as rotas de cada módulo e as monta sob o prefixo correto (ex: `/api/auth`, `/api/categories`), facilitando a manutenção e a visualização global de todas as rotas expostas.

---

## Checklist de Execução

- [ ] 2.1 Criar a estrutura de erros customizados em `src/shared/errors/` com classes derivadas (`AppError`, `NotFoundError`, `UnauthorizedError`, `ConflictError`, `ForbiddenError`).
- [ ] 2.2 Desenvolver o middleware global de tratamento de erros (`src/middlewares/errorHandler.ts`) para interceptar exceções e responder com o status HTTP correto.
- [ ] 2.3 Criar o middleware utilitário de validação genérica de dados (`src/middlewares/validate.ts`) baseado nos schemas do Zod.
- [ ] 2.4 Implementar funções utilitárias para hashing e comparação de senhas com bcrypt (`src/shared/utils/hashPassword.ts`).
- [ ] 2.5 Desenvolver utilitários para geração e verificação de Access Tokens e Refresh Tokens JWT (`src/shared/utils/generateToken.ts`).
- [ ] 2.6 Centralizar configurações do JWT em `src/config/auth.ts`.
- [ ] 2.7 Construir o middleware de proteção de rotas (`src/middlewares/authMiddleware.ts`) que analisa o cabeçalho Bearer e injeta o ID do usuário autenticado.
- [ ] 2.8 Definir declarações de tipos TypeScript para estender a interface de Request do Express com a propriedade `userId` (`src/shared/types/express.d.ts`).
- [ ] 2.9 Configurar middleware de limitação de requisições (`src/middlewares/rateLimiter.ts`).
- [ ] 2.10 Configurar o roteador principal do aplicativo (`src/routes/index.ts`).
