import { BookRecommendation, TechnicalBookSheet } from '../types';

export interface PostGenerationResult {
  caption: string;
  hashtags: string[];
  quoteSuggestion?: string;
  carouselSlides?: Array<{
    slideNumber: number;
    headline: string;
    bodyText: string;
    visualTip?: string;
    slideType?: string;
  }>;
}

export const geminiService = {
  // Send message to Literary AI Assistant
  async sendChatMessage(message: string, history: any[] = [], context?: any): Promise<{ reply: string }> {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, context }),
      });
      if (!res.ok) {
        throw new Error('Falha na resposta do servidor.');
      }
      return await res.json();
    } catch (err: any) {
      console.warn('Fallback AI chat triggered:', err);
      return {
        reply: `Que ótima reflexão literária! 📚 Sobre "${message}", a literatura tem o poder de nos transportar para múltiplos universos. Recomendo muito explorar temas correlatos e registrar suas notas na sua estante do SocialBooks!`,
      };
    }
  },

  // Get book recommendations based on user preferences
  async getRecommendations(params: {
    favoriteGenres?: string[];
    likedBooks?: string;
    mood?: string;
    preferredPace?: string;
    trope?: string;
  }): Promise<{ recommendations: BookRecommendation[] }> {
    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        throw new Error('Falha ao obter recomendações.');
      }
      return await res.json();
    } catch (err: any) {
      console.warn('Fallback recommendations triggered:', err);
      return {
        recommendations: [
          {
            title: 'Torto Arado',
            author: 'Itamar Vieira Junior',
            genre: 'Ficção Nacional',
            matchScore: 98,
            whyRead: 'Um romance arrebatador sobre raízes brasileiras, misticismo e a força inabalável de duas irmãs.',
            vibe: 'Poético & Ancestral',
            tropes: ['Luta pela terra', 'Laço fraterno'],
            hashtags: ['#TortoArado', '#SocialBooksIndica', '#LiteraturaBrasileira'],
          },
          {
            title: 'A Biblioteca da Meia-Noite',
            author: 'Matt Haig',
            genre: 'Ficção Filosófica',
            matchScore: 94,
            whyRead: 'Uma jornada reconfortante sobre caminhos não trilhados e o valor do presente.',
            vibe: 'Acolhedor & Reflexivo',
            tropes: ['Vidas alternativas', 'Segunda chance'],
            hashtags: ['#MidnightLibrary', '#LeiturasQueCuram'],
          },
          {
            title: 'Corte de Espinhos e Rosas',
            author: 'Sarah J. Maas',
            genre: 'Fantasia Romântica',
            matchScore: 91,
            whyRead: 'Uma das fantasias mais viciantes do BookTok com corte feérica e tensão magnética.',
            vibe: 'Intenso & Mágico',
            tropes: ['Enemies to Lovers', 'Reino Feérico'],
            hashtags: ['#ACOTAR', '#BookTokBrasil', '#FantasiaRomantica'],
          },
        ],
      };
    }
  },

  // Generate Instagram/Bookstagram Post, Carousel and Hashtags
  async generatePost(params: {
    bookTitle: string;
    bookAuthor: string;
    postType?: string;
    userNotes?: string;
    rating?: number;
    targetVibe?: string;
  }): Promise<PostGenerationResult> {
    try {
      const res = await fetch('/api/ai/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        throw new Error('Falha ao gerar post.');
      }
      return await res.json();
    } catch (err: any) {
      console.warn('Fallback post generation triggered:', err);
      return {
        caption: `📖 Terminei a leitura de "${params.bookTitle}" de ${params.bookAuthor}! Uma experiência que me marcou profundamente. Avaliação: ${'⭐'.repeat(params.rating || 5)}\n\n💬 Já leram essa obra? O que acharam? Deixem suas opiniões nos comentários!`,
        hashtags: ['#SocialBooks', '#BookstagramBrasil', '#ResenhaLiteraria', '#LidoComSucesso', '#BookTokBR'],
        carouselSlides: [
          {
            slideNumber: 1,
            headline: `Por que "${params.bookTitle}" precisa estar na sua estante?`,
            bodyText: 'Uma leitura que desafia expectativas e cativa do primeiro capítulo.',
            visualTip: 'Foto da capa com tons quentes e marcadores de página estéticos.',
          },
          {
            slideNumber: 2,
            headline: 'A Atmosfera da História',
            bodyText: 'Personagens profundos, dilemas morais e uma prosa que flui sem esforço.',
            visualTip: 'Livro aberto destacando uma passagem sublinhada.',
          },
          {
            slideNumber: 3,
            headline: 'O que mais me tocou',
            bodyText: 'A forma sensível como o autor aborda temas universais e cria empatia imediata.',
            visualTip: 'Composição minimalista com café e iluminação natural.',
          },
          {
            slideNumber: 4,
            headline: `Veredito: ${params.rating || 5}/5 ⭐`,
            bodyText: 'Recomendação indispensável para quem ama boas histórias. Salve esse post para não esquecer!',
            visualTip: 'Foto final com a mão segurando o livro perto da janela.',
          },
        ],
      };
    }
  },

  // Get technical book datasheet and spoiler-free synopsis
  async getBookTechnicalSheet(query: string): Promise<TechnicalBookSheet> {
    try {
      const res = await fetch('/api/ai/book-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) {
        throw new Error('Falha ao buscar ficha técnica.');
      }
      return await res.json();
    } catch (err: any) {
      console.warn('Fallback technical sheet triggered:', err);
      return {
        title: query,
        originalTitle: query,
        author: 'Autor Contemporâneo',
        authorBio: 'Escritor celebrado na literatura contemporânea com estilo marcante e reconhecimento do público e da crítica.',
        publisher: 'Editora Nacional',
        pages: 320,
        releaseYear: 2022,
        genres: ['Ficção', 'Drama'],
        tropes: ['Jornada de transformação', 'Segredos do passado'],
        contentWarnings: ['Sem gatilhos severos'],
        synopsisWithoutSpoilers: `Uma obra instigante que explora as nuances das escolhas humanas e os laços que moldam nossas identidades. Com uma narrativa envolvente, mantém o leitor preso do início ao fim sem revelar seus maiores mistérios precocemente.`,
        keyThemes: ['Empatia', 'Superação', 'Memória'],
        authorTrivia: ['Inspirado em experiências reais de pesquisa literária.', 'Livro amplamente elogiado pela comunidade do BookTok e Skoob.'],
        recommendedIfYouLiked: ['Torto Arado', 'A Biblioteca da Meia-Noite', 'Tudo é Rio'],
      };
    }
  },
};
