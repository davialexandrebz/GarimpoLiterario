import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { SupabaseService } from '../services/supabaseService';
import {
  Database,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  CloudUpload,
  ArrowRight,
  LogOut,
  RefreshCw,
  Activity,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  UserCheck,
  UserPlus,
  BookOpen,
  Target,
  AtSign,
  Heart,
  Check,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUserChange: () => void;
  onSyncTriggered?: () => void;
  initialMode?: 'login' | 'signup' | 'diagnostics';
}

const AVATAR_PRESETS = [
  {
    id: 'sofia',
    name: 'Aesthetic Reader',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'marcos',
    name: 'Classic Scholar',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'elena',
    name: 'Cozy Bookworm',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'arthur',
    name: 'Vintage Reader',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'camila',
    name: 'Modern Reader',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  },
];

const GENRE_OPTIONS = [
  'Fantasia',
  'Romance',
  'Ficção Científica',
  'Mistério & Thriller',
  'Clássicos',
  'Poesia',
  'Realismo Mágico',
  'Não-Ficção',
  'Terror & Horror',
  'Dark Romance',
];

const GOAL_OPTIONS = [6, 12, 24, 36, 50];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  onSyncTriggered,
  initialMode = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'diagnostics'>(
    initialMode === 'diagnostics' ? 'diagnostics' : initialMode === 'signup' ? 'signup' : 'login'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].url);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Fantasia', 'Romance', 'Ficção Científica']);
  const [readingGoal, setReadingGoal] = useState<number>(12);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showForgotPass, setShowForgotPass] = useState(false);

  // Diagnostics state
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [diagResults, setDiagResults] = useState<{
    success: boolean;
    authStatus: string;
    booksCount: number;
    postsCount: number;
    tests: { name: string; status: 'ok' | 'error' | 'warning'; details: string }[];
  } | null>(null);

  const runDatabaseTest = async () => {
    setIsRunningTest(true);
    setErrorMsg(null);
    try {
      const res = await SupabaseService.runDiagnostics();
      setDiagResults(res);
    } catch (err: any) {
      setErrorMsg('Falha ao executar teste: ' + err.message);
    } finally {
      setIsRunningTest(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(
        initialMode === 'diagnostics' ? 'diagnostics' : initialMode === 'signup' ? 'signup' : 'login'
      );
      setErrorMsg(null);
      setSuccessMsg(null);
      if (initialMode === 'diagnostics') {
        runDatabaseTest();
      }
    }
  }, [isOpen, initialMode]);

  // Auto-generate username from name or email if empty
  const handleNameChange = (val: string) => {
    setName(val);
    if (!username || username === name.toLowerCase().replace(/[^a-z0-9]/g, '')) {
      setUsername(val.toLowerCase().replace(/[^a-z0-9]/g, ''));
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { level: 0, text: '', color: 'bg-stone-700' };
    if (pass.length < 6) return { level: 1, text: 'Muito curta (mínimo 6 caracteres)', color: 'bg-rose-500' };
    if (pass.length < 8) return { level: 2, text: 'Razoável', color: 'bg-amber-500' };
    const hasNumbers = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    if (hasNumbers && hasSpecial) return { level: 4, text: 'Forte e Segura', color: 'bg-emerald-500' };
    return { level: 3, text: 'Boa', color: 'bg-emerald-400' };
  };

  if (!isOpen) return null;

  const formatSupabaseAuthError = (err: any): string => {
    const msg = err.message || '';
    if (msg.includes('Invalid login credentials')) {
      return 'E-mail ou senha incorretos. Por favor, confira os dados cadastrados.';
    }
    if (msg.includes('Email not confirmed')) {
      return 'E-mail cadastrado ainda não confirmado. Verifique sua caixa de entrada ou confirme o link enviado.';
    }
    if (msg.includes('User already registered') || msg.includes('already registered')) {
      return 'Este e-mail já está cadastrado no Supabase. Faça login com suas credenciais ou recupere sua senha.';
    }
    if (msg.includes('Password should be at least')) {
      return 'A senha deve conter no mínimo 6 caracteres.';
    }
    return msg || 'Erro ao conectar com o Supabase. Verifique suas credenciais.';
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setErrorMsg('Configuração do Supabase não detectada.');
      return;
    }

    if (activeTab === 'signup') {
      if (password.length < 6) {
        setErrorMsg('A senha precisa ter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('A confirmação de senha não coincide com a senha digitada.');
        return;
      }
      if (!agreedToTerms) {
        setErrorMsg('Você precisa concordar com os termos da comunidade para continuar.');
        return;
      }
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (activeTab === 'signup') {
        const cleanUsername = (username.trim() || email.split('@')[0])
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '');

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              name: name.trim() || email.split('@')[0],
              username: cleanUsername,
              avatar_url: selectedAvatar,
              favorite_genres: selectedGenres,
              reading_goal_books: readingGoal,
            },
          },
        });

        if (error) throw error;

        // Auto upsert profile & reading goal if user is returned
        if (data?.user?.id) {
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              name: name.trim() || email.split('@')[0],
              username: cleanUsername,
              avatar_url: selectedAvatar,
              favorite_genres: selectedGenres,
              bio: `Leitor apaixonado por ${selectedGenres.slice(0, 2).join(' e ')} 📚✨`,
              updated_at: new Date().toISOString(),
            });

            await supabase.from('reading_goals').upsert({
              user_id: data.user.id,
              year: new Date().getFullYear(),
              target_books: readingGoal,
              current_books: 0,
              target_pages: readingGoal * 320,
              current_pages: 0,
              streak_days: 1,
            });
          } catch (profileErr) {
            console.warn('Profile background sync hint:', profileErr);
          }
        }

        setSuccessMsg('🎉 Conta criada com sucesso no Supabase! Bem-vindo à comunidade SocialBooks.');
        onUserChange();
        runDatabaseTest();
        setTimeout(() => {
          onClose();
        }, 1600);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;
        setSuccessMsg(`Bem-vindo de volta, ${data.user?.email || 'Leitor'}! Conectado com sucesso.`);
        onUserChange();
        runDatabaseTest();
        setTimeout(() => onClose(), 1200);
      }
    } catch (err: any) {
      setErrorMsg(formatSupabaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Por favor, informe seu e-mail cadastrado.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setSuccessMsg('Instruções de redefinição de senha enviadas para o e-mail informado!');
      setShowForgotPass(false);
    } catch (err: any) {
      setErrorMsg(formatSupabaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      onUserChange();
      setSuccessMsg('Sessão encerrada com sucesso.');
      runDatabaseTest();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSyncing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const seeded = await SupabaseService.seedSampleDataIfEmpty();
      if (seeded) {
        setSuccessMsg('Banco de dados Supabase populado com os livros e posts de exemplo!');
        if (onSyncTriggered) onSyncTriggered();
        runDatabaseTest();
      } else {
        setSuccessMsg('O banco já possui registros ativos.');
        runDatabaseTest();
      }
    } catch (err: any) {
      setErrorMsg('Erro ao sincronizar: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-white p-1.5 rounded-full hover:bg-stone-800 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            {activeTab === 'signup' ? (
              <UserPlus className="w-5 h-5" />
            ) : activeTab === 'diagnostics' ? (
              <Activity className="w-5 h-5 text-emerald-400" />
            ) : (
              <KeyRound className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-100 flex items-center gap-2">
              {activeTab === 'signup'
                ? 'Criar Conta de Leitor'
                : activeTab === 'diagnostics'
                ? 'Diagnóstico do Supabase'
                : 'Acessar SocialBooks'}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-medium border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Supabase Ativo
              </span>
            </h3>
            <p className="text-xs text-stone-400 font-mono truncate max-w-[280px]">
              fblyuflrhxmjlqqjfjah.supabase.co
            </p>
          </div>
        </div>

        {/* Navigation Tabs inside Modal */}
        <div className="flex border-b border-stone-800 mb-5">
          <button
            onClick={() => {
              setActiveTab('login');
              setShowForgotPass(false);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            id="tab-auth-login"
            className={`flex-1 pb-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'login'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('signup');
              setShowForgotPass(false);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            id="tab-auth-signup"
            className={`flex-1 pb-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'signup'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastre-se</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Novo
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('diagnostics');
              runDatabaseTest();
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            id="tab-auth-diagnostics"
            className={`flex-1 pb-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'diagnostics'
                ? 'border-emerald-400 text-emerald-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Status DB</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-semibold">Atenção</strong>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOGGED IN VIEW */}
        {currentUser && activeTab !== 'diagnostics' ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-850 to-stone-900 border border-stone-800 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">Usuário Autenticado:</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      Online
                    </span>
                  </div>
                  <p className="text-sm font-bold text-stone-100 mt-0.5 break-all">
                    {currentUser.email}
                  </p>
                  <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                    ID: {currentUser.id}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-850/60 border border-stone-800 text-xs text-stone-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Sincronização com Supabase:</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ativa
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Último Login:</span>
                <span className="text-stone-300 font-mono text-[11px]">
                  {currentUser.last_sign_in_at
                    ? new Date(currentUser.last_sign_in_at).toLocaleDateString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Sessão Atual'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 border border-rose-500/30 transition-colors cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{loading ? 'Encerrando...' : 'Desconectar / Sair da Conta'}</span>
              </button>
            </div>
          </div>
        ) : showForgotPass ? (
          /* FORGOT PASSWORD SCREEN */
          <div className="space-y-4">
            <div>
              <h4 className="font-serif font-bold text-stone-100 text-base">Recuperação de Senha</h4>
              <p className="text-xs text-stone-400 mt-1">
                Informe o e-mail cadastrado no Supabase para receber o link de redefinição de acesso.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className="block text-xs text-stone-300 mb-1 font-medium">E-mail Cadastrado</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu-email@exemplo.com"
                    className="w-full bg-stone-850 border border-stone-750 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Enviando...' : 'Enviar Link de Recuperação'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowForgotPass(false)}
                className="w-full py-2 text-xs text-stone-400 hover:text-stone-200 text-center transition-colors cursor-pointer"
              >
                Voltar para o Login
              </button>
            </form>
          </div>
        ) : activeTab === 'signup' ? (
          /* CADASTRE-SE / SIGN UP AREA */
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-stone-300 text-xs">
              <span className="text-amber-300 font-bold block mb-0.5">📚 Crie sua estante na nuvem</span>
              Ao se cadastrar, seus livros, metas, anotações de leitura e posts do feed ficam salvos permanentemente no seu banco Supabase.
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {/* Profile Avatar Selection */}
              <div>
                <label className="block text-xs text-stone-300 mb-2 font-medium">Escolha seu Avatar Literário</label>
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.url)}
                      className={`relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        selectedAvatar === av.url
                          ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105'
                          : 'border-stone-700 opacity-60 hover:opacity-100'
                      }`}
                      title={av.name}
                    >
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                      {selectedAvatar === av.url && (
                        <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-300 mb-1 font-medium">Nome Completo</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ex: Mariana Silva"
                      className="w-full bg-stone-850 border border-stone-750 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-stone-300 mb-1 font-medium">Nome de Usuário (@handle)</label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="mari.leitora"
                      className="w-full bg-stone-850 border border-stone-750 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs text-stone-300 mb-1 font-medium">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu-email@exemplo.com"
                    className="w-full bg-stone-850 border border-stone-750 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-300 mb-1 font-medium">Senha</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 dígitos"
                      className="w-full bg-stone-850 border border-stone-750 rounded-xl pl-9 pr-9 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 p-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-stone-300 mb-1 font-medium">Confirmar Senha</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita sua senha"
                      className={`w-full bg-stone-850 border rounded-xl pl-9 pr-9 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none transition-colors ${
                        confirmPassword && confirmPassword !== password
                          ? 'border-rose-500/80 focus:border-rose-400'
                          : 'border-stone-750 focus:border-amber-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password strength bar */}
              {password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Força da senha:</span>
                    <span className={`font-medium ${strength.level >= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {strength.text}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${(strength.level / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Favorite Genres Selection */}
              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-medium flex items-center justify-between">
                  <span>Gêneros Literários Favoritos</span>
                  <span className="text-[11px] text-stone-400">{selectedGenres.length} selecionados</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {GENRE_OPTIONS.map((g) => {
                    const isSelected = selectedGenres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGenre(g)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950 font-bold shadow-sm shadow-amber-500/20'
                            : 'bg-stone-850 text-stone-300 border border-stone-750 hover:border-stone-600'
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reading Goal Target */}
              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-medium flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>Meta de Leitura para {new Date().getFullYear()}</span>
                </label>
                <div className="flex items-center gap-2">
                  {GOAL_OPTIONS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setReadingGoal(goal)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        readingGoal === goal
                          ? 'bg-amber-500/20 border border-amber-500 text-amber-300 font-bold'
                          : 'bg-stone-850 border border-stone-750 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {goal} livros
                    </button>
                  ))}
                </div>
              </div>

              {/* Agreement checkbox */}
              <label className="flex items-start gap-2 text-xs text-stone-400 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-stone-700 text-amber-500 focus:ring-amber-400"
                />
                <span>
                  Concordo com os termos da comunidade literária SocialBooks e em manter o ambiente livre de spoilers sem aviso prévio.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                id="btn-submit-signup"
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Criando sua conta de leitor...' : 'Concluir Cadastro no SocialBooks'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs text-stone-400 hover:text-amber-300 transition-colors"
                >
                  Já possui uma conta? <strong className="underline font-bold">Fazer Login</strong>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* LOGIN FORM */
          <div>
            <div className="mb-4">
              <p className="text-xs text-stone-300">
                Digite seu e-mail e senha cadastrados no Supabase para sincronizar sua estante e interações.
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-3.5">
              <div>
                <label className="block text-xs text-stone-300 mb-1 font-medium">E-mail Cadastrado</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu-email@exemplo.com"
                    className="w-full bg-stone-850 border border-stone-750 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-stone-300 font-medium">Senha</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPass(true)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha do Supabase"
                    className="w-full bg-stone-850 border border-stone-750 rounded-xl pl-9 pr-10 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors p-1"
                    title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                id="btn-submit-login"
                className="w-full mt-3 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Verificando credenciais...' : 'Entrar na Minha Conta'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-xs text-stone-400 hover:text-amber-300 transition-colors"
                >
                  Novo por aqui? <strong className="underline font-bold">Criar uma Conta Gratuita</strong>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: DIAGNOSTICS & TEST SUITE */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400">Status das Tabelas e Conexão:</span>
              <button
                onClick={runDatabaseTest}
                disabled={isRunningTest}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningTest ? 'animate-spin' : ''}`} />
                <span>{isRunningTest ? 'Testando...' : 'Reexecutar Teste'}</span>
              </button>
            </div>

            {diagResults ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 text-center">
                    <span className="text-[11px] text-stone-400 block">Livros no Supabase</span>
                    <span className="font-serif font-bold text-xl text-amber-300">{diagResults.booksCount}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 text-center">
                    <span className="text-[11px] text-stone-400 block">Posts no Supabase</span>
                    <span className="font-serif font-bold text-xl text-rose-300">{diagResults.postsCount}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-stone-950/60 border border-stone-800 p-3 space-y-2">
                  {diagResults.tests.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-stone-850 last:border-0">
                      <div className="flex items-center gap-2">
                        {t.status === 'ok' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {t.status === 'warning' && <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        {t.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        <span className="font-medium text-stone-200">{t.name}</span>
                      </div>
                      <span className="text-[11px] text-stone-400 font-mono">{t.details}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Consultando endpoints do Supabase...</span>
              </div>
            )}

            <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">Banco de dados vazio?</span>
              <button
                onClick={handleSeedDatabase}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>{isSyncing ? 'Inserindo dados...' : 'Popular Dados Iniciais'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
