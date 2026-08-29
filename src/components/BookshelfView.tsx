import React, { useState } from 'react';
import { Book, ReadingStatus } from '../types';
import {
  BookOpen,
  CheckCircle2,
  Bookmark,
  RefreshCw,
  XCircle,
  Star,
  Plus,
  Search,
  Filter,
  Sparkles,
  Edit3,
  Flame,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookshelfViewProps {
  books: Book[];
  onBookClick: (book: Book) => void;
  onUpdateProgress: (bookId: string, newPage: number, markAsRead?: boolean) => void;
  onAddBook: () => void;
  onGeneratePostForBook: (book: Book) => void;
  onAskAIAboutBook: (book: Book) => void;
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({
  books,
  onBookClick,
  onUpdateProgress,
  onAddBook,
  onGeneratePostForBook,
  onAskAIAboutBook,
}) => {
  const [activeTab, setActiveTab] = useState<ReadingStatus | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('todos');
  const [updatingBook, setUpdatingBook] = useState<Book | null>(null);
  const [tempPage, setTempPage] = useState<number>(0);

  // Extract all unique genres
  const allGenres = Array.from(new Set(books.flatMap((b) => b.genres || [])));

  // Filter books
  const filteredBooks = books.filter((book) => {
    const matchesTab = activeTab === 'todos' ? true : book.status === activeTab;
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre =
      selectedGenre === 'todos' ? true : book.genres?.includes(selectedGenre);

    return matchesTab && matchesSearch && matchesGenre;
  });

  const getStatusCount = (status: ReadingStatus) =>
    books.filter((b) => b.status === status).length;

  const handleOpenProgressModal = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation();
    setUpdatingBook(book);
    setTempPage(book.currentPage);
  };

  const handleSaveProgress = () => {
    if (!updatingBook) return;
    const isFinished = tempPage >= updatingBook.totalPages;
    onUpdateProgress(updatingBook.id, tempPage, isFinished);

    if (isFinished) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }

    setUpdatingBook(null);
  };

  return (
    <div className="space-y-6">
      {/* Bookshelf Header & Skoob-style Stats Banner */}
      <div className="rounded-2xl border border-stone-800 bg-gradient-to-r from-stone-900 via-stone-850 to-amber-950/40 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <BookOpen className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-serif font-bold text-white tracking-tight">
                Estante Virtual Skoob
              </h2>
            </div>
            <p className="text-xs text-stone-400">
              Gerencie suas leituras ativas, livros lidos, metas e avaliações literárias.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddBook}
              id="btn-add-book-shelf"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Livro</span>
            </button>
          </div>
        </div>

        {/* Quick Shelf Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-6 pt-4 border-t border-stone-800/80">
          <button
            onClick={() => setActiveTab('lendo')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTab === 'lendo'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-stone-850/60 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium">Lendo Agora</span>
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-lg font-bold text-white mt-1 block">
              {getStatusCount('lendo')}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('lido')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTab === 'lido'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-stone-850/60 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium">Lidos</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-lg font-bold text-white mt-1 block">
              {getStatusCount('lido')}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('quero_ler')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTab === 'quero_ler'
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                : 'bg-stone-850/60 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium">Quero Ler</span>
              <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="text-lg font-bold text-white mt-1 block">
              {getStatusCount('quero_ler')}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('relendo')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTab === 'relendo'
                ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                : 'bg-stone-850/60 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium">Relendo</span>
              <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="text-lg font-bold text-white mt-1 block">
              {getStatusCount('relendo')}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('abandonado')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTab === 'abandonado'
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                : 'bg-stone-850/60 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium">Abandonados</span>
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <span className="text-lg font-bold text-white mt-1 block">
              {getStatusCount('abandonado')}
            </span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por título ou autor na estante..."
            className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Status Filter Dropdown / Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('todos')}
            className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'todos'
                ? 'bg-stone-100 text-stone-900'
                : 'bg-stone-850 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            Todos ({books.length})
          </button>

          {/* Genre select */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-stone-850 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-400"
          >
            <option value="todos">Todos os Gêneros</option>
            {allGenres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-5">
          {filteredBooks.map((book) => {
            const percentage = Math.min(
              Math.round((book.currentPage / book.totalPages) * 100),
              100
            );

            return (
              <div
                key={book.id}
                id={`book-card-${book.id}`}
                onClick={() => onBookClick(book)}
                className="group relative rounded-2xl border border-stone-800/80 bg-stone-900 overflow-hidden shadow-lg hover:shadow-amber-500/5 hover:border-amber-500/30 transition-all flex flex-col cursor-pointer"
              >
                {/* Book Cover */}
                <div className="relative aspect-[2/3] overflow-hidden bg-stone-950">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    {book.status === 'lendo' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold shadow-md">
                        Lendo ({percentage}%)
                      </span>
                    )}
                    {book.status === 'lido' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-stone-950 text-[10px] font-bold shadow-md">
                        Lido ⭐
                      </span>
                    )}
                    {book.status === 'quero_ler' && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-stone-100 text-[10px] font-medium shadow-md">
                        Quero Ler
                      </span>
                    )}
                    {book.status === 'relendo' && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500 text-stone-100 text-[10px] font-medium shadow-md">
                        Relendo
                      </span>
                    )}
                    {book.status === 'abandonado' && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-stone-100 text-[10px] font-medium shadow-md">
                        Abandonado
                      </span>
                    )}
                  </div>

                  {/* Quick AI Action on Cover Hover */}
                  <div className="absolute inset-0 bg-stone-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 gap-2 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onGeneratePostForBook(book);
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold flex items-center justify-center gap-1 shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Criar Post Feed</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAskAIAboutBook(book);
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs flex items-center justify-center gap-1 border border-stone-700"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Ficha com IA</span>
                    </button>
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="font-semibold text-xs md:text-sm text-stone-100 line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-stone-400 line-clamp-1">{book.author}</p>
                  </div>

                  {/* Reading Progress Bar for Active Books */}
                  {(book.status === 'lendo' || book.status === 'relendo') && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] text-stone-400">
                        <span>
                          Pág. {book.currentPage}/{book.totalPages}
                        </span>
                        <button
                          onClick={(e) => handleOpenProgressModal(book, e)}
                          className="text-amber-400 hover:underline flex items-center gap-0.5 font-medium"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          Atualizar
                        </button>
                      </div>
                      <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Rating for Read Books */}
                  {book.status === 'lido' && (
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < book.rating ? 'fill-amber-400' : 'text-stone-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {book.totalPages}p
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-800/80 bg-stone-900/60 p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-stone-600 mx-auto" />
          <h3 className="text-base font-semibold text-stone-200">Nenhum livro encontrado</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Não encontramos obras com estes filtros. Adicione um novo livro à sua estante ou peça
            recomendações à IA do SocialBooks!
          </p>
          <button
            onClick={onAddBook}
            className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-semibold hover:bg-amber-400 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Livro</span>
          </button>
        </div>
      )}

      {/* Progress Update Modal */}
      {updatingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-stone-900 border border-stone-800 p-6 space-y-5 text-stone-100 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-stone-100">Atualizar Progresso de Leitura</h3>
              <button
                onClick={() => setUpdatingBook(null)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-850 border border-stone-800">
              <img
                src={updatingBook.coverImage}
                alt={updatingBook.title}
                className="w-12 h-16 object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs text-white truncate">{updatingBook.title}</h4>
                <p className="text-[11px] text-stone-400">{updatingBook.author}</p>
                <p className="text-[11px] text-amber-400 mt-1 font-mono">
                  Total: {updatingBook.totalPages} páginas
                </p>
              </div>
            </div>

            {/* Slider and Number Input */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <label className="text-stone-300 font-medium">Página Atual:</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={updatingBook.totalPages}
                    value={tempPage}
                    onChange={(e) =>
                      setTempPage(
                        Math.min(
                          Math.max(0, parseInt(e.target.value) || 0),
                          updatingBook.totalPages
                        )
                      )
                    }
                    className="w-16 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-center text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-stone-500 text-xs">/ {updatingBook.totalPages}</span>
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={updatingBook.totalPages}
                value={tempPage}
                onChange={(e) => setTempPage(parseInt(e.target.value) || 0)}
                className="w-full accent-amber-500 cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-stone-400">
                <span>0%</span>
                <span className="font-bold text-amber-400">
                  {Math.round((tempPage / updatingBook.totalPages) * 100)}% concluído
                </span>
                <span>100%</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setTempPage(updatingBook.totalPages)}
                className="flex-1 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Marcar como Lido</span>
              </button>
            </div>

            <div className="flex gap-2 pt-2 border-t border-stone-800">
              <button
                onClick={() => setUpdatingBook(null)}
                className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProgress}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/20"
              >
                Salvar Progresso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
