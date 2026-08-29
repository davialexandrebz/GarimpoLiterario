import React from 'react';
import {
  BookOpen,
  Sparkles,
  PlusCircle,
  Bookmark,
  Compass,
  User,
  Search,
  Database,
  Layers,
  LogIn,
  ShieldCheck,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { UserProfile } from '../types';

export type MainNavTab = 'feed' | 'bookshelf' | 'ai_studio' | 'profile';

interface NavbarProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onOpenCreatePost: () => void;
  onToggleAIAssistant: () => void;
  onOpenAuth?: () => void;
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
  currentUser?: any;
  isSupabaseLive?: boolean;
  user: UserProfile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreatePost,
  onToggleAIAssistant,
  onOpenAuth,
  onOpenLogin,
  onOpenSignup,
  currentUser,
  isSupabaseLive = true,
  user,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800/80 bg-stone-900/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand / Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            onClick={() => onSelectTab('feed')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-stone-900 rounded-[10px] flex items-center justify-center text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-lg font-serif font-bold text-white tracking-tight block leading-none">
                Social<span className="text-amber-400">Books</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono tracking-wider">
                Skoob + Bookstagram
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar livros, autores, resenhas..."
              className="w-full bg-stone-850 border border-stone-750 rounded-full pl-9 pr-4 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('feed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentTab === 'feed'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Feed</span>
            </button>

            <button
              onClick={() => onSelectTab('bookshelf')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentTab === 'bookshelf'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Estante Skoob</span>
            </button>

            <button
              onClick={() => onSelectTab('ai_studio')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentTab === 'ai_studio'
                  ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Studio</span>
            </button>
          </nav>

          {/* Action Buttons: Supabase Login + Create Post + AI Assistant + Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Supabase Login & Signup / Account Buttons */}
            {currentUser ? (
              <button
                onClick={onOpenLogin || onOpenAuth}
                id="btn-nav-logged-user"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs transition-colors cursor-pointer"
                title={`Conectado como: ${currentUser.email}`}
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="max-w-[110px] truncate font-medium text-[11px]">
                  {currentUser.email?.split('@')[0]}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenLogin || onOpenAuth}
                  id="btn-nav-login"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 text-stone-200 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  title="Fazer Login com sua conta existente do Supabase"
                >
                  <LogIn className="w-3.5 h-3.5 text-stone-400" />
                  <span>Entrar</span>
                </button>

                <button
                  onClick={onOpenSignup || onOpenAuth}
                  id="btn-nav-signup"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
                  title="Criar uma nova conta de leitor"
                >
                  <UserPlus className="w-3.5 h-3.5 text-stone-950" />
                  <span>Cadastre-se</span>
                </button>
              </div>
            )}

            {/* Supabase Diagnostics / DB Status Pill */}
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                id="btn-supabase-status"
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 text-stone-400 text-xs transition-colors cursor-pointer"
                title="Status do banco Supabase"
              >
                <Database className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-mono text-stone-300">Supabase</span>
              </button>
            )}

            {/* Create Post Button */}
            <button
              onClick={onOpenCreatePost}
              id="btn-nav-create-post"
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Criar Post</span>
            </button>

            {/* AI Assistant Floating Beacon Toggle */}
            <button
              onClick={onToggleAIAssistant}
              id="btn-nav-ai-toggle"
              className="relative p-2 rounded-xl bg-gradient-to-br from-stone-800 to-stone-850 hover:from-stone-700 hover:to-stone-800 border border-amber-500/30 text-amber-300 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              title="Abrir IA Literária SocialBooks"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline text-xs font-semibold">IA Literária</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            </button>

            {/* Profile Avatar Button */}
            <button
              onClick={() => onSelectTab('profile')}
              className={`p-0.5 rounded-full ring-2 transition-all cursor-pointer ${
                currentTab === 'profile'
                  ? 'ring-amber-400 scale-105'
                  : 'ring-stone-700 hover:ring-stone-500'
              }`}
              title="Ver Perfil"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 border-t border-stone-800 px-6 py-2 flex items-center justify-around backdrop-blur-md">
        <button
          onClick={() => onSelectTab('feed')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            currentTab === 'feed' ? 'text-amber-400 font-bold' : 'text-stone-400'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Feed</span>
        </button>

        <button
          onClick={() => onSelectTab('bookshelf')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            currentTab === 'bookshelf' ? 'text-amber-400 font-bold' : 'text-stone-400'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span>Estante</span>
        </button>

        <button
          onClick={onOpenCreatePost}
          className="p-2.5 -mt-5 rounded-full bg-amber-500 text-stone-950 shadow-xl shadow-amber-500/30"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <button
          onClick={() => onSelectTab('ai_studio')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            currentTab === 'ai_studio' ? 'text-amber-400 font-bold' : 'text-stone-400'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>AI Studio</span>
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            currentTab === 'profile' ? 'text-amber-400 font-bold' : 'text-stone-400'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Perfil</span>
        </button>
      </div>
    </header>
  );
};
