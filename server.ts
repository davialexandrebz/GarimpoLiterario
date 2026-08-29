import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client lazily or with safety check
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. AI requests will return mock/fallback responses.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `Você é a inteligência artificial central da plataforma "SocialBooks", uma rede social focada exclusivamente no universo literário que une a gestão de leituras do Skoob com a experiência visual e estética do Instagram (Bookstagram).

Suas principais responsabilidades e identidade:
1. Recomendar livros com base nas preferências, humor atual, tropos literários e histórico de leitura do usuário.
2. Auxiliar os usuários a criarem resenhas atrativas e posts de alto impacto para o feed no formato de carrossel (estruturado em slides com títulos, ganchos e notas visuais) ou cartões de citações marcantes.
3. Fornecer resumos estritamente sem spoilers, fichas técnicas completas (título, autor, editora, páginas, ano, gênero, tropos, classificação indicativa e gatilhos/avisos de conteúdo) e curiosidades sobre autores.
4. Manter sempre um tom de conversa amigável, entusiasmado, respeitoso, acolhedor e focado na comunidade literária apaixonada por livros.

Diretrizes de resposta:
- Priorize sempre conteúdos estritamente relacionados a livros, leitura, escrita e o universo literário.
- Utilize formatação limpa (listas, tópicos, negrito) para facilitar a leitura rápida.
- Sugira tags/hashtags literárias relevantes (ex: #SocialBooks, #BookTokBrasil, #Bookstagrammer, #LendoAgora, #ResenhaLiteraria, #ClubeDoLivro) quando o usuário pedir ajuda para criar postagens ou divulgar leituras.
- Sempre responda em português brasileiro culto e acolhedor.`;

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "SocialBooks AI Server" });
});

// AI Chat Endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Mensagem é obrigatória." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply: `Olá, apaixonado por livros! 📚 Sou a IA Literária do SocialBooks. Como o GEMINI_API_KEY ainda não foi configurado, aqui está uma resposta do meu catálogo interno para "${message}".\n\nAdoro falar sobre literatura clássica, contemporânea, fantasia e ficção científica! O que você está lendo hoje?`,
        suggestedActions: ["Pedir recomendação", "Criar post para o feed", "Ficha técnica de um livro"],
      });
    }

    const ai = getGenAI();
    let promptWithContext = message;
    if (context) {
      promptWithContext = `[Contexto do leitor no SocialBooks: Livros atuais: ${context.currentBooks || "Nenhum"}; Livros lidos: ${context.readCount || 0}; Gêneros favoritos: ${context.favoriteGenres?.join(", ") || "Gerais"}]\n\nPergunta do usuário: ${message}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: promptWithContext,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text || "Não consegui formular uma resposta literária no momento. Tente novamente!",
    });
  } catch (error: any) {
    console.error("Error in /api/ai/chat:", error);
    res.status(500).json({
      error: error?.message || "Erro ao consultar a IA Literária.",
    });
  }
});

// AI Recommendations Endpoint
app.post("/api/ai/recommend", async (req, res) => {
  try {
    const { favoriteGenres, likedBooks, mood, preferredPace, trope } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        recommendations: [
          {
            title: "A Biblioteca da Meia-Noite",
            author: "Matt Haig",
            genre: "Ficção Contemporânea / Fantasia",
            matchScore: 98,
            whyRead: "Uma reflexão sensível sobre escolhas e segundas chances que toca fundo qualquer leitor.",
            vibe: "Acolhedor & Reflexivo",
            hashtags: ["#BibliotecaDaMeiaNoite", "#LeiturasQueCuram", "#BookstagramBrasil"],
          },
          {
            title: "Torto Arado",
            author: "Itamar Vieira Junior",
            genre: "Literatura Brasileira Contemporânea",
            matchScore: 95,
            whyRead: "Uma narrativa magistral sobre ancestralidade, terra e resistência no sertão baiano.",
            vibe: "Profundo & Poético",
            hashtags: ["#TortoArado", "#LiteraturaNacional", "#LendoNacionais"],
          },
          {
            title: "Duna",
            author: "Frank Herbert",
            genre: "Ficção Científica Épica",
            matchScore: 92,
            whyRead: "O clássico supremo da ficção científica com política, ecologia e intrigas de tirar o fôlego.",
            vibe: "Grandioso & Imersivo",
            hashtags: ["#Duna", "#SciFiBrasil", "#ClassicosDaFiccao"],
          },
        ],
      });
    }

    const ai = getGenAI();
    const prompt = `Gere 3 a 4 recomendações literárias personalizadas de altíssima qualidade com base nestas preferências do leitor do SocialBooks:
- Gêneros favoritos: ${favoriteGenres?.join(", ") || "Variados"}
- Livros que amou: ${likedBooks || "Livros instigantes"}
- Clima/Humor desejado: ${mood || "Surpreendente"}
- Ritmo de leitura preferido: ${preferredPace || "Fluido"}
- Trope ou tema de interesse: ${trope || "Livre"}

Retorne APENAS um JSON estrito no seguinte formato:
{
  "recommendations": [
    {
      "title": "Nome do Livro",
      "author": "Nome do Autor",
      "genre": "Gênero Principal",
      "matchScore": 95,
      "whyRead": "Motivo conciso e sedutor para ler (2 frases)",
      "vibe": "3 a 4 palavras de sentimento (ex: Misterioso & Hipnotizante)",
      "tropes": ["Trope 1", "Trope 2"],
      "hashtags": ["#Tag1", "#Tag2", "#Tag3"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/ai/recommend:", error);
    res.status(500).json({ error: "Erro ao gerar recomendações." });
  }
});

// AI Bookstagram Post & Carousel Generator
app.post("/api/ai/generate-post", async (req, res) => {
  try {
    const { bookTitle, bookAuthor, postType, userNotes, rating, targetVibe } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        caption: `📖 Terminei "${bookTitle || "minha leitura recente"}" e preciso compartilhar essa experiência com vocês!\n\nNota: ⭐⭐⭐⭐⭐ (5/5)\n\nUma história envolvente que prende do primeiro ao último parágrafo. Os personagens são incrivelmente bem construídos e a escrita é daquelas que você não consegue largar.\n\n💬 Já leram essa obra? O que acharam do desfecho? Salvem esse post para colocar na lista de desejos!`,
        hashtags: ["#SocialBooks", "#BookstagramBrasil", "#ResenhaLiteraria", "#Lido", "#IndicaLivro", "#BookTokBR"],
        carouselSlides: [
          {
            slideNumber: 1,
            slideType: "hook",
            headline: `Por que "${bookTitle || "este livro"}" precisa estar na sua estante?`,
            bodyText: "Um gancho irresistível que vai mudar a sua lista de leituras este ano.",
            visualTip: "Foto da capa com iluminação aconchegante e xícara de café ao fundo.",
          },
          {
            slideNumber: 2,
            slideType: "synopsis",
            headline: "A Premissa Sem Spoilers",
            bodyText: "Uma jornada inesquecível de escolhas, segredos e reviravoltas emocionais.",
            visualTip: "Página aberta destacando uma frase marcante com marcador estético.",
          },
          {
            slideNumber: 3,
            slideType: "quote",
            headline: "Citação que ficou marcada",
            bodyText: "«As palavras certas no momento certo podem transformar qualquer destino.»",
            visualTip: "Cartão tipográfico minimalista com fundo neutro e elegante.",
          },
          {
            slideNumber: 4,
            slideType: "verdict",
            headline: "Veredito Final",
            bodyText: "Leitura obrigatória para quem ama narrativas que deixam ressaca literária boa!",
            visualTip: "Livro segurado com ambas as mãos em frente à estante cheia.",
          },
        ],
      });
    }

    const ai = getGenAI();
    const prompt = `Crie um conteúdo estético pronto para publicação no feed do Bookstagram do SocialBooks:
- Livro: "${bookTitle}" de ${bookAuthor}
- Tipo de postagem: ${postType || "carrossel"} (opções: carrossel, resenha_completa, citacao_estetica, indicacao_rapida)
- Anotações/Opinião do usuário: "${userNotes || "Adorei a leitura, personagens marcantes e final emocionante"}"
- Avaliação: ${rating || 5} de 5 estrelas
- Estética/Vibe: ${targetVibe || "Dark Academia e aconchegante"}

Retorne APENAS um JSON estrito no seguinte formato:
{
  "caption": "Legenda completa do post formatada com quebras de linha e emojis literários elegantes",
  "hashtags": ["#SocialBooks", "#BookTokBrasil", "#ResenhaLiteraria", "#IndicaLivro", "#Bookstagrammer"],
  "quoteSuggestion": "Uma citação marcante e memorável do livro",
  "carouselSlides": [
    {
      "slideNumber": 1,
      "slideType": "hook",
      "headline": "Título chamativo do Slide 1 (Gancho)",
      "bodyText": "Texto curto e cativante",
      "visualTip": "Sugestão de composição fotográfica/visual para o criador"
    },
    {
      "slideNumber": 2,
      "slideType": "plot",
      "headline": "Título do Slide 2",
      "bodyText": "Texto dos pontos fortes sem spoiler",
      "visualTip": "Sugestão visual"
    },
    {
      "slideNumber": 3,
      "slideType": "quote",
      "headline": "Título do Slide 3",
      "bodyText": "Destaque de frase ou trope",
      "visualTip": "Sugestão visual"
    },
    {
      "slideNumber": 4,
      "slideType": "verdict",
      "headline": "Slide 4: O Veredito & CTA",
      "bodyText": "Nota e chamada para engajamento nos comentários",
      "visualTip": "Sugestão visual"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/ai/generate-post:", error);
    res.status(500).json({ error: "Erro ao gerar post literário." });
  }
});

// AI Book Technical Datasheet & Spoiler-Free Summary
app.post("/api/ai/book-sheet", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Título ou autor é obrigatório." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        title: query,
        originalTitle: query,
        author: "Autor Renomado",
        authorBio: "Escritor premiado com diversas obras consagradas na literatura mundial.",
        publisher: "Editora Companhia das Letras / Rocco / Record",
        pages: 384,
        releaseYear: 2021,
        genres: ["Ficção", "Drama", "Contemporâneo"],
        tropes: ["Jornada de autodescoberta", "Segredos familiares"],
        contentWarnings: ["Sem gatilhos severos", "Temas de luto e reflexão existencial"],
        synopsisWithoutSpoilers: `Uma obra profunda e aclamada que aborda a condição humana com maestria singular. Acompanha personagens complexos enfrentando dilemas que ressoam em qualquer leitor apaixonado por boas narrativas.`,
        keyThemes: ["Identidade", "Tempo", "Escolhas", "Relações Humanas"],
        authorTrivia: ["O autor levou mais de 3 anos pesquisando para compor o universo da obra.", "Livro adaptado ou aclamado em múltiplos países."],
        recommendedIfYouLiked: ["Torto Arado", "A Biblioteca da Meia-Noite", "Cem Anos de Solidão"],
      });
    }

    const ai = getGenAI();
    const prompt = `Gere uma Ficha Técnica Completa, Resumo 100% Sem Spoilers e Curiosidades sobre a obra ou autor: "${query}".

Retorne APENAS um JSON estrito no seguinte formato:
{
  "title": "Título oficial em português",
  "originalTitle": "Título original",
  "author": "Nome do autor",
  "authorBio": "Biografia concisa do autor em 2 parágrafos",
  "publisher": "Principais editoras no Brasil",
  "pages": 360,
  "releaseYear": 2020,
  "genres": ["Gênero 1", "Gênero 2"],
  "tropes": ["Trope 1", "Trope 2"],
  "contentWarnings": ["Aviso de conteúdo 1", "Aviso 2"],
  "synopsisWithoutSpoilers": "Sinopse rica e envolvente de 2 a 3 parágrafos sem NENHUM spoiler de reviravoltas ou final",
  "keyThemes": ["Tema 1", "Tema 2", "Tema 3"],
  "authorTrivia": ["Curiosidade 1 sobre o autor ou escrita da obra", "Curiosidade 2", "Curiosidade 3"],
  "recommendedIfYouLiked": ["Livro A", "Livro B", "Livro C"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/ai/book-sheet:", error);
    res.status(500).json({ error: "Erro ao buscar ficha técnica do livro." });
  }
});

// Vite Middleware Integration for Dev / Static serving for Prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SocialBooks server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
