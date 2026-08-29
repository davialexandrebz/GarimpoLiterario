import React, { useState } from 'react';
import { UserProfile, Book, Post } from '../types';
import {
  BookOpen,
  Target,
  Flame,
  Award,
  Grid,
  Bookmark,
  Quote,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Settings,
  Heart,
  LogIn,
  UserCheck,
  UserPlus,
  Database,
  Sparkles as SparklesIcon,
} from 'lucide-react';
import { PostCard } from './PostCard';

interface ProfileViewProps {
  user: UserProfile;
  books: Book[];
  posts: Post[];
  currentUser?: any;
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
  onOpenEditProfile?: () => void;
  onBookClick: (book: Book) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  books,
  posts,
  currentUser,
  onOpenLogin,
  onOpenSignup,
  onOpenEditProfile,
  onBookClick,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'favoritos' | 'salvos' | 'stats'>('posts');

  const myPosts = posts.filter((p) => p.author.username === user.username);
  const favoriteBooks = books.filter((b) => b.isFavorite || b.rating === 5);
  const savedPosts = posts.filter((p) => p.isSaved);
  const totalPagesRead = books
    .filter((b) => b.status === 'lido')
    .reduce((acc, b) => acc + b.totalPages, 0);

  return (
    <div className="space-y-6 text-stone-100">
      {/* Profile Header Card */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/90 backdrop-blur-md p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with gradient ring */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 shadow-2xl">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="absolute bottom-1 right-1 p-1 bg-amber-500 rounded-full text-stone-950">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* User Details & Stats */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-white flex items-center justify-center md:justify-start gap-2">
                  <span>{user.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-medium">
                    Bookstagrammer
                  </span>
                </h2>
                <p className="text-xs text-stone-400">@{user.username}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {currentUser ? (
                  <button
                    onClick={onOpenLogin}
                    className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title={`Conectado como: ${currentUser.email}`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Conta Supabase</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onOpenSignup || onOpenLogin}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Cadastre-se</span>
                    </button>
                    <button
                      onClick={onOpenLogin}
                      className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5 text-stone-400" />
                      <span>Entrar</span>
                    </button>
                  </>
                )}

                <button
                  onClick={onOpenEditProfile}
                  className="px-3.5 py-2 rounded-xl bg-stone-850 hover:bg-stone-750 text-stone-300 hover:text-white text-xs font-semibold border border-stone-750 transition-colors cursor-pointer"
                >
                  Editar Perfil
                </button>
              </div>
            </div>

            <p className="text-xs md:text-sm text-stone-300 max-w-xl leading-relaxed">
              {user.bio}
            </p>

            {/* Favorite Genres Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
              {user.favoriteGenres.map((g, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-stone-850 border border-stone-750 text-amber-300 text-[11px]"
                >
                  ✨ {g}
                </span>
              ))}
            </div>

            {/* Social Metrics */}
            <div className="flex items-center justify-center md:justify-start gap-6 pt-2 border-t border-stone-800 text-xs">
              <div>
                <strong className="text-white font-bold text-sm block">
                  {user.followersCount.toLocaleString('pt-BR')}
                </strong>
                <span className="text-stone-400">seguidores</span>
              </div>
              <div>
                <strong className="text-white font-bold text-sm block">
                  {user.followingCount.toLocaleString('pt-BR')}
                </strong>
                <span className="text-stone-400">seguindo</span>
              </div>
              <div>
                <strong className="text-white font-bold text-sm block">{books.length}</strong>
                <span className="text-stone-400">livros na estante</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unauthenticated User Registration Banner */}
        {!currentUser && (
          <div className="mt-6 pt-5 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-stone-850 to-amber-500/5 border border-amber-500/30">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/40">
                <SparklesIcon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-100 font-serif">
                  Crie sua conta de leitor no SocialBooks
                </h4>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Sincronize sua estante no Supabase, registre páginas lidas, personalize sua meta anual e participe do feed.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={onOpenSignup || onOpenLogin}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Criar Conta Grátis</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-stone-800 justify-center sm:justify-start gap-2">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'posts'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Meus Posts ({myPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favoritos')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'favoritos'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Livros Favoritos ({favoriteBooks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('salvos')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'salvos'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Salvos ({savedPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'stats'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Estatísticas & Badges</span>
        </button>
      </div>

      {/* TAB 1: POSTS */}
      {activeTab === 'posts' && (
        <div>
          {myPosts.length > 0 ? (
            <div className="space-y-6 max-w-2xl mx-auto">
              {myPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-stone-400 space-y-2">
              <Grid className="w-10 h-10 mx-auto text-stone-600" />
              <p className="text-sm">Você ainda não publicou posts no seu feed.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FAVORITOS */}
      {activeTab === 'favoritos' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {favoriteBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => onBookClick(book)}
              className="rounded-2xl border border-stone-800 bg-stone-900 overflow-hidden shadow-lg hover:border-amber-500/30 cursor-pointer transition-all"
            >
              <div className="aspect-[2/3] overflow-hidden bg-stone-950">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-xs text-white truncate">{book.title}</h4>
                <p className="text-[11px] text-stone-400 truncate">{book.author}</p>
                <div className="flex items-center gap-1 text-amber-400 text-xs mt-1">
                  <span>⭐⭐⭐⭐⭐</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SALVOS */}
      {activeTab === 'salvos' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {savedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* TAB 4: STATS & BADGES */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
              <span className="text-xs text-stone-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                Meta 2026
              </span>
              <p className="text-2xl font-bold text-white">
                {user.readingGoal.currentBooks} / {user.readingGoal.targetBooks}
              </p>
              <span className="text-xs text-amber-400">
                {Math.round(
                  (user.readingGoal.currentBooks / user.readingGoal.targetBooks) * 100
                )}
                % concluído
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
              <span className="text-xs text-stone-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Pagômetro Total
              </span>
              <p className="text-2xl font-bold text-white">
                {user.readingGoal.currentPages.toLocaleString('pt-BR')}
              </p>
              <span className="text-xs text-emerald-400">páginas lidas este ano</span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
              <span className="text-xs text-stone-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                Sequência de Leitura
              </span>
              <p className="text-2xl font-bold text-white">{user.readingGoal.streakDays} dias</p>
              <span className="text-xs text-rose-400">hábito diário ativo 🔥</span>
            </div>
          </div>

          {/* Badges List */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6 space-y-4">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Conquistas e Medalhas Literárias</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-xl border flex items-center gap-3.5 transition-all ${
                    badge.unlockedAt
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-stone-850/60 border-stone-800 opacity-60'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{badge.name}</h4>
                    <p className="text-[11px] text-stone-300">{badge.description}</p>
                    {badge.unlockedAt && (
                      <span className="text-[10px] text-amber-400 block mt-1">
                        Desbloqueado em {badge.unlockedAt}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
