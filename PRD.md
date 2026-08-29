# PRD de Testes Automatizados com IA — SocialBooks

> **Documento de Requisitos de Produto (PRD) para Plataforma de Testes Automatizados e Agentes de QA com Inteligência Artificial.**  
> **Aplicação:** SocialBooks — Rede Social Literária e Gestão de Leituras  
> **Versão:** 1.0.0  
> **Data de Emissão:** 2026-08-21  

---

## 1. Sumário Executivo e Arquitetura do Sistema

### 1.1 Objetivo do Documento
Este documento define a especificação completa de testes funcionais, de integração, E2E (End-to-End), de performance e de resiliência de IA para execução autônoma por **plataformas de testes automatizados com IA** (ex.: Agentes Playwright/Puppeteer orientados a LLM, Cypress AI, Autify, Mabl, Testim).

### 1.2 Visão Geral da Solução
O **SocialBooks** é uma plataforma web full-stack que une:
1. **Gestão de Leituras (estilo Skoob)**: Estante virtual, status de leitura (`lendo`, `lido`, `quero_ler`, `relendo`, `abandonado`), controle de páginas lidas, metas anuais e anotações.
2. **Feed Social Visual (estilo Bookstagram/Instagram)**: Postagens em carrossel dinâmico, cartões estéticos de citação (*Quote Cards*), resenhas, likes, bookmarks e comentários.
3. **Estúdio e Assistente de IA Literária (Google Gemini 3.7 Flash)**: Chat assistente com contexto do leitor, gerador de carrosséis e posts estéticos, recomendador literário preditivo e gerador de fichas técnicas sem spoiler.
4. **Persistência em Nuvem e Autenticação (Supabase)**: Banco de dados PostgreSQL gerenciado e Supabase Auth com suporte a múltiplos usuários.

### 1.3 Stack Tecnológica
- **Frontend**: React 18 (TypeScript), Vite, Tailwind CSS, Lucide React (ícones), Motion/React (animações).
- **Backend**: Node.js com Express e middleware Vite SPA.
- **Banco de Dados & Auth**: Supabase PostgreSQL (`books`, `posts`, `profiles`, `reading_goals`).
- **Motor de IA**: `@google/genai` (Google Gemini 3.7 Flash) com suporte a *graceful fallbacks* estruturados.
- **Porta do Servidor**: `3000` (padrão container).

### 1.4 Credenciais de Testes e Fixtures de Autenticação (Test Data Fixtures)
Para execução autônoma por plataformas de testes com IA e pipelines de CI/CD:

| Parâmetro | Valor Configurado | Descrição |
| :--- | :--- | :--- |
| **Usuário Principal (E-mail)** | `steveecapitaoo@gmail.com` | Conta oficial de testes E2E e validação no Supabase Auth |
| **Senha Padrão (Password)** | `12345678` | Senha configurada para execução dos cenários de login e sessão |
| **Perfil / Handle** | `@steveecapitaoo` | Perfil de leitor associado na tabela `profiles` |
| **Meta Anual de Leitura** | `24 livros` | Meta padrão na tabela `reading_goals` |
| **Status da Conta** | `Ativo / Autenticado` | Permissões de leitura, escrita na estante e feed social |

---

## 2. Mapeamento de Rotas, Endpoints e Elementos de Interface

### 2.1 Rotas Frontend (Single Page Navigation)
A navegação interna ocorre via controle de estado na raiz (`App.tsx`):
- `feed`: Feed social com posts em carrossel, citações, stories e meta rápida.
- `bookshelf`: Estante de livros com filtros de status e busca.
- `ai-studio`: Estúdio de criação de conteúdo e recomendações assistidas por IA.
- `profile`: Perfil do leitor com métricas, metas, gêneros e badges.

### 2.2 Endpoints REST da API Backend
| Método | Endpoint | Descrição | Payload Esperado |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Verificação de integridade da API | Nenhum |
| `POST` | `/api/ai/chat` | Chat com a IA Literária com contexto do usuário | `{ message: string, history?: any[], context?: object }` |
| `POST` | `/api/ai/recommend` | Motor de recomendações de livros | `{ favoriteGenres?: string[], likedBooks?: string, mood?: string, preferredPace?: string, trope?: string }` |
| `POST` | `/api/ai/generate-post`| Gerador de carrossel e legendas | `{ bookTitle: string, bookAuthor: string, postType?: string, userNotes?: string, rating?: number, targetVibe?: string }` |
| `POST` | `/api/ai/book-sheet` | Ficha técnica e sinopse sem spoiler | `{ query: string }` |

### 2.3 Mapeamento de Seletores e Elementos Interativos Chave

#### Barra Superior e Navegação (`Navbar.tsx`)
- **Logo SocialBooks**: `button:has(span:text("SocialBooks"))` ou `div.font-serif.font-bold`
- **Aba Feed**: `nav button:has-text("Feed")`
- **Aba Estante**: `nav button:has-text("Minha Estante")`
- **Aba IA Studio**: `nav button:has-text("IA Studio")`
- **Aba Perfil**: `nav button:has-text("Perfil")` ou avatar circular do usuário
- **Botão Login**: `#btn-nav-login` (quando deslogado)
- **Botão Cadastro Direto**: `#btn-nav-signup` (botão "Cadastre-se" em destaque na Navbar)
- **Botão Usuário Logado**: `#btn-nav-logged-user` (quando autenticado no Supabase)
- **Botão Diagnóstico Supabase**: `button[title="Status do banco Supabase"]` ou botão com badge verde "Supabase"
- **Botão Assistente IA (Drawer)**: `button[title="Abrir IA Literária SocialBooks"]`
- **Botão Criar Post (Navbar)**: `#btn-nav-create-post` ou `button:has-text("Criar Post")`
- **Barra de Busca Global**: `input[placeholder*="Buscar livros, autores, resenhas..."]`

#### Modal de Autenticação e Cadastro (`AuthModal.tsx`)
- **Aba Login**: `#tab-auth-login` (`button:has-text("Entrar")`)
- **Aba Cadastro / Registro**: `#tab-auth-signup` (`button:has-text("Cadastre-se")`)
- **Aba Diagnóstico**: `#tab-auth-diagnostics` (`button:has-text("Status DB")`)
- **Seleção de Avatar Literário**: `button:has(img[alt])` (presets de perfil estético)
- **Campo Nome Completo**: `input[placeholder*="Ex: Mariana Silva"]`
- **Campo Handle / Nome de Usuário**: `input[placeholder*="mari.leitora"]`
- **Campo E-mail**: `input[type="email"]`
- **Campo Senha**: `input[placeholder*="Mínimo 6 dígitos"]` ou `input[type="password"]`
- **Campo Confirmar Senha**: `input[placeholder*="Repita sua senha"]`
- **Indicador de Força de Senha**: barra com níveis Fraca, Razoável, Boa, Forte
- **Seletores de Gêneros Literários Favoritos**: botões de tag (`Fantasia`, `Romance`, `Ficção Científica`, etc.)
- **Seletores de Meta Anual**: botões de meta (`6 livros`, `12 livros`, `24 livros`, `36 livros`, `50 livros`)
- **Checkbox de Termos da Comunidade**: `input[type="checkbox"]`
- **Botão Submeter Cadastro**: `#btn-submit-signup` (`button:has-text("Concluir Cadastro no SocialBooks")`)
- **Botão Submeter Login**: `#btn-submit-login` (`button:has-text("Entrar na Minha Conta")`)
- **Botão Esqueceu a Senha**: `button:has-text("Esqueceu a senha?")`
- **Botão Reexecutar Teste Supabase**: `button:has-text("Reexecutar Teste")`
- **Botão Popular Dados Iniciais**: `button:has-text("Popular Dados Iniciais")`

#### Estante e Gestão de Livros (`BookshelfView.tsx`, `AddBookModal.tsx`, `BookDetailModal.tsx`)
- **Botão Novo Livro**: `button:has-text("Novo Livro")`
- **Filtros de Status**:
  - `button:has-text("Todos")`
  - `button:has-text("Lendo")`
  - `button:has-text("Lidos")`
  - `button:has-text("Quero Ler")`
  - `button:has-text("Relendo")`
  - `button:has-text("Abandonados")`
- **Card do Livro na Estante**: `div:has(img[alt*="Capa de"])` ou card contendo título do livro
- **Botão Preencher com IA (Add Book Modal)**: `button:has-text("Preencher com IA")`
- **Input Título (Add Book)**: `input[placeholder*="Ex: Torto Arado"]`
- **Input Autor (Add Book)**: `input[placeholder*="Ex: Itamar Vieira Junior"]`
- **Input Páginas Totais**: `input[type="number"][placeholder*="Ex: 384"]`
- **Botão Salvar Livro**: `button[type="submit"]:has-text("Adicionar à Estante")` ou `button:has-text("Salvar Alterações")`
- **Modal de Detalhes do Livro**:
  - Controle deslizante de página atual: `input[type="range"]`
  - Seletor de status: `select` de status
  - Área de notas do leitor: `textarea[placeholder*="Adicione uma citação ou pensamento..."]`
  - Botão Adicionar Nota: `button:has-text("Salvar Nota")`

#### Feed e Criação de Post (`PostCard.tsx`, `CarouselPost.tsx`, `CreatePostModal.tsx`)
- **Navegação de Carrossel**: `button[title="Slide anterior"]` e `button[title="Próximo slide"]`
- **Botão Curtir (Like)**: `button:has(svg.lucide-heart)`
- **Botão Salvar (Bookmark)**: `button:has(svg.lucide-bookmark)`
- **Botão Abrir Comentários**: `button:has(svg.lucide-message-circle)`
- **Input de Comentário**: `input[placeholder*="Escreva um comentário..."]`
- **Modal Criar Post**:
  - Seleção de Tipo: `button:has-text("Carrossel")`, `button:has-text("Citação")`, `button:has-text("Resenha")`
  - Botão Gerar com IA: `button:has-text("Gerar Post com IA")`
  - Botão Publicar no Feed: `button:has-text("Publicar no Feed")`

#### Assistente de IA Flutuante (`AIAssistantDrawer.tsx`)
- **Gaveta Aberta**: Container flutuante com título "Assistente Literário IA"
- **Input de Mensagem**: `input[placeholder*="Pergunte sobre livros, autores, tropos..."]`
- **Botão Enviar Mensagem**: `button[type="submit"]:has(svg.lucide-send)`
- **Chips de Sugestão Rápida**: `button:has-text("Indique fantasia romântica")`, `button:has-text("Livros parecidos com Duna")`, etc.
- **Botão Fechar Gaveta**: `button:has(svg.lucide-x)`

---

## 3. Matriz de Cenários de Testes Automatizados (Test Suites)

### Suíte 1: Autenticação, Supabase e Gestão de Sessão

#### TC-01: Abertura do Modal e Exibição de Status do Supabase
- **Pré-condição**: Aplicação carregada no navegador.
- **Ações**:
  1. Clicar no botão `#btn-nav-login` ou no indicador de status do Supabase.
  2. Verificar se o modal é aberto com título *"Área de Usuário Supabase"*.
  3. Verificar se o badge *"Servidor Ativo"* ou *"Conectado"* está visível.
- **Resultado Esperado**: Modal visível, sem erros no console, formulário com campos de E-mail e Senha prontos para interação.

#### TC-02: Execução de Diagnóstico do Banco de Dados
- **Pré-condição**: Modal de autenticação aberto.
- **Ações**:
  1. Clicar na aba *"Status do Banco"*.
  2. Clicar no botão *"Reexecutar Teste"*.
  3. Aguardar conclusão do teste.
- **Resultado Esperado**:
  - Indicadores de contagem de livros e posts do Supabase são exibidos.
  - Testes de conexão com tabelas `books`, `posts`, `profiles` e `reading_goals` retornam status verde (`ok`).

#### TC-03: Login com Usuário Cadastrado no Supabase
- **Pré-condição**: Modal na aba *"Entrar"*.
- **Credenciais de Teste**:
  - **E-mail**: `steveecapitaoo@gmail.com`
  - **Senha**: `12345678`
- **Ações**:
  1. Preencher campo de E-mail (`input[type="email"]`) com `steveecapitaoo@gmail.com`.
  2. Preencher campo de Senha (`input[type="password"]`) com `12345678`.
  3. Clicar no botão de visibilidade de senha e validar alternância do tipo do input (`password` -> `text` -> `password`).
  4. Clicar no botão `#btn-submit-login` (*"Entrar na Minha Conta"*).
- **Resultado Esperado**:
  - Mensagem de sucesso verde exibida (*"Bem-vindo de volta, steveecapitaoo@gmail.com!"*).
  - Modal fecha automaticamente após ~1.2 segundos.
  - Navbar atualiza exibindo o botão `#btn-nav-logged-user` com o prefixo `steveecapitaoo` e indicador verde pulsante.

#### TC-03B: Cadastro de Novo Usuário (Sign-Up / Registro Completo)
- **Pré-condição**: Modal de autenticação na aba *"Cadastre-se"* (ou clique no botão `#btn-nav-signup` da Navbar ou banner de cadastro do Perfil).
- **Ações**:
  1. Selecionar um avatar literário na lista de presets.
  2. Preencher Nome Completo: `"Mariana Silva"`.
  3. Validar se o Handle `@username` foi preenchido automaticamente como `"marianasilva"`.
  4. Preencher E-mail: `"novo_leitor_teste@socialbooks.com"`.
  5. Preencher Senha: `"LeitorForte@2026"` e verificar se o medidor de força de senha indica status *"Forte e Segura"* ou barra verde.
  6. Preencher Confirmar Senha: `"LeitorForte@2026"`.
  7. Selecionar gêneros favoritos (ex: `"Fantasia"`, `"Romance"`).
  8. Selecionar Meta Anual de Leitura (ex: `24 livros`).
  9. Garantir que a caixa de termos esteja marcada.
  10. Clicar em *"Concluir Cadastro no SocialBooks"*.
- **Resultado Esperado**:
  - Cadastro processado no Supabase Auth.
  - Perfil e meta anual registrados nas tabelas `profiles` e `reading_goals`.
  - Mensagem de confirmação verde exibida.
  - Usuário é autenticado e modal fecha automaticamente.
  - Navbar atualiza para o estado autenticado.

#### TC-04: Tratamento de Erro em Login com Credenciais Inválidas
- **Pré-condição**: Modal de Login aberto.
- **Ações**:
  1. Preencher e-mail com `usuario_invalido_teste@socialbooks.com`.
  2. Preencher senha com `senha_incorreta_123`.
  3. Clicar em *"Entrar na Minha Conta"*.
- **Resultado Esperado**:
  - Caixa de alerta vermelha exibida com mensagem amigável: *"E-mail ou senha incorretos. Por favor, confira os dados cadastrados."*.
  - Sessão permanece limpa e não autorizada.

#### TC-05: Fluxo de Recuperação de Senha (Esqueceu a Senha)
- **Pré-condição**: Modal de Login aberto.
- **Ações**:
  1. Clicar no link *"Esqueceu a senha?"*.
  2. Verificar se a tela alterna para *"Recuperação de Senha"*.
  3. Inserir e-mail válido.
  4. Clicar em *"Enviar Link de Recuperação"*.
- **Resultado Esperado**: Mensagem de confirmação de envio exibida e retorno ao fluxo de login.

#### TC-06: Logout e Encerramento de Sessão
- **Pré-condição**: Usuário autenticado (`#btn-nav-logged-user` visível).
- **Ações**:
  1. Clicar no botão `#btn-nav-logged-user`.
  2. Clicar em *"Desconectar / Sair da Conta"*.
- **Resultado Esperado**:
  - Sessão é finalizada no Supabase Auth.
  - O botão da Navbar retorna para o estado `#btn-nav-login` ("Entrar").

---

### Suíte 2: Gestão da Estante de Leituras (Bookshelf / Skoob-style)

#### TC-07: Navegação e Filtros na Estante
- **Pré-condição**: Usuário na tela principal.
- **Ações**:
  1. Clicar na aba *"Minha Estante"* na Navbar.
  2. Clicar sucessivamente nos filtros: *"Lendo"*, *"Lidos"*, *"Quero Ler"*, *"Relendo"*, *"Abandonados"* e *"Todos"*.
  3. Digitar um termo no campo de busca da estante.
- **Resultado Esperado**: A lista de livros é filtrada instantaneamente sem recarregar a página, refletindo com precisão a contagem informada nos botões de filtro.

#### TC-08: Cadastro Manual de Livro na Estante
- **Pré-condição**: Aba *"Minha Estante"* ativa.
- **Ações**:
  1. Clicar no botão *"+ Novo Livro"*.
  2. Preencher:
     - Título: `"Cem Anos de Solidão"`
     - Autor: `"Gabriel García Márquez"`
     - Total de Páginas: `448`
     - Página Atual: `120`
     - Status: `Lendo`
     - Avaliação: `5 estrelas`
     - Gêneros: Selecionar `Ficção` e `Realismo Mágico`
  3. Clicar em *"Adicionar à Estante"*.
- **Resultado Esperado**:
  - Modal fecha com sucesso.
  - O novo livro aparece na grade da estante com barra de progresso em `26%` (120/448 páginas).

#### TC-09: Preenchimento Automático com IA na Criação de Livro
- **Pré-condição**: Modal *"+ Novo Livro"* aberto.
- **Ações**:
  1. No campo de busca inteligente / título, digitar `"O Hobbit"`.
  2. Clicar no botão *"Preencher com IA"*.
  3. Aguardar retorno da API `/api/ai/book-sheet`.
- **Resultado Esperado**:
  - Os campos de Autor (`J.R.R. Tolkien`), Total de Páginas, Sinopse Sem Spoiler, Gêneros e Tropos são preenchidos automaticamente.
  - Usuário pode salvar o livro imediatamente com dados enriquecidos.

#### TC-10: Atualização de Progresso de Leitura e Status
- **Pré-condição**: Existência de ao menos um livro na estante com status `Lendo`.
- **Ações**:
  1. Clicar no card do livro para abrir o `BookDetailModal`.
  2. Mover o slider de página atual para a última página (ex: de 120 para 448).
  3. Alterar o status do livro para *"Lido"*.
  4. Adicionar nota do leitor: `"Final emocionante e inesquecível!"`.
  5. Clicar em *"Salvar Alterações"*.
- **Resultado Esperado**:
  - O livro migra da aba *"Lendo"* para a aba *"Lidos"*.
  - A nota adicionada fica listada no histórico de anotações do livro.

---

### Suíte 3: Feed Social Literário e Interações (Bookstagram-style)

#### TC-11: Renderização e Navegação em Carrossel de Post
- **Pré-condição**: Aba *"Feed"* ativa com posts do tipo carrossel.
- **Ações**:
  1. Localizar o primeiro post com carrossel de slides.
  2. Clicar no botão de seta para a direita (`>`) para avançar até o último slide.
  3. Validar a atualização do contador de slides (ex: `1/4` -> `2/4` -> `3/4` -> `4/4`).
  4. Clicar na seta para a esquerda (`<`) para retornar ao primeiro slide.
- **Resultado Esperado**: Transição suave entre slides com animação, texto legível e pontuação visual (dots) sincronizada.

#### TC-12: Interações Sociais (Curtir, Salvar e Comentar)
- **Pré-condição**: Visualizando um post no Feed.
- **Ações**:
  1. Clicar no botão de coração (Curtir).
     - *Verificar*: Coração fica preenchido de vermelho e contador de curtidas incrementa em +1.
  2. Clicar novamente no botão de coração (Descurtir).
     - *Verificar*: Coração volta ao estado não preenchido e contador decrementa em -1.
  3. Clicar no botão de Bookmark (Salvar).
     - *Verificar*: Ícone fica destacado em amarelo/dourado.
  4. Abrir seção de comentários, digitar `"Excelente recomendação! Já adicionei à minha estante."` e submeter.
- **Resultado Esperado**: O novo comentário é adicionado ao topo/fim da lista de comentários com timestamp relativo (*"Agora"*), e o contador de comentários é incrementado.

#### TC-13: Criação de Post no Feed com Auxílio de IA
- **Pré-condição**: Clicar no botão *"Criar Post"* na barra superior.
- **Ações**:
  1. Selecionar o tipo *"Carrossel"*.
  2. Escolher um livro da estante ou digitar título (`"Torto Arado"`) e autor (`"Itamar Vieira Junior"`).
  3. Clicar no botão *"Gerar Post com IA"*.
  4. Aguardar o processamento da rota `/api/ai/generate-post`.
  5. Conferir legenda gerada, hashtags sugeridas e 4 slides de carrossel estruturados.
  6. Clicar em *"Publicar no Feed"*.
- **Resultado Esperado**: O novo post é publicado e exibido instantaneamente no topo do Feed social com todos os slides gerados.

---

### Suíte 4: Estúdio de IA Literária e Assistente Flutuante (Gemini 3.7 Flash)

#### TC-14: Chat com Assistente Flutuante de IA
- **Pré-condição**: Clicar no ícone de robô/faísca na barra superior para abrir o `AIAssistantDrawer`.
- **Ações**:
  1. Enviar a mensagem: `"Quero um livro de mistério nórdico rápido de ler."`.
  2. Aguardar resposta da rota `/api/ai/chat`.
- **Resultado Esperado**:
  - Resposta amigável da IA em português com indicações pertinentes (ex: Jo Nesbø, Stieg Larsson, Camilla Läckberg).
  - Ausência de quebras de layout ou atrasos maiores que o timeout estabelecido.

#### TC-15: Motor de Recomendações Personalizadas no IA Studio
- **Pré-condição**: Acessar a aba *"IA Studio"* na Navbar.
- **Ações**:
  1. Localizar a seção de Recomendador de Livros.
  2. Selecionar:
     - Gênero: `Fantasia Épica`
     - Clima/Mood: `Misterioso & Sombrio`
     - Ritmo: `Rápido e Fluido`
     - Trope: `Enemies to Lovers`
  3. Clicar em *"Gerar Recomendações com IA"*.
- **Resultado Esperado**:
  - São renderizados cards de recomendação com nota de compatibilidade (Match Score %, ex: 96%), motivo da recomendação, vibe e hashtags.

#### TC-16: Resiliência de IA e Graceful Fallback
- **Cenário de Teste**: Simulação de indisponibilidade de chave de API ou perda de conexão externa com o Google Gemini.
- **Ações**:
  1. Enviar requisições para `/api/ai/chat`, `/api/ai/recommend` e `/api/ai/generate-post` com a chave desativada ou simulando erro HTTP 500/timeout.
- **Resultado Esperado**:
  - A aplicação NÃO deve quebrar (crash/tela branca).
  - O backend Express ativa os dados de fallback internos estruturados, retornando respostas literárias coerentes e formatadas sem interrupção para o usuário final.

---

### Suíte 5: Perfil do Usuário e Metas Literárias

#### TC-17: Visualização e Edição de Perfil
- **Pré-condição**: Acessar a aba *"Perfil"* na Navbar.
- **Ações**:
  1. Conferir renderização das métricas: Livros Lidos, Páginas Lidas, Dias Seguidos (Streak) e Badges Conquistados.
  2. Clicar em *"Editar Perfil"*.
  3. Alterar Biografia para `"Leitor voraz de ficção científica e literatura nacional."`.
  4. Salvar alterações.
- **Resultado Esperado**: Perfil atualizado com feedback visual positivo e persistência das novas informações.

#### TC-18: Atualização da Meta de Leitura Anual
- **Pré-condição**: Visualizando o widget de meta na aba Perfil ou Feed.
- **Ações**:
  1. Clicar em *"Ajustar Meta"* ou ícone de edição da meta.
  2. Alterar meta de 20 livros para `25 livros`.
  3. Confirmar alteração.
- **Resultado Esperado**: A barra de progresso recalcula a porcentagem concluída com base na nova meta (ex: 8/25 = 32%).

---

### Suíte 6: Responsividade, UI/UX e Acessibilidade

#### TC-19: Adaptação para Dispositivos Móveis (Mobile Viewport 375px - 414px)
- **Pré-condição**: Emulação de dispositivo mobile (ex: iPhone 14 / Pixel 7).
- **Ações**:
  1. Verificar o surgimento da barra de navegação inferior fixa (`Mobile Bottom Navigation Bar`).
  2. Navegar entre Feed, Estante, IA Studio e Perfil pelos ícones inferiores.
  3. Abrir modais e conferir que não há overflow horizontal (`scroll horizontal indesejado`).
- **Resultado Esperado**: Todos os botões respeitam a área mínima de toque (44x44px), formulários com teclado virtual utilizável e textos fluidos sem cortes.

#### TC-20: Validação de Contraste e Identidade Visual Dark Academia
- **Ações**:
  1. Validar contraste de texto (WCAG AA ≥ 4.5:1) em todos os botões e fundos.
  2. Validar que não há elementos de gradientes roxo/azul genéricos ou quebras tipográficas.
- **Resultado Esperado**: Paleta consistente em tons quentes de cinza/pedra (`stone-900`, `stone-950`), toques de âmbar (`amber-400`/`amber-500`) e esmeralda (`emerald-400`).

---

## 4. Payloads de Teste e Especificações da API

### 4.1 Chat com IA (`POST /api/ai/chat`)
```json
{
  "message": "Qual é a ordem de leitura recomendada para os livros de Duna?",
  "history": [],
  "context": {
    "currentBooks": "Duna",
    "readCount": 12,
    "favoriteGenres": ["Ficção Científica", "Fantasia"]
  }
}
```
**Resposta de Sucesso (200 OK):**
```json
{
  "reply": "Para iniciar no universo de Frank Herbert, a recomendação clássica é...\n1. Duna (1965)\n2. Messias de Duna (1969)...",
  "suggestedActions": ["Ver ficha técnica de Duna", "Criar resenha no feed"]
}
```

### 4.2 Geração de Post e Carrossel (`POST /api/ai/generate-post`)
```json
{
  "bookTitle": "Torto Arado",
  "bookAuthor": "Itamar Vieira Junior",
  "postType": "carrossel",
  "userNotes": "Personagens Bibiana e Belonísia são inesquecíveis, prosa poética e forte.",
  "rating": 5,
  "targetVibe": "Poético e Ancestral"
}
```
**Resposta de Sucesso (200 OK):**
```json
{
  "caption": "📖 Terminei a leitura arrebatadora de 'Torto Arado'...\n\nNota: ⭐⭐⭐⭐⭐ (5/5)\n\n...",
  "hashtags": ["#SocialBooks", "#TortoArado", "#LiteraturaBrasileira", "#BookstagramBrasil"],
  "quoteSuggestion": "Sobre a terra e o silêncio que nos molda.",
  "carouselSlides": [
    {
      "slideNumber": 1,
      "slideType": "hook",
      "headline": "Por que Torto Arado é uma obra-prima contemporânea?",
      "bodyText": "Uma história profunda sobre laços fraternos e raízes brasileiras.",
      "visualTip": "Capa com tons terrosos e luz suave."
    }
  ]
}
```

---

## 5. Critérios de Aceite Globais (Quality Gates para IA)

| Métrica / Critério | Limiar de Aceite | Severidade de Falha |
| :--- | :--- | :--- |
| **Tempo de Resposta de Rotas REST** | ≤ 2.5s para IA; ≤ 300ms para rotas locais | Alta |
| **Erros 500 Não Tratados** | 0 ocorrências toleradas | Crítica |
| **Erros de Tipagem / Console Warnings Graves** | 0 erros fatais no console | Alta |
| **Persistência de Dados (Supabase)** | 100% dos dados cadastrados salvos no DB | Crítica |
| **Responsividade Mobile (375px a 1920px)** | 0 quebras de container / 0 overflow X | Alta |
| **Acessibilidade de Elementos Interativos** | 100% dos inputs com labels e botões acessíveis | Média |

---

## 6. Instruções de Execução para Agentes Automatizados

1. **Passo 1 (Warmup & Healthcheck)**:
   - Executar `GET /api/health` e validar status `200 OK`.
2. **Passo 2 (Verificação de Conexão Supabase)**:
   - Abrir o modal de status pelo botão verde do Supabase e disparar a rotina de diagnóstico (`TC-02`).
   - Se o banco estiver vazio, acionar o botão *"Popular Dados Iniciais"*.
3. **Passo 3 (Fluxo de Autenticação com Fixture)**:
   - Executar login com as credenciais padrão:
     - Usuário: `steveecapitaoo@gmail.com`
     - Senha: `12345678`
   - Validar cenário `TC-03` e verificar persistência do cabeçalho com usuário ativo `#btn-nav-logged-user`.
4. **Passo 4 (Fluxos Funcionais E2E)**:
   - Executar `TC-08` (Criação de livro na estante).
   - Executar `TC-10` (Atualização de progresso e notas).
   - Executar `TC-12` (Curtir e comentar no Feed).
   - Executar `TC-13` (Criação de post com IA).
5. **Passo 5 (Testes de IA e Fallbacks)**:
   - Executar chamadas nos 4 endpoints `/api/ai/*` e validar integridade do JSON de retorno.
6. **Passo 6 (Teardown & Relatório)**:
   - Coletar capturas de tela dos estados chave e validar que todos os Quality Gates foram satisfeitos.
