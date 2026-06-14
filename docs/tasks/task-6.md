# Tarefa 6: Integração com Aplicativo Expo (Frontend) e Deploy de Produção

## Função da Task
Esta tarefa tem como função unificar o ecossistema do FlashStudy, conectando o aplicativo móvel (Expo React Native) ao servidor de backend real e implantando a infraestrutura completa em produção na nuvem. A integração frontend substitui os dados fictícios locais (mocks) por chamadas de rede seguras, implementando armazenamento criptografado no chaveiro do dispositivo móvel e renovação transparente de sessão. O deploy assegura a entrega de um banco de dados relacional e uma API acessíveis publicamente sob HTTPS com fluxos automatizados de CI/CD.

## Objetivos das Coisas (Por que cada item existe?)

### 6.1 Integração Frontend (Aplicativo Expo)
* **Cliente de API HTTP (`src/services/api.ts` no app mobile)**: Centraliza a instância do Axios. Define configurações de headers (como `Content-Type: application/json`) e a URL base da API (que aponta para `http://localhost:3333` ou o IP da máquina local no simulador, e para a URL de produção após o deploy).
* **Armazenamento Seguro (`expo-secure-store`)**: Diferente do `AsyncStorage` comum (que salva dados em texto puro), o `expo-secure-store` utiliza as APIs de criptografia nativas do sistema operacional (Keychain no iOS e Keystore no Android) para armazenar os tokens de Access e Refresh de forma protegida contra extração de dados maliciosos.
* **Interceptor Axios de Refresh Token Silencioso**: Mecanismo de alta qualidade para experiência do usuário (UX). Quando o Access Token (curto) expira, a API retorna `401 Unauthorized`. O interceptor do Axios captura esse erro de forma transparente, pausa as requisições em andamento, chama a rota `/api/auth/refresh` enviando o Refresh Token para obter novos tokens, atualiza o chaveiro do aparelho e re-executa a chamada original sem que o usuário perceba qualquer travamento ou tela de login.
* **Refatoração dos Contextos (`AuthContext.tsx` e `AppContext.tsx` / `AppReducer.ts`)**:
  * **`AuthContext.tsx`**: Substitui a validação fictícia pelas chamadas `/api/auth/login`, `/register`, `/logout` e gerencia o estado do usuário com base nos dados obtidos da API real.
  * **`AppContext.tsx`**: Migra os estados locais de categorias e flashcards para consumo de APIs, buscando dados na inicialização do app e enviando requisições de criação, exclusão e alteração de status em tempo real.
* **Remoção de Código Morto (`mockData.ts` & `serviceMock.ts`)**: Elimina os arquivos de simulação legados que foram criados no início do projeto mobile. Isso limpa o repositório, diminui o tamanho do bundle de distribuição e previne confusões ou importações incorretas de dados fictícios.

### 6.2 Docker, CI/CD e Deploy
* **Dockerização (`Dockerfile` e `docker-compose.yml`)**:
  * `Dockerfile`: Cria uma receita de build imutável para empacotar o backend Node.js com a versão correta do runtime, garantindo que o comportamento no servidor de produção seja idêntico ao de desenvolvimento.
  * `docker-compose.yml`: Permite orquestrar e subir localmente, com apenas um comando (`docker compose up`), o contêiner do servidor Express e o contêiner do PostgreSQL, simplificando o setup para novos desenvolvedores.
* **Banco de Dados em Nuvem (Ex: Neon, Supabase, Railway PostgreSQL)**: Provisionamento de uma instância robusta de banco relacional PostgreSQL rodando em nuvem gerenciada, com backups automáticos e conexões criptografadas.
* **Hospedagem da API (Ex: Render, Railway, Fly.io)**: Publicação do servidor Node.js na nuvem de forma escalável, configurando certificados HTTPS automáticos (essenciais para que dispositivos móveis Android e iOS aceitem conexões seguras).
* **Pipeline de CI/CD (Ex: GitHub Actions)**: Automatiza a esteira de desenvolvimento. Ao realizar um push/merge na branch principal (ex: `main`), o GitHub dispara máquinas virtuais para rodar os testes automatizados da Tarefa 5, executar linters e, caso o build seja íntegro, publicar o novo código automaticamente nos servidores de produção. Previne falhas por erros de deploy manuais.

---

## Checklist de Execução

### 6.1 Integração Frontend (Aplicativo Expo)
- [ ] 6.1.1 Desenvolver o cliente de conexão HTTP com Axios em `src/services/api.ts` (ou equivalente no app móvel).
- [ ] 6.1.2 Integrar biblioteca `expo-secure-store` para persistência segura do Access Token e Refresh Token localmente.
- [ ] 6.1.3 Configurar interceptor Axios no app para capturar erros 401 e executar renovação automática e silenciosa do Access Token via rota `/refresh`.
- [ ] 6.1.4 Refatorar `AuthContext.tsx` substituindo chamadas aos mocks por requisições ao backend.
- [ ] 6.1.5 Refatorar `AppContext.tsx` e `AppReducer.ts` para sincronizar e persistir categorias, cards e histórico na API.
- [ ] 6.1.6 Adaptar as telas de login, cadastro, categorias, flashcards e revisão para receber feedback de carregamento (loading) e erros das requisições reais.
- [ ] 6.1.7 Remover dados e serviços de mock (`mockData.ts` e `serviceMock.ts`) do código-fonte do app.
- [ ] 6.1.8 Executar baterias de testes manuais integrados ponta a ponta com o servidor backend rodando localmente.

### 6.2 Docker, CI/CD e Deploy
- [ ] 6.2.1 Criar arquivos `Dockerfile` e `docker-compose.yml` para facilitar a inicialização e orquestração do ambiente de backend.
- [ ] 6.2.2 Provisionar base de dados PostgreSQL gerenciada em nuvem.
- [ ] 6.2.3 Criar e implantar o backend Node.js em serviço de hospedagem cloud configurando variáveis de ambiente.
- [ ] 6.2.4 Automatizar pipeline de CI/CD (Ex: GitHub Actions) executando linters, testes e deploy a cada push no branch principal.
- [ ] 6.2.5 Atualizar a variável `API_BASE_URL` no aplicativo Expo para apontar para o servidor de produção e executar testes de aceitação finais.
