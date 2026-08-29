import React, { useState, useEffect, useCallback } from 'react';
import {
  INITIAL_BOOKS,
  INITIAL_POSTS,
  INITIAL_USER,
} from './data/mockBooks';
import { Book, Post, UserProfile, ReadingStatus } from './types';
import { Navbar, MainNavTab } from './components/Navbar';
import { StoriesBar } from './components/StoriesBar';
import { PostCard } from './components/PostCard';
import { ReadingGoalWidget } from './components/ReadingGoalWidget';
import { BookshelfView } from './components/BookshelfView';
import { BookDetailModal } from './components/BookDetailModal';
import { CreatePostModal } from './components/CreatePostModal';
import { AddBookModal } from './components/AddBookModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { AIStudioView } from './components/AIStudioView';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { SupabaseService } from './services/supabaseService';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import {
  Sparkles,
  BookOpen,
  Compass,
  TrendingUp,
  Hash,
  MessageCircle,
  PlusCircle,
  Database,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Persistent State
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('socialbooks_shelf');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('socialbooks_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('socialbooks_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<MainNavTab>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeHashtagFilter, setActiveHashtagFilter] = useState<string | null>(null);

  // Modals state
  const [selectedBookForModal, setSelectedBookForModal] = useState<Book | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [createPostPreselectedBook, setCreatePostPreselectedBook] = useState<Book | null>(null);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'diagnostics'>('login');

  const openAuthWithMode = (mode: 'login' | 'signup' | 'diagnostics') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Load from Supabase on start or auth change
  const refreshFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const user = await SupabaseService.getCurrentUser();
      setSupabaseUser(user);

      if (user) {
        setUser((prev) => ({
          ...prev,
          name: user.user_metadata?.name || user.email?.split('@')[0] || prev.name,
          username: user.user_metadata?.username || user.email?.split('@')[0].toLowerCase() || prev.username,
        }));
      }

      const remoteBooks = await SupabaseService.getBooks(user?.id);
      if (remoteBooks && remoteBooks.length > 0) {
        setBooks(remoteBooks);
      }

      const remotePosts = await SupabaseService.getPosts();
      if (remotePosts && remotePosts.length > 0) {
        setPosts(remotePosts);
      }
    } catch (err) {
      console.warn('Initial Supabase sync error:', err);
    }
  }, []);

  useEffect(() => {
    refreshFromSupabase();

    // Listen to Supabase auth events
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user || null);
      if (session?.user) {
        setUser((prev) => ({
          ...prev,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || prev.name,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0].toLowerCase() || prev.username,
        }));
        refreshFromSupabase();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [refreshFromSupabase]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('socialbooks_shelf', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('socialbooks_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('socialbooks_user', JSON.stringify(user));
  }, [user]);

  // Handler: Like Toggle
  const handleLikeToggle = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  // Handler: Save/Bookmark Toggle
  const handleSaveToggle = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, isSaved: !p.isSaved };
        }
        return p;
      })
    );
  };

  // Handler: Add Comment
  const handleAddComment = async (postId: string, text: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      authorName: user.name,
      authorHandle: user.username,
      authorAvatar: user.avatar,
      text,
      timestamp: 'Agora',
      likes: 0,
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [newComment, ...(p.comments || [])],
          };
        }
        return p;
      })
    );

    // Save comment to Supabase
    SupabaseService.addComment(postId, text, supabaseUser?.id);
  };

  // Handler: Update Reading Progress
  const handleUpdateProgress = (bookId: string, newPage: number, markAsRead = false) => {
    const isFinished = markAsRead;
    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook) return;

    const actualFinished = markAsRead || newPage >= targetBook.totalPages;
    const updatedStatus: ReadingStatus = actualFinished ? 'lido' : targetBook.status;
    const finishDate = actualFinished ? new Date().toISOString().split('T')[0] : targetBook.finishedDate;

    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const isFin = markAsRead || newPage >= b.totalPages;
          const status: ReadingStatus = isFin ? 'lido' : b.status;

          // Update user reading stats
          if (isFin && b.status !== 'lido') {
            setUser((u) => ({
              ...u,
              readingGoal: {
                ...u.readingGoal,
                currentBooks: u.readingGoal.currentBooks + 1,
                currentPages: u.readingGoal.currentPages + (b.totalPages - b.currentPage),
              },
            }));
          } else {
            const pageDiff = Math.max(0, newPage - b.currentPage);
            setUser((u) => ({
              ...u,
              readingGoal: {
                ...u.readingGoal,
                currentPages: u.readingGoal.currentPages + pageDiff,
              },
            }));
          }

          return {
            ...b,
            currentPage: isFin ? b.totalPages : newPage,
            status,
            finishedDate: isFin ? new Date().toISOString().split('T')[0] : b.finishedDate,
          };
        }
        return b;
      })
    );

    // Persist progress to Supabase
    SupabaseService.updateProgress(bookId, actualFinished ? targetBook.totalPages : newPage, updatedStatus, finishDate);
  };

  // Handler: Update Book Status from Modal
  const handleUpdateBookStatus = (status: ReadingStatus) => {
    if (!selectedBookForModal) return;
    const bookId = selectedBookForModal.id;
    const target = books.find((b) => b.id === bookId);
    const newPage = status === 'lido' && target ? target.totalPages : (target?.currentPage || 0);

    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            status,
            currentPage: status === 'lido' ? b.totalPages : b.currentPage,
          };
        }
        return b;
      })
    );
    setSelectedBookForModal((prev) => (prev ? { ...prev, status } : null));

    // Persist status to Supabase
    SupabaseService.updateProgress(bookId, newPage, status);
  };

  // Handler: Update Rating from Modal
  const handleUpdateBookRating = (rating: number) => {
    if (!selectedBookForModal) return;
    const bookId = selectedBookForModal.id;
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          return { ...b, rating };
        }
        return b;
      })
    );
    setSelectedBookForModal((prev) => (prev ? { ...prev, rating } : null));

    // Persist rating to Supabase
    SupabaseService.updateRating(bookId, rating);
  };

  // Handler: Add New Book
  const handleAddBook = (newBook: Book) => {
    setBooks([newBook, ...books]);
    setIsAddBookOpen(false);

    // If reading or read, update goal
    if (newBook.status === 'lido') {
      setUser((u) => ({
        ...u,
        readingGoal: {
          ...u.readingGoal,
          currentBooks: u.readingGoal.currentBooks + 1,
          currentPages: u.readingGoal.currentPages + newBook.totalPages,
        },
      }));
      confetti({ particleCount: 70, spread: 60 });
    }

    // Persist new book to Supabase
    SupabaseService.saveBook(newBook, supabaseUser?.id);
  };

  // Handler: Publish New Post
  const handlePublishPost = (newPostData: Partial<Post>) => {
    const fullPost: Post = {
      id: newPostData.id || `post-${Date.now()}`,
      author: {
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        verified: true,
      },
      type: newPostData.type || 'carousel',
      bookTitle: newPostData.bookTitle,
      bookAuthor: newPostData.bookAuthor,
      bookCover: newPostData.bookCover,
      rating: newPostData.rating,
      caption: newPostData.caption || '',
      hashtags: newPostData.hashtags || [],
      carouselSlides: newPostData.carouselSlides,
      quoteCard: newPostData.quoteCard,
      timestamp: 'Agora mesmo',
      likes: 1,
      isLiked: true,
      isSaved: false,
      commentsCount: 0,
      comments: [],
    };

    setPosts([fullPost, ...posts]);
    setIsCreatePostOpen(false);
    setCreatePostPreselectedBook(null);
    setCurrentTab('feed');

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    // Persist post to Supabase
    SupabaseService.savePost(fullPost, supabaseUser?.id);
  };

  // Filtered posts for feed
  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.bookTitle && p.bookTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.bookAuthor && p.bookAuthor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesHashtag =
      !activeHashtagFilter || p.hashtags?.includes(activeHashtagFilter);

    return matchesSearch && matchesHashtag;
  });

  const trendingHashtags = [
    { tag: '#TortoArado', count: '14.2k posts' },
    { tag: '#BookTokBrasil', count: '89.5k posts' },
    { tag: '#SocialBooks', count: '32.1k posts' },
    { tag: '#LendoAgora', count: '24.8k posts' },
    { tag: '#DarkAcademia', count: '18.4k posts' },
    { tag: '#ResenhaLiteraria', count: '12.0k posts' },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 pb-20 sm:pb-12">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setActiveHashtagFilter(null);
        }}
        onOpenCreatePost={() => {
          setCreatePostPreselectedBook(null);
          setIsCreatePostOpen(true);
        }}
        onToggleAIAssistant={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
        onOpenAuth={() => openAuthWithMode('diagnostics')}
        onOpenLogin={() => openAuthWithMode('login')}
        onOpenSignup={() => openAuthWithMode('signup')}
        currentUser={supabaseUser}
        user={user}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: FEED (Bookstagram + Skoob Highlights) */}
        {currentTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left/Center Column: Feed & Stories */}
            <div className="lg:col-span-8 space-y-6">
              {/* Stories Bar */}
              <div className="rounded-2xl border border-stone-800/80 bg-stone-900/90 p-4 shadow-xl">
                <StoriesBar
                  onCreateStory={() => {
                    setCreatePostPreselectedBook(null);
                    setIsCreatePostOpen(true);
                  }}
                  onStoryClick={(id) => {
                    setIsAIAssistantOpen(true);
                  }}
                />
              </div>

              {/* Active Hashtag Filter Pill if set */}
              {activeHashtagFilter && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
                  <span>
                    Filtrando posts por: <strong>{activeHashtagFilter}</strong>
                  </span>
                  <button
                    onClick={() => setActiveHashtagFilter(null)}
                    className="hover:underline font-bold text-amber-200"
                  >
                    Limpar filtro ✕
                  </button>
                </div>
              )}

              {/* Posts Feed */}
              {filteredPosts.length > 0 ? (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLikeToggle={handleLikeToggle}
                      onSaveToggle={handleSaveToggle}
                      onAddComment={handleAddComment}
                      onHashtagClick={(tag) => setActiveHashtagFilter(tag)}
                      onBookClick={(bookTitle) => {
                        const matchedBook = books.find((b) => b.title === bookTitle);
                        if (matchedBook) {
                          setSelectedBookForModal(matchedBook);
                        } else {
                          setIsAIAssistantOpen(true);
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-12 text-center space-y-3">
                  <Compass className="w-10 h-10 text-stone-600 mx-auto" />
                  <h3 className="font-semibold text-stone-200 text-base">
                    Nenhum post encontrado
                  </h3>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    Tente buscar por outro termo ou seja o primeiro a publicar uma resenha ou
                    citação sobre esta leitura!
                  </p>
                  <button
                    onClick={() => setIsCreatePostOpen(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Criar Novo Post</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Skoob Stats, Literary AI Assistant Card & Trending */}
            <aside className="hidden lg:block lg:col-span-4 space-y-6 sticky top-24">
              {/* Reading Goal & Pagômetro Widget */}
              <ReadingGoalWidget
                goal={user.readingGoal}
                badges={user.badges}
                onOpenBadgesModal={() => setCurrentTab('profile')}
              />

              {/* SocialBooks Literary AI Quick Launcher Card */}
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-stone-900 via-stone-850 to-amber-950/40 p-5 shadow-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-serif font-bold text-sm text-white">IA Literária Central</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] text-amber-300 font-mono">
                    Online
                  </span>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  Precisa de recomendações personalizadas, fichas técnicas ou ajuda para montar um
                  carrossel literário perfeito?
                </p>

                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => setIsAIAssistantOpen(true)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-stone-800/80 hover:bg-amber-500 hover:text-stone-950 text-stone-200 text-xs font-medium border border-stone-700 transition-all flex items-center justify-between group"
                  >
                    <span>🎯 Recomendar livros pelo meu humor</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:text-stone-950" />
                  </button>

                  <button
                    onClick={() => {
                      setCreatePostPreselectedBook(null);
                      setIsCreatePostOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl bg-stone-800/80 hover:bg-amber-500 hover:text-stone-950 text-stone-200 text-xs font-medium border border-stone-700 transition-all flex items-center justify-between group"
                  >
                    <span>📸 Criar carrossel com apoio da IA</span>
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400 group-hover:text-stone-950" />
                  </button>
                </div>
              </div>

              {/* Trending Bookstagram Hashtags */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-5 space-y-3">
                <div className="flex items-center gap-2 text-stone-300">
                  <Hash className="w-4 h-4 text-amber-400" />
                  <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
                    Em Alta no BookTok & SocialBooks
                  </h3>
                </div>

                <div className="space-y-2">
                  {trendingHashtags.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveHashtagFilter(item.tag)}
                      className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-stone-850 cursor-pointer transition-colors"
                    >
                      <span className="font-medium text-amber-400 hover:underline">{item.tag}</span>
                      <span className="text-[11px] text-stone-500">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* VIEW 2: BOOKSHELF (Skoob Virtual Shelf) */}
        {currentTab === 'bookshelf' && (
          <BookshelfView
            books={books}
            onBookClick={(book) => setSelectedBookForModal(book)}
            onUpdateProgress={handleUpdateProgress}
            onAddBook={() => setIsAddBookOpen(true)}
            onGeneratePostForBook={(book) => {
              setCreatePostPreselectedBook(book);
              setIsCreatePostOpen(true);
            }}
            onAskAIAboutBook={(book) => {
              setSelectedBookForModal(book);
            }}
          />
        )}

        {/* VIEW 3: AI STUDIO LITERÁRIO */}
        {currentTab === 'ai_studio' && (
          <AIStudioView
            books={books}
            onOpenCreatePost={(book) => {
              setCreatePostPreselectedBook(book || null);
              setIsCreatePostOpen(true);
            }}
            onBookClick={(book) => setSelectedBookForModal(book)}
          />
        )}

        {/* VIEW 4: USER PROFILE */}
        {currentTab === 'profile' && (
          <ProfileView
            user={user}
            books={books}
            posts={posts}
            currentUser={supabaseUser}
            onOpenLogin={() => openAuthWithMode('login')}
            onOpenSignup={() => openAuthWithMode('signup')}
            onOpenEditProfile={() => openAuthWithMode('signup')}
            onBookClick={(book) => setSelectedBookForModal(book)}
          />
        )}
      </main>

      {/* MODAL 1: Book Detail & Technical Sheet */}
      {selectedBookForModal && (
        <BookDetailModal
          book={selectedBookForModal}
          onClose={() => setSelectedBookForModal(null)}
          onUpdateStatus={handleUpdateBookStatus}
          onUpdateRating={handleUpdateBookRating}
          onGeneratePost={(book) => {
            setSelectedBookForModal(null);
            setCreatePostPreselectedBook(book);
            setIsCreatePostOpen(true);
          }}
          onAskAI={(book) => {
            setSelectedBookForModal(null);
            setIsAIAssistantOpen(true);
          }}
        />
      )}

      {/* MODAL 2: Create Bookstagram Post / Carousel Studio */}
      {isCreatePostOpen && (
        <CreatePostModal
          books={books}
          preselectedBook={createPostPreselectedBook}
          onClose={() => {
            setIsCreatePostOpen(false);
            setCreatePostPreselectedBook(null);
          }}
          onSubmitPost={handlePublishPost}
        />
      )}

      {/* MODAL 3: Add Book to Skoob Shelf */}
      {isAddBookOpen && (
        <AddBookModal onClose={() => setIsAddBookOpen(false)} onAddBook={handleAddBook} />
      )}

      {/* DRAWER: SocialBooks Literary AI Central Assistant */}
      <AIAssistantDrawer
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        books={books}
        user={user}
        onOpenCreatePostWithBook={(bookTitle) => {
          setIsAIAssistantOpen(false);
          const found = books.find((b) => b.title.toLowerCase() === bookTitle.toLowerCase());
          setCreatePostPreselectedBook(found || null);
          setIsCreatePostOpen(true);
        }}
      />

      {/* MODAL 4: Supabase Auth & Synchronization Central */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={supabaseUser}
        initialMode={authModalMode}
        onUserChange={refreshFromSupabase}
        onSyncTriggered={refreshFromSupabase}
      />
    </div>
  );
}
