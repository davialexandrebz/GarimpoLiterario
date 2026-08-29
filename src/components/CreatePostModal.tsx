import React, { useState } from 'react';
import { Book, Post, PostType, QuoteTheme } from '../types';
import {
  X,
  Sparkles,
  Layers,
  Quote,
  Star,
  Image as ImageIcon,
  Check,
  Send,
  Plus,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { CarouselPost } from './CarouselPost';
import { QuoteCard } from './QuoteCard';

interface CreatePostModalProps {
  books: Book[];
  preselectedBook?: Book | null;
  onClose: () => void;
  onSubmitPost: (newPost: Partial<Post>) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  books,
  preselectedBook,
  onClose,
  onSubmitPost,
}) => {
  const [postType, setPostType] = useState<PostType>('carousel');
  const [selectedBookId, setSelectedBookId] = useState<string>(
    preselectedBook?.id || (books[0]?.id ?? '')
  );
  const [customBookTitle, setCustomBookTitle] = useState(preselectedBook?.title || '');
  const [customBookAuthor, setCustomBookAuthor] = useState(preselectedBook?.author || '');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([
    '#SocialBooks',
    '#BookstagramBrasil',
    '#BookTokBR',
    '#LidoComSucesso',
  ]);
  const [tagInput, setTagInput] = useState('');
  const [rating, setRating] = useState(5);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [quoteText, setQuoteText] = useState(
    preselectedBook?.favoriteQuote || 'O amor pela leitura é a ponte para infinitos mundos.'
  );
  const [quoteTheme, setQuoteTheme] = useState<QuoteTheme>('dark-academia');

  // Slides for Carousel
  const [slides, setSlides] = useState([
    {
      id: 's1',
      slideNumber: 1,
      headline: 'Por que este livro vai marcar seu ano?',
      bodyText: 'Uma leitura arrebatadora que desafia expectativas.',
      visualTip: 'Foto da capa com xícara de café e luz suave.',
      slideType: 'hook' as const,
    },
    {
      id: 's2',
      slideNumber: 2,
      headline: 'A Premissa Central',
      bodyText: 'Segredos profundos, personagens humanos e reviravoltas intensas.',
      visualTip: 'Página aberta com marca-texto estético.',
      slideType: 'synopsis' as const,
    },
    {
      id: 's3',
      slideNumber: 3,
      headline: 'Citação Inesquecível',
      bodyText: '«As palavras certas no momento certo curam qualquer ferida.»',
      visualTip: 'Composição de flatlay minimalista.',
      slideType: 'quote' as const,
    },
    {
      id: 's4',
      slideNumber: 4,
      headline: 'Veredito: 5/5 ⭐',
      bodyText: 'Leitura essencial! Já colocou na sua estante do SocialBooks?',
      visualTip: 'Livro seguro com as duas mãos.',
      slideType: 'verdict' as const,
    },
  ]);

  const activeBook = books.find((b) => b.id === selectedBookId);
  const currentTitle = customBookTitle || activeBook?.title || 'Meu Livro Favorito';
  const currentAuthor = customBookAuthor || activeBook?.author || 'Autor Consagrado';
  const currentCover = activeBook?.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80';

  // AI Generator Handler
  const handleAIGenerate = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await geminiService.generatePost({
        bookTitle: currentTitle,
        bookAuthor: currentAuthor,
        postType: postType,
        rating: rating,
        userNotes: activeBook?.userReview || 'Uma leitura memorável e tocante.',
      });

      if (res.caption) setCaption(res.caption);
      if (res.hashtags && res.hashtags.length > 0) setHashtags(res.hashtags);
      if (res.quoteSuggestion) setQuoteText(res.quoteSuggestion);
      if (res.carouselSlides && res.carouselSlides.length > 0) {
        setSlides(
          res.carouselSlides.map((s, idx) => ({
            id: `s-${idx}-${Date.now()}`,
            slideNumber: s.slideNumber || idx + 1,
            headline: s.headline,
            bodyText: s.bodyText,
            visualTip: s.visualTip,
            slideType: (s.slideType as any) || 'custom',
          }))
        );
      }
    } catch (err) {
      console.error('Error generating AI post:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const formatted = tagInput.startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`;
      if (formatted.length > 1 && !hashtags.includes(formatted)) {
        setHashtags([...hashtags, formatted]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setHashtags(hashtags.filter((t) => t !== tagToRemove));
  };

  const handlePublish = () => {
    const postPayload: Partial<Post> = {
      id: `post-${Date.now()}`,
      type: postType,
      bookTitle: currentTitle,
      bookAuthor: currentAuthor,
      bookCover: currentCover,
      rating: rating,
      caption: caption || `Compartilhando minha leitura de "${currentTitle}" no SocialBooks! ✨`,
      hashtags: hashtags,
      timestamp: 'Agora mesmo',
      likes: 1,
      isLiked: true,
      isSaved: false,
      commentsCount: 0,
      comments: [],
    };

    if (postType === 'carousel') {
      postPayload.carouselSlides = slides;
    } else if (postType === 'quote') {
      postPayload.quoteCard = {
        quote: quoteText,
        bookTitle: currentTitle,
        bookAuthor: currentAuthor,
        pageNumber: activeBook?.currentPage,
        theme: quoteTheme,
      };
    }

    onSubmitPost(postPayload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl text-stone-100 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-stone-800 bg-stone-850">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif font-bold text-sm text-white">
              Bookstagram Creator Studio
            </h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Post Type Selector */}
          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-2">
              Escolha o Formato do Post:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPostType('carousel')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-medium ${
                  postType === 'carousel'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-stone-850 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Layers className="w-5 h-5" />
                <span>Carrossel (Slides)</span>
              </button>

              <button
                type="button"
                onClick={() => setPostType('quote')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-medium ${
                  postType === 'quote'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-stone-850 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Quote className="w-5 h-5" />
                <span>Citação Estética</span>
              </button>

              <button
                type="button"
                onClick={() => setPostType('review')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-medium ${
                  postType === 'review'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-stone-850 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Star className="w-5 h-5" />
                <span>Resenha / Foto</span>
              </button>
            </div>
          </div>

          {/* Book Selector & AI Auto-Generate Prompt */}
          <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Livro em Destaque:</span>
              </label>

              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={isGeneratingAI}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-stone-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAI ? 'Gerando com IA...' : 'Gerar Post Completo com IA'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  value={selectedBookId}
                  onChange={(e) => {
                    setSelectedBookId(e.target.value);
                    const b = books.find((item) => item.id === e.target.value);
                    if (b) {
                      setCustomBookTitle(b.title);
                      setCustomBookAuthor(b.author);
                      if (b.favoriteQuote) setQuoteText(b.favoriteQuote);
                      if (b.rating) setRating(b.rating);
                    }
                  }}
                  className="w-full bg-stone-900 border border-stone-750 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Selecionar da minha estante --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.author})
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">Nota:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-stone-700 hover:text-amber-400"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Type-Specific Editor */}
          {postType === 'carousel' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-300">
                  Slides do Carrossel ({slides.length} slides)
                </span>
              </div>

              {/* Live Preview of Carousel */}
              <div className="border border-stone-800 rounded-2xl p-4 bg-stone-950">
                <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-2 font-mono">
                  Pré-visualização do Feed:
                </p>
                <CarouselPost
                  slides={slides}
                  bookTitle={currentTitle}
                  bookAuthor={currentAuthor}
                />
              </div>

              {/* Editable Slide Cards */}
              <div className="space-y-3">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className="p-3.5 rounded-xl bg-stone-850 border border-stone-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-400">
                        Slide {index + 1} ({slide.slideType})
                      </span>
                    </div>

                    <input
                      type="text"
                      value={slide.headline}
                      onChange={(e) => {
                        const updated = [...slides];
                        updated[index].headline = e.target.value;
                        setSlides(updated);
                      }}
                      placeholder="Título do Slide"
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />

                    <textarea
                      value={slide.bodyText}
                      onChange={(e) => {
                        const updated = [...slides];
                        updated[index].bodyText = e.target.value;
                        setSlides(updated);
                      }}
                      rows={2}
                      placeholder="Texto do Slide"
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {postType === 'quote' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-300">Citação Marcante:</label>
                <textarea
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  rows={3}
                  placeholder="Digite a frase marcante do livro..."
                  className="w-full bg-stone-850 border border-stone-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Theme Selector */}
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1.5">
                  Estética do Cartão:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(
                    [
                      { id: 'dark-academia', label: 'Dark Academia' },
                      { id: 'vintage-library', label: 'Vintage' },
                      { id: 'cottagecore', label: 'Cottagecore' },
                      { id: 'minimal-modern', label: 'Minimal' },
                      { id: 'romantic-rose', label: 'Romance' },
                      { id: 'midnight-sky', label: 'Midnight' },
                    ] as const
                  ).map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setQuoteTheme(theme.id)}
                      className={`p-2 rounded-xl text-[11px] font-medium border transition-all text-center ${
                        quoteTheme === theme.id
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                          : 'border-stone-800 bg-stone-850 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview of Quote Card */}
              <div className="border border-stone-800 rounded-2xl p-4 bg-stone-950">
                <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-2 font-mono">
                  Pré-visualização da Citação:
                </p>
                <QuoteCard
                  data={{
                    quote: quoteText,
                    bookTitle: currentTitle,
                    bookAuthor: currentAuthor,
                    pageNumber: activeBook?.currentPage,
                    theme: quoteTheme,
                  }}
                />
              </div>
            </div>
          )}

          {/* Caption & Hashtags */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <label className="text-xs font-semibold text-stone-300 block">
              Legenda do Post (com auxílio da IA):
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              placeholder="Escreva a legenda para o feed ou clique em 'Gerar Post Completo com IA'..."
              className="w-full bg-stone-850 border border-stone-700 rounded-xl p-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
            />

            {/* Hashtags editor */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-400">Hashtags Literárias Sugeridas:</label>
              <div className="flex flex-wrap gap-1.5 items-center">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-400"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+ tag e Enter"
                  className="bg-stone-850 border border-stone-700 rounded-full px-3 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-400 w-28"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-stone-800 bg-stone-850">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publicar no SocialBooks</span>
          </button>
        </div>
      </div>
    </div>
  );
};
