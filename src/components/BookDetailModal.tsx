import React, { useState } from 'react';
import { Book, ReadingStatus, TechnicalBookSheet } from '../types';
import {
  X,
  Star,
  BookOpen,
  Sparkles,
  ShieldAlert,
  Tag,
  Calendar,
  Layers,
  Building,
  Quote,
  Share2,
  Edit3,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
  onUpdateStatus: (status: ReadingStatus) => void;
  onUpdateRating: (rating: number) => void;
  onGeneratePost: (book: Book) => void;
  onAskAI: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onUpdateStatus,
  onUpdateRating,
  onGeneratePost,
  onAskAI,
}) => {
  const [activeTab, setActiveTab] = useState<'sobre' | 'ficha_ai' | 'anotacoes'>('sobre');
  const [techSheet, setTechSheet] = useState<TechnicalBookSheet | null>(null);
  const [loadingTechSheet, setLoadingTechSheet] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [notesList, setNotesList] = useState(book.notes || []);

  const handleFetchTechSheet = async () => {
    if (techSheet) return;
    setLoadingTechSheet(true);
    try {
      const data = await geminiService.getBookTechnicalSheet(`${book.title} de ${book.author}`);
      setTechSheet(data);
    } catch (err) {
      console.error('Error fetching book sheet:', err);
    } finally {
      setLoadingTechSheet(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const note = {
      id: `note-${Date.now()}`,
      page: book.currentPage,
      content: newNote.trim(),
      date: new Date().toISOString().split('T')[0],
    };
    setNotesList([note, ...notesList]);
    setNewNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl text-stone-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-stone-800 bg-stone-850">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Ficha do Livro & Skoob Stats
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Top Hero Section */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Book Cover */}
            <div className="w-36 sm:w-44 shrink-0 rounded-xl overflow-hidden shadow-2xl border border-stone-800 mx-auto sm:mx-0">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full aspect-[2/3] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Book Metadata & Reading Actions */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white leading-tight">
                  {book.title}
                </h2>
                {book.originalTitle && book.originalTitle !== book.title && (
                  <p className="text-xs text-stone-500 italic">Original: {book.originalTitle}</p>
                )}
                <p className="text-sm font-medium text-amber-400 mt-1">{book.author}</p>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">Status na Estante:</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'lendo', label: 'Lendo' },
                    { id: 'lido', label: 'Lido' },
                    { id: 'quero_ler', label: 'Quero Ler' },
                    { id: 'relendo', label: 'Relendo' },
                    { id: 'abandonado', label: 'Abandonado' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onUpdateStatus(s.id as ReadingStatus)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        book.status === s.id
                          ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md'
                          : 'bg-stone-850 text-stone-400 border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Selector */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-semibold text-stone-300">Minha Avaliação:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => onUpdateRating(star)}
                      className="text-stone-700 hover:text-amber-400 transition-colors"
                      title={`${star} estrelas`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= book.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => onGeneratePost(book)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Criar Post Bookstagram</span>
                </button>

                <button
                  onClick={() => onAskAI(book)}
                  className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold border border-stone-700 flex items-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Perguntar à IA Literária</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-stone-850/80 border border-stone-800 text-xs">
            <div className="flex items-center gap-2 text-stone-400">
              <Layers className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-stone-500 block text-[10px]">Páginas</span>
                <span className="font-semibold text-stone-200">{book.totalPages} pág.</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-stone-400">
              <Building className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-stone-500 block text-[10px]">Editora</span>
                <span className="font-semibold text-stone-200">{book.publisher || 'Nacional'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-stone-400">
              <Calendar className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-stone-500 block text-[10px]">Ano</span>
                <span className="font-semibold text-stone-200">{book.year || '2020'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-stone-400">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-stone-500 block text-[10px]">Progresso</span>
                <span className="font-semibold text-amber-400">
                  {Math.round((book.currentPage / book.totalPages) * 100)}% lido
                </span>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-stone-800">
            <button
              onClick={() => setActiveTab('sobre')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'sobre'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Sinopse & Detalhes
            </button>
            <button
              onClick={() => {
                setActiveTab('ficha_ai');
                handleFetchTechSheet();
              }}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'ficha_ai'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ficha Técnica IA (Sem Spoilers)</span>
            </button>
            <button
              onClick={() => setActiveTab('anotacoes')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'anotacoes'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Anotações de Leitura ({notesList.length})
            </button>
          </div>

          {/* Tab 1: Sobre / Sinopse */}
          {activeTab === 'sobre' && (
            <div className="space-y-4 text-xs leading-relaxed text-stone-300">
              <div>
                <h4 className="font-semibold text-stone-100 text-sm mb-1.5">Sinopse da Obra</h4>
                <p className="whitespace-pre-line text-stone-300 leading-relaxed font-sans">
                  {book.synopsis ||
                    'Uma narrativa cativante e envolvente que mergulha em temas humanos profundos, com personagens multifacetados e ritmo memorável.'}
                </p>
              </div>

              {/* Tropes & Tags */}
              {book.tropes && book.tropes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-stone-100 mb-1.5 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    Tropos Literários
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {book.tropes.map((trope, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full bg-stone-800 text-amber-300 text-[11px] border border-stone-700"
                      >
                        {trope}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Warnings */}
              {book.contentWarnings && book.contentWarnings.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-200">
                  <h4 className="font-semibold flex items-center gap-1.5 mb-1 text-rose-300">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Avisos de Gatilho / Conteúdo
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-200/80">
                    {book.contentWarnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Favorite Quote */}
              {book.favoriteQuote && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-200">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                    <Quote className="w-4 h-4" />
                    <span>Citação Favorita Marcada</span>
                  </div>
                  <p className="font-serif italic text-sm text-amber-100">{book.favoriteQuote}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Ficha Técnica IA */}
          {activeTab === 'ficha_ai' && (
            <div className="space-y-4 text-xs">
              {loadingTechSheet ? (
                <div className="p-12 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  <p className="text-stone-300 font-medium">
                    A IA Literária do SocialBooks está compilando a ficha técnica e curiosidades sem
                    spoilers...
                  </p>
                </div>
              ) : techSheet ? (
                <div className="space-y-4">
                  {/* Spoiler-free synopsis */}
                  <div className="p-4 rounded-xl bg-stone-850 border border-stone-800">
                    <h4 className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Visão Geral Sem Spoilers
                    </h4>
                    <p className="text-stone-300 leading-relaxed font-sans">
                      {techSheet.synopsisWithoutSpoilers}
                    </p>
                  </div>

                  {/* Author Bio */}
                  <div className="p-4 rounded-xl bg-stone-850 border border-stone-800">
                    <h4 className="font-semibold text-stone-100 mb-1">
                      Sobre o Autor: {techSheet.author}
                    </h4>
                    <p className="text-stone-400 leading-relaxed">{techSheet.authorBio}</p>
                  </div>

                  {/* Author Trivia */}
                  {techSheet.authorTrivia && techSheet.authorTrivia.length > 0 && (
                    <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-1.5">
                      <h4 className="font-semibold text-amber-400">Curiosidades Literárias</h4>
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

                  {/* Recommended if you liked */}
                  {techSheet.recommendedIfYouLiked && techSheet.recommendedIfYouLiked.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-950/15 border border-amber-900/30">
                      <h4 className="font-semibold text-amber-300 mb-1.5">
                        Leia também se você gostou deste livro:
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {techSheet.recommendedIfYouLiked.map((rec, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-200 text-xs border border-stone-700"
                          >
                            📖 {rec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8">
                  <button
                    onClick={handleFetchTechSheet}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold hover:bg-amber-400"
                  >
                    Gerar Ficha Técnica com IA
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Anotações de Leitura */}
          {activeTab === 'anotacoes' && (
            <div className="space-y-4">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={`Adicionar anotação ou citação da página ${book.currentPage}...`}
                  rows={2}
                  className="w-full bg-stone-850 border border-stone-700 rounded-xl p-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold disabled:opacity-40"
                >
                  Salvar Anotação
                </button>
              </form>

              {/* Notes List */}
              <div className="space-y-2.5">
                {notesList.length > 0 ? (
                  notesList.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-xl bg-stone-850 border border-stone-800 text-xs space-y-1"
                    >
                      <div className="flex justify-between text-[11px] text-amber-400 font-mono">
                        <span>Pág. {note.page}</span>
                        <span className="text-stone-500">{note.date}</span>
                      </div>
                      <p className="text-stone-200">{note.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-500 text-center py-4">
                    Nenhuma anotação registrada para este livro ainda.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
