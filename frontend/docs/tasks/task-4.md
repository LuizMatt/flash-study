# Tarefa 4: Módulos de Domínio Core (Usuário, Categorias e Flashcards)

## Função da Task
Esta tarefa tem como função implementar as regras de negócio centrais do aplicativo FlashStudy. Ela constrói as entidades principais de domínio: Usuário (User), Categorias (Category) e Cartões de Estudo (Flashcard). A maior prioridade deste bloco é a imposição de isolamento de dados por usuário (multitenancy básico), assegurando por meio de validações de propriedade (ownership) que nenhum usuário consiga visualizar, alterar ou excluir categorias e flashcards pertencentes a outros usuários.

## Objetivos das Coisas (Por que cada item existe?)

### 4.1 Módulo do Usuário (User Module)
* **`user.schemas.ts`**: Valida os campos que o usuário pode atualizar (ex: nome do perfil e troca de senha), barrando campos indevidos.
* **`user.repository.ts` & `user.service.ts`**:
  * Carregam as informações do perfil do usuário autenticado no endpoint `GET /me`.
  * Agregam estatísticas rápidas consolidadas sobre o progresso de estudos daquele usuário específico (Ex: total de decks criados, quantidade total de flashcards criados e quantos desses cartões já foram dominados/aprendidos).
* **`user.controller.ts` & `user.routes.ts`**: Expõem as rotas privadas `/me` sob o middleware `authMiddleware`, garantindo acesso exclusivo.

### 4.2 Módulo de Categorias (Category Module)
* **`category.schemas.ts`**: Valida a entrada para criação ou atualização de categorias (ex: restringe cores para formatos hexadecimais, ícones para um conjunto válido e nome curto).
* **`category.repository.ts`**: Isola as queries com o Prisma. Garante que qualquer busca por ID filtre pelo `userId` correspondente. Implementa queries otimizadas que retornam cada categoria acompanhada de contadores em tempo real (Ex: `{ id, name, color, totalCards: X, learnedCards: Y }`).
* **`category.service.ts`**: Orquestra a lógica de negócio. Impede a criação de categorias duplicadas com o mesmo nome para um mesmo usuário (validação de unicidade no escopo de usuário) e impede a exclusão de categorias que não pertençam ao usuário solicitante.
* **`category.controller.ts` & `category.routes.ts`**: Expõem endpoints protegidos de CRUD (`GET /categories`, `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id`).

### 4.3 Módulo de Flashcards (Flashcard Module)
* **`flashcard.schemas.ts`**: Valida os dados dos flashcards. Garante que frente e verso não estejam em branco e valida os parâmetros de consulta.
* **`flashcard.repository.ts`**: Lida com buscas filtradas (por exemplo, buscar cartões de uma categoria específica, filtrar apenas cartões que ainda não foram marcados como aprendidos).
* **`flashcard.service.ts`**: Controla as principais validações de integridade dos flashcards:
  * Antes de criar um flashcard, verifica se a categoria informada pertence de fato ao usuário autenticado, impedindo injeção de cards em decks alheios.
  * Controla a lógica de alteração de estados de aprendizado (`learned = true`).
  * Implementa a lógica de resetar o status de aprendizado de todos os flashcards de uma categoria de uma só vez.
* **`flashcard.controller.ts` & `flashcard.routes.ts`**: Expõem o CRUD de cartões, o endpoint para marcar como aprendido (`PATCH /flashcards/:id/learned`), o endpoint para resetar o deck (`POST /categories/:id/reset-learned`) e as listagens para a revisão ativa do usuário.

---

## Checklist de Execução

### 4.1 Módulo do Usuário (User Module)
- [ ] 4.1.1 Desenvolver schemas de validação Zod para alteração de perfil (`src/modules/user/user.schemas.ts`).
- [ ] 4.1.2 Desenvolver repositório de busca e atualização do usuário (`src/modules/user/user.repository.ts`).
- [ ] 4.1.3 Desenvolver o serviço contendo lógica de busca e atualização de perfil (`src/modules/user/user.service.ts`).
- [ ] 4.1.4 Criar controlador (`src/modules/user/user.controller.ts`) e rotas (`src/modules/user/user.routes.ts`) para os endpoints `GET /me` (retorna dados e estatísticas do usuário) e `PATCH /me`.
- [ ] 4.1.5 Registrar rotas de usuário no roteador principal (`src/routes/index.ts`).

### 4.2 Módulo de Categorias (Category Module)
- [ ] 4.2.1 Criar schemas Zod para criação, alteração e listagem de categorias (`src/modules/category/category.schemas.ts`).
- [ ] 4.2.2 Desenvolver repositório com suporte a CRUD e consultas com contagem de flashcards (`src/modules/category/category.repository.ts`).
- [ ] 4.2.3 Desenvolver serviço com validações de propriedade (ownership) e unicidade do nome por usuário (`src/modules/category/category.service.ts`).
- [ ] 4.2.4 Criar controlador (`src/modules/category/category.controller.ts`) e rotas (`src/modules/category/category.routes.ts`) protegidas por JWT.
- [ ] 4.2.5 Registrar rotas de categorias no roteador principal.
- [ ] 4.2.6 Desenvolver testes unitários e de integração para o isolamento e CRUD de categorias.

### 4.3 Módulo de Flashcards (Flashcard Module)
- [ ] 4.3.1 Criar schemas Zod para criação, alteração, listagem e controle de aprendizado dos flashcards (`src/modules/flashcard/flashcard.schemas.ts`).
- [ ] 4.3.2 Desenvolver repositório de flashcards com filtros específicos de categoria e status (`src/modules/flashcard/flashcard.repository.ts`).
- [ ] 4.3.3 Desenvolver serviço validando propriedade da categoria correspondente antes de qualquer ação (`src/modules/flashcard/flashcard.service.ts`).
- [ ] 4.3.4 Criar controlador (`src/modules/flashcard/flashcard.controller.ts`) e rotas (`src/modules/flashcard/flashcard.routes.ts`).
- [ ] 4.3.5 Registrar rotas de flashcards no roteador principal.
- [ ] 4.3.6 Desenvolver testes unitários e de integração para validação de fluxos dos flashcards.
