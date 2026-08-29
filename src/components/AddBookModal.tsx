import React, { useState } from 'react';
import { Book, ReadingStatus } from '../types';
import { X, Plus, BookOpen, Star, Sparkles, Image as ImageIcon } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface AddBookModalProps {
  onClose: () => void;
  onAddBook: (book: Book) => void;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({ onClose, onAddBook }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [totalPages, setTotalPages] = useState(320);
  const [currentPage, setCurrentPage] = useState(0);
  const [status, setStatus] = useState<ReadingStatus>('lendo');
  const [rating, setRating] = useState(0);
  const [genres, setGenres] = useState('Ficção, Drama');
  const [synopsis, setSynopsis] = useState('');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80'
  );
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);

  // Auto-fill metadata using AI
  const handleAutoFillWithAI = async () => {
    if (!title.trim()) return;
    setIsFetchingInfo(true);
    try {
      const sheet = await geminiService.getBookTechnicalSheet(title);
      if (sheet) {
        if (sheet.author && !author) setAuthor(sheet.author);
        if (sheet.publisher && !publisher) setPublisher(sheet.publisher);
        if (sheet.pages) setTotalPages(sheet.pages);
        if (sheet.genres && sheet.genres.length > 0) setGenres(sheet.genres.join(', '));
        if (sheet.synopsisWithoutSpoilers) setSynopsis(sheet.synopsisWithoutSpoilers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    const newBook: Book = {
      id: `book-${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      publisher: publisher.trim() || 'Nacional',
      totalPages: totalPages || 100,
      currentPage: status === 'lido' ? totalPages : currentPage,
      status: status,
      rating: rating,
      genres: genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean),
      synopsis: synopsis.trim(),
      coverImage:
        coverImage ||
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
      year: new Date().getFullYear(),
    };

    onAddBook(newBook);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl text-stone-100 overflow-hidden my-6">
        <div className="flex items-center justify-between p-4 px-6 border-b border-stone-800 bg-stone-850">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif font-bold text-sm text-white">
              Adicionar Livro à Estante
            </h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Title & AI Autofill */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-stone-300">Título da Obra:</label>
              <button
                type="button"
                onClick={handleAutoFillWithAI}
                disabled={!title.trim() || isFetchingInfo}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 disabled:opacity-40"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isFetchingInfo ? 'Buscando...' : 'Preencher dados com IA'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Torto Arado, O Hobbit..."
              className="w-full bg-stone-850 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Author & Publisher */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-300">Autor:</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ex: Itamar Vieira Junior"
                className="w-full bg-stone-850 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-300">Editora:</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="Ex: Todavia, Companhia das Letras"
                className="w-full bg-stone-850 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Pages and Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-300">Total de Páginas:</label>
              <input
                type="number"
                min={1}
                value={totalPages}
                onChange={(e) => setTotalPages(parseInt(e.target.value) || 1)}
                className="w-full bg-stone-850 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-300">Status na Estante:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReadingStatus)}
                className="w-full bg-stone-850 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
              >
                <option value="lendo">Lendo Agora</option>
                <option value="lido">Lido</option>
                <option value="quero_ler">Quero Ler</option>
                <option value="relendo">Relendo</option>
                <option value="abandonado">Abandonado</option>
              </select>
            </div>
          </div>

          {/* Genres */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-300">Gêneros (separados por vírgula):</label>
            <input
              type="text"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              placeholder="Ex: Ficção Brasileira, Fantasia, Romance"
              className="w-full bg-stone-850 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Synopsis */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-300">Sinopse (opcional):</label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              rows={3}
              placeholder="Breve resumo da história..."
              className="w-full bg-stone-850 border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar na Estante</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
