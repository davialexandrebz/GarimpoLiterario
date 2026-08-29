import React, { useState } from 'react';
import { Book, BookRecommendation, TechnicalBookSheet } from '../types';
import {
  Sparkles,
  Compass,
  Layers,
  FileText,
  Edit,
  Star,
  Search,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Tag,
  ShieldAlert,
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { CarouselPost } from './CarouselPost';

interface AIStudioViewProps {
  books: Book[];
  onOpenCreatePost: (preselectedBook?: Book) => void;
  onBookClick: (book: Book) => void;
}

export const AIStudioView: React.FC<AIStudioViewProps> = ({
  books,
  onOpenCreatePost,
  onBookClick,
}) => {
  const [activeTab, setActiveTab] = useState<'recs' | 'carousel' | 'sheet' | 'review'>('recs');

  // Tab 1: Recommendations State
  const [recMood, setRecMood] = useState('Surpreendente com reviravoltas');
  const [recTrope, setRecTrope] = useState('Enemies to lovers ou segredo de família');
  const [recPace, setRecPace] = useState('Fluido e viciante');
  const [likedBooksInput, setLikedBooksInput] = useState('Torto Arado, Evelyn Hugo');
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Tab 2: Carousel Generator State
  const [carouselBookTitle, setCarouselBookTitle] = useState('A Biblioteca da Meia-Noite');
  const [carouselBookAuthor, setCarouselBookAuthor] = useState('Matt Haig');
  const [carouselVibe, setCarouselVibe] = useState('Dark Academia e aconchegante');
  const [generatedSlides, setGeneratedSlides] = useState<any[]>([]);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [loadingCarousel, setLoadingCarousel] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Tab 3: Technical Sheet State
  const [sheetQuery, setSheetQuery] = useState('Tudo é Rio de Carla Madeira');
  const [techSheet, setTechSheet] = useState<TechnicalBookSheet | null>(null);
  const [loadingSheet, setLoadingSheet] = useState(false);

  // Tab 4: Review Polisher State
  const [reviewInput, setReviewInput] = useState(
    'Amei o livro, personagens muito bem construídos e o final me fez chorar. Recomendo muito.'
  );
  const [reviewBook, setReviewBook] = useState('Torto Arado');
  const [polishedReview, setPolishedReview] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);

  // Handler: Generate Recommendations
  const handleGenerateRecs = async () => {
    setLoadingRecs(true);
    try {
      const res = await geminiService.getRecommendations({
        mood: recMood,
        trope: recTrope,
        preferredPace: recPace,
        likedBooks: likedBooksInput,
      });
      if (res.recommendations) {
        setRecommendations(res.recommendations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecs(false);
    }
  };

  // Handler: Generate Carousel
  const handleGenerateCarousel = async () => {
    setLoadingCarousel(true);
    try {
      const res = await geminiService.generatePost({
        bookTitle: carouselBookTitle,
        bookAuthor: carouselBookAuthor,
        targetVibe: carouselVibe,
        postType: 'carousel',
      });
      if (res.carouselSlides) {
        setGeneratedSlides(
          res.carouselSlides.map((s, idx) => ({
            id: `gen-${idx}`,
            slideNumber: s.slideNumber || idx + 1,
            headline: s.headline,
            bodyText: s.bodyText,
            visualTip: s.visualTip,
            slideType: s.slideType || 'custom',
          }))
        );
      }
      if (res.caption) setGeneratedCaption(res.caption);
      if (res.hashtags) setGeneratedTags(res.hashtags);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCarousel(false);
    }
  };

  // Handler: Fetch Technical Sheet
  const handleFetchSheet = async () => {
    if (!sheetQuery.trim()) return;
    setLoadingSheet(true);
    try {
      const res = await geminiService.getBookTechnicalSheet(sheetQuery);
      setTechSheet(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSheet(false);
    }
  };

  // Handler: Polish Review
  const handlePolishReview = async () => {
    setLoadingReview(true);
    try {
      const res = await geminiService.sendChatMessage(
        `Por favor, transforme estas notas brutas de leitura em uma resenha estonteante e bem estruturada para o Skoob e Bookstagram para a obra "${reviewBook}":\n"${reviewInput}"\n\nInclua: Visão geral da atmosfera, análise de personagens, ritmo da narrativa, impacto emocional, frase memorável destacada e nota final recomendada.`
      );
      setPolishedReview(res.reply);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReview(false);
    }
  };

  return (
    <div className="space-y-6 text-stone-100">
      {/* AI Studio Header Banner */}
      <div className="rounded-2xl border border-stone-800 bg-gradient-to-r from-stone-900 via-stone-850 to-amber-950/50 p-6 md:p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-stone-950 shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
              AI Studio Literário SocialBooks
            </h2>
            <p className="text-xs text-stone-400">
              Ferramentas de inteligência artificial criadas exclusivamente para a comunidade
              leitora.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-4 border-t border-stone-800">
          <button
            onClick={() => setActiveTab('recs')}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'recs'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                : 'bg-stone-850 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Recomendações IA</span>
          </button>

          <button
            onClick={() => setActiveTab('carousel')}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'carousel'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                : 'bg-stone-850 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Gerador de Carrossel</span>
          </button>

          <button
            onClick={() => setActiveTab('sheet')}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'sheet'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                : 'bg-stone-850 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Fichas & Curiosidades</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'review'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                : 'bg-stone-850 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Edit className="w-4 h-4" />
            <span>Lapidador de Resenhas</span>
          </button>
        </div>
      </div>

      {/* TAB 1: RECOMMENDATIONS */}
      {activeTab === 'recs' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Descubra sua Próxima Leitura Perfeita</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Humor ou Vibe desejada:</label>
                <input
                  type="text"
                  value={recMood}
                  onChange={(e) => setRecMood(e.target.value)}
                  placeholder="Ex: Acolhedor, melancólico, de tirar o fôlego..."
                  className="w-full bg-stone-850 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Tropos / Temas de interesse:</label>
                <input
                  type="text"
                  value={recTrope}
                  onChange={(e) => setRecTrope(e.target.value)}
                  placeholder="Ex: Enemies to lovers, viagem no tempo, família disfuncional..."
                  className="w-full bg-stone-850 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Livros que você já amou:</label>
                <input
                  type="text"
                  value={likedBooksInput}
                  onChange={(e) => setLikedBooksInput(e.target.value)}
                  placeholder="Ex: Torto Arado, Duna, A Hora da Estrela..."
                  className="w-full bg-stone-850 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Ritmo de leitura:</label>
                <input
                  type="text"
                  value={recPace}
                  onChange={(e) => setRecPace(e.target.value)}
                  placeholder="Ex: Fluido, capítulos curtos, denso e poético..."
                  className="w-full bg-stone-850 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateRecs}
              disabled={loadingRecs}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${loadingRecs ? 'animate-spin' : ''}`} />
              <span>{loadingRecs ? 'Analisando Catálogo Literário...' : 'Gerar Recomendações'}</span>
            </button>
          </div>

          {/* Recommendations Cards Grid */}
          {recommendations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-stone-800 bg-stone-900 p-5 space-y-3 flex flex-col justify-between hover:border-amber-500/30 transition-all shadow-xl"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                        {rec.matchScore}% de Afinidade
                      </span>
                      <span className="text-[11px] text-stone-400">{rec.genre}</span>
                    </div>

                    <h4 className="font-serif font-bold text-lg text-white">{rec.title}</h4>
                    <p className="text-xs text-amber-400 font-medium">{rec.author}</p>

                    <p className="text-xs text-stone-300 leading-relaxed font-sans pt-1">
                      {rec.whyRead}
                    </p>

                    {/* Vibe badge */}
                    <div className="p-2 rounded-lg bg-stone-850 border border-stone-800 text-[11px] text-stone-300">
                      <strong>Vibe:</strong> {rec.vibe}
                    </div>

                    {/* Tropes */}
                    {rec.tropes && rec.tropes.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {rec.tropes.map((t, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 text-[10px]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                    <button
                      onClick={() => onOpenCreatePost()}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                    >
                      <span>Criar Post sobre este livro</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CAROUSEL GENERATOR */}
      {activeTab === 'carousel' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Gerador de Carrossel Bookstagram</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-stone-300 font-medium">Título do Livro:</label>
                <input
                  type="text"
                  value={carouselBookTitle}
                  onChange={(e) => setCarouselBookTitle(e.target.value)}
                  className="w-full bg-stone-850 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-medium">Autor:</label>
                <input
                  type="text"
                  value={carouselBookAuthor}
                  onChange={(e) => setCarouselBookAuthor(e.target.value)}
                  className="w-full bg-stone-850 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-medium">Estética / Vibe:</label>
                <select
                  value={carouselVibe}
                  onChange={(e) => setCarouselVibe(e.target.value)}
                  className="w-full bg-stone-850 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Dark Academia e reflexivo">Dark Academia & Reflexivo</option>
                  <option value="Cozy Cottagecore e aconchegante">Cozy Cottagecore & Café</option>
                  <option value="Minimalista e elegante">Minimalista & Elegante</option>
                  <option value="Épico e arrebatador">Fantasia Épica & Mágica</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateCarousel}
              disabled={loadingCarousel}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${loadingCarousel ? 'animate-spin' : ''}`} />
              <span>{loadingCarousel ? 'Criando Slides & Legenda...' : 'Gerar Carrossel Completo'}</span>
            </button>
          </div>

          {/* Generated Carousel Results */}
          {generatedSlides.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Carousel Preview */}
              <div>
                <h4 className="text-sm font-semibold text-stone-300 mb-2">
                  Pré-visualização dos Slides:
                </h4>
                <CarouselPost
                  slides={generatedSlides}
                  bookTitle={carouselBookTitle}
                  bookAuthor={carouselBookAuthor}
                />
              </div>

              {/* Right: Caption & Copy Tools */}
              <div className="space-y-4 rounded-2xl border border-stone-800 bg-stone-900 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-amber-300">
                      Legenda Sugerida pela IA:
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${generatedCaption}\n\n${generatedTags.join(' ')}`
                        );
                        setCopiedCaption(true);
                        setTimeout(() => setCopiedCaption(false), 2000);
                      }}
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1"
                    >
                      {copiedCaption ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Legenda</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-stone-200 whitespace-pre-line leading-relaxed font-sans p-3 bg-stone-850 rounded-xl border border-stone-800">
                    {generatedCaption}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {generatedTags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20 font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onOpenCreatePost()}
                  className="mt-4 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Publicar no Feed do SocialBooks</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TECHNICAL SHEET & TRIVIA */}
      {activeTab === 'sheet' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Consultar Ficha Técnica & Curiosidades sem Spoilers</span>
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={sheetQuery}
                onChange={(e) => setSheetQuery(e.target.value)}
                placeholder="Digite o nome de qualquer livro ou autor..."
                className="flex-1 bg-stone-850 border border-stone-700 rounded-xl px-4 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleFetchSheet}
                disabled={loadingSheet}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{loadingSheet ? 'Consultando...' : 'Buscar'}</span>
              </button>
            </div>
          </div>

          {techSheet && (
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6 space-y-5">
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-400 font-mono">
                  Ficha Técnica Oficial
                </span>
                <h3 className="text-2xl font-serif font-bold text-white mt-1">
                  {techSheet.title}
                </h3>
                <p className="text-sm text-stone-400">{techSheet.author}</p>
              </div>

              {/* Stats pill list */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-stone-850 border border-stone-800">
                  <span className="text-stone-500 block text-[10px]">Páginas</span>
                  <span className="font-semibold text-stone-200">{techSheet.pages} pág.</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-850 border border-stone-800">
                  <span className="text-stone-500 block text-[10px]">Publicação</span>
                  <span className="font-semibold text-stone-200">{techSheet.releaseYear}</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-850 border border-stone-800">
                  <span className="text-stone-500 block text-[10px]">Editora</span>
                  <span className="font-semibold text-stone-200">{techSheet.publisher}</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-850 border border-stone-800">
                  <span className="text-stone-500 block text-[10px]">Gênero</span>
                  <span className="font-semibold text-amber-400">
                    {techSheet.genres?.join(', ')}
                  </span>
                </div>
              </div>

              {/* Spoiler-Free Synopsis */}
              <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-1.5">
                <h4 className="font-semibold text-amber-400 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Sinopse 100% Sem Spoilers
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed font-sans">
                  {techSheet.synopsisWithoutSpoilers}
                </p>
              </div>

              {/* Content Warnings */}
              {techSheet.contentWarnings && techSheet.contentWarnings.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-200 text-xs space-y-1">
                  <span className="font-semibold flex items-center gap-1 text-rose-400">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Avisos de Gatilho e Conteúdo:
                  </span>
                  <ul className="list-disc list-inside text-[11px] text-rose-200/80">
                    {techSheet.contentWarnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Author Trivia */}
              {techSheet.authorTrivia && techSheet.authorTrivia.length > 0 && (
                <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-2 text-xs">
                  <h4 className="font-semibold text-white">Curiosidades da Criação da Obra</h4>
                  <ul className="space-y-1">
                    {techSheet.authorTrivia.map((trivia, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-stone-300">
                        <span className="text-amber-400">•</span>
                        <span>{trivia}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REVIEW POLISHER */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Edit className="w-4 h-4 text-amber-400" />
              <span>Lapidador de Resenhas Literárias</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-medium block mb-1">Livro Resenhado:</label>
                <input
                  type="text"
                  value={reviewBook}
                  onChange={(e) => setReviewBook(e.target.value)}
                  className="w-full bg-stone-850 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-stone-300 font-medium block mb-1">
                  Suas notas / impressões livres:
                </label>
                <textarea
                  value={reviewInput}
                  onChange={(e) => setReviewInput(e.target.value)}
                  rows={4}
                  className="w-full bg-stone-850 border border-stone-700 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                onClick={handlePolishReview}
                disabled={loadingReview}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${loadingReview ? 'animate-spin' : ''}`} />
                <span>{loadingReview ? 'Lapidando Resenha com IA...' : 'Lapidar Resenha'}</span>
              </button>
            </div>
          </div>

          {polishedReview && (
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400">
                  Resenha Estruturada Pronta para o Skoob / Feed:
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(polishedReview);
                  }}
                  className="text-xs text-stone-400 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 text-xs text-stone-200 whitespace-pre-line leading-relaxed font-sans">
                {polishedReview}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
