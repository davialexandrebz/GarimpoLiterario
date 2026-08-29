import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Book, Post, UserProfile, ReadingGoal, Badge, CarouselSlide, Comment, ReadingStatus } from '../types';
import { INITIAL_BOOKS, INITIAL_POSTS, INITIAL_USER } from '../data/mockBooks';

// Default anonymous/demo user ID when no authenticated session is active
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export class SupabaseService {
  /**
   * Check connection and get current user
   */
  static async getCurrentUser() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch {
      return null;
    }
  }

  /**
   * BOOKS API
   */
  static async getBooks(userId?: string): Promise<Book[]> {
    if (!isSupabaseConfigured) return [];
    try {
      let query = supabase.from('books').select(`
        *,
        reading_notes (*)
      `).order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Error fetching books from Supabase:', error.message);
        return [];
      }

      if (!data || data.length === 0) return [];

      return data.map((b: any) => ({
        id: b.id,
        title: b.title,
        originalTitle: b.original_title,
        author: b.author,
        coverImage: b.cover_image,
        totalPages: b.total_pages,
        currentPage: b.current_page,
        status: b.status as ReadingStatus,
        rating: b.rating || 0,
        userReview: b.user_review,
        genres: b.genres || [],
        publisher: b.publisher,
        year: b.year,
        synopsis: b.synopsis,
        favoriteQuote: b.favorite_quote,
        tropes: b.tropes || [],
        contentWarnings: b.content_warnings || [],
        isFavorite: b.is_favorite,
        startDate: b.start_date,
        finishedDate: b.finished_date,
        notes: (b.reading_notes || []).map((n: any) => ({
          id: n.id,
          page: n.page,
          content: n.content,
          quote: n.quote,
          date: n.date,
        })),
      }));
    } catch (err) {
      console.warn('Supabase book fetch failed:', err);
      return [];
    }
  }

  static async saveBook(book: Book, userId?: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const targetUserId = userId || (await this.getCurrentUser())?.id || DEMO_USER_ID;

      const payload = {
        id: book.id.startsWith('book-') ? undefined : book.id,
        user_id: targetUserId,
        title: book.title,
        original_title: book.originalTitle,
        author: book.author,
        publisher: book.publisher,
        year: book.year,
        cover_image: book.coverImage,
        total_pages: book.totalPages,
        current_page: book.currentPage,
        status: book.status,
        rating: book.rating,
        user_review: book.userReview,
        genres: book.genres,
        synopsis: book.synopsis,
        favorite_quote: book.favoriteQuote,
        tropes: book.tropes,
        content_warnings: book.contentWarnings,
        is_favorite: book.isFavorite ?? false,
        start_date: book.startDate,
        finished_date: book.finishedDate,
      };

      const { error } = await supabase.from('books').upsert(payload);
      if (error) {
        console.warn('Supabase save book error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase save book failed:', err);
      return false;
    }
  }

  static async updateProgress(bookId: string, currentPage: number, status: ReadingStatus, finishedDate?: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('books').update({
        current_page: currentPage,
        status: status,
        finished_date: finishedDate,
        updated_at: new Date().toISOString(),
      }).eq('id', bookId);

      return !error;
    } catch {
      return false;
    }
  }

  static async updateRating(bookId: string, rating: number, review?: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const updateData: any = { rating, updated_at: new Date().toISOString() };
      if (review !== undefined) updateData.user_review = review;
      const { error } = await supabase.from('books').update(updateData).eq('id', bookId);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * POSTS API
   */
  static async getPosts(): Promise<Post[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('posts').select(`
        *,
        profiles:user_id (name, username, avatar_url),
        carousel_slides (*),
        comments (
          id,
          content,
          likes_count,
          created_at,
          profiles:user_id (name, username, avatar_url)
        )
      `).order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching posts from Supabase:', error.message);
        return [];
      }

      if (!data || data.length === 0) return [];

      return data.map((p: any) => ({
        id: p.id,
        author: {
          name: p.profiles?.name || 'Leitor SocialBooks',
          username: p.profiles?.username || 'leitor',
          avatar: p.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          verified: true,
        },
        type: p.type,
        bookId: p.book_id,
        bookTitle: p.book_title,
        bookAuthor: p.book_author,
        bookCover: p.book_cover,
        rating: p.rating,
        caption: p.caption || '',
        hashtags: p.hashtags || [],
        carouselSlides: (p.carousel_slides || []).sort((a: any, b: any) => a.slide_number - b.slide_number).map((s: any) => ({
          id: s.id,
          slideNumber: s.slide_number,
          headline: s.headline,
          bodyText: s.body_text,
          visualTip: s.visual_tip,
          slideType: s.slide_type,
        })),
        quoteCard: p.quote_text ? {
          quote: p.quote_text,
          bookTitle: p.book_title || '',
          bookAuthor: p.book_author || '',
          theme: (p.quote_theme || 'dark-academia') as any,
        } : undefined,
        timestamp: new Date(p.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        likes: p.likes_count || 0,
        isLiked: false,
        isSaved: false,
        commentsCount: (p.comments || []).length,
        comments: (p.comments || []).map((c: any) => ({
          id: c.id,
          authorName: c.profiles?.name || 'Leitor',
          authorHandle: c.profiles?.username || 'leitor',
          authorAvatar: c.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          text: c.content,
          timestamp: new Date(c.created_at).toLocaleDateString('pt-BR'),
          likes: c.likes_count || 0,
        })),
      }));
    } catch (err) {
      console.warn('Supabase posts fetch failed:', err);
      return [];
    }
  }

  static async savePost(post: Partial<Post>, userId?: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const targetUserId = userId || (await this.getCurrentUser())?.id || DEMO_USER_ID;

      const { data: postResult, error: postError } = await supabase.from('posts').insert({
        user_id: targetUserId,
        type: post.type || 'carousel',
        book_title: post.bookTitle,
        book_author: post.bookAuthor,
        book_cover: post.bookCover,
        rating: post.rating,
        caption: post.caption || '',
        hashtags: post.hashtags || [],
        quote_text: post.quoteCard?.quote,
        quote_theme: post.quoteCard?.theme,
        likes_count: post.likes || 0,
      }).select().single();

      if (postError || !postResult) {
        console.warn('Supabase post insert error:', postError?.message);
        return false;
      }

      // If carousel slides exist, insert them
      if (post.carouselSlides && post.carouselSlides.length > 0) {
        const slidesPayload = post.carouselSlides.map((s, idx) => ({
          post_id: postResult.id,
          slide_number: s.slideNumber || idx + 1,
          headline: s.headline,
          body_text: s.bodyText,
          visual_tip: s.visualTip,
          slide_type: s.slideType || 'custom',
        }));

        await supabase.from('carousel_slides').insert(slidesPayload);
      }

      return true;
    } catch (err) {
      console.warn('Supabase save post failed:', err);
      return false;
    }
  }

  static async addComment(postId: string, content: string, userId?: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const targetUserId = userId || (await this.getCurrentUser())?.id || DEMO_USER_ID;
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: targetUserId,
        content,
      });
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * PROFILE API
   */
  static async getProfile(userId: string): Promise<Partial<UserProfile> | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching profile from Supabase:', error.message);
      }

      const { data: goal } = await supabase
        .from('reading_goals')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!profile) return null;

      return {
        name: profile.name,
        username: profile.username,
        avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: profile.bio || '',
        favoriteGenres: profile.favorite_genres || ['Ficção', 'Fantasia', 'Romance'],
        followersCount: profile.followers_count || 0,
        followingCount: profile.following_count || 0,
        readingGoal: goal ? {
          year: goal.year,
          targetBooks: goal.target_books,
          currentBooks: goal.current_books,
          targetPages: goal.target_pages,
          currentPages: goal.current_pages,
          streakDays: goal.streak_days,
        } : undefined,
      };
    } catch (err) {
      console.warn('Supabase getProfile failed:', err);
      return null;
    }
  }

  static async updateProfile(userId: string, data: Partial<UserProfile>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        name: data.name,
        username: data.username,
        avatar_url: data.avatar,
        bio: data.bio,
        favorite_genres: data.favoriteGenres,
        updated_at: new Date().toISOString(),
      });
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Diagnostic Test Suite: Tests read/write permissions on Supabase tables
   */
  static async runDiagnostics(): Promise<{
    success: boolean;
    authStatus: string;
    booksCount: number;
    postsCount: number;
    tests: { name: string; status: 'ok' | 'error' | 'warning'; details: string }[];
  }> {
    const results: { name: string; status: 'ok' | 'error' | 'warning'; details: string }[] = [];
    let allOk = true;

    // 1. Connection check
    if (!isSupabaseConfigured) {
      return {
        success: false,
        authStatus: 'Não configurado',
        booksCount: 0,
        postsCount: 0,
        tests: [{ name: 'Conexão Supabase', status: 'error', details: 'URL ou Chave não fornecidas.' }]
      };
    }
    results.push({ name: 'Configuração do Cliente', status: 'ok', details: 'URL e Anon Key carregadas.' });

    // 2. Test Books table
    let bCount = 0;
    try {
      const { data, error, count } = await supabase.from('books').select('*', { count: 'exact' }).limit(5);
      if (error) {
        allOk = false;
        results.push({ name: 'Tabela: books (SELECT)', status: 'error', details: error.message });
      } else {
        bCount = count || data?.length || 0;
        results.push({ name: 'Tabela: books (SELECT)', status: 'ok', details: `${bCount} livro(s) encontrado(s)` });
      }
    } catch (err: any) {
      allOk = false;
      results.push({ name: 'Tabela: books', status: 'error', details: err.message });
    }

    // 3. Test Posts table
    let pCount = 0;
    try {
      const { data, error, count } = await supabase.from('posts').select('*', { count: 'exact' }).limit(5);
      if (error) {
        allOk = false;
        results.push({ name: 'Tabela: posts (SELECT)', status: 'error', details: error.message });
      } else {
        pCount = count || data?.length || 0;
        results.push({ name: 'Tabela: posts (SELECT)', status: 'ok', details: `${pCount} post(s) encontrado(s)` });
      }
    } catch (err: any) {
      allOk = false;
      results.push({ name: 'Tabela: posts', status: 'error', details: err.message });
    }

    // 4. Test Profiles table
    try {
      const { data, error, count } = await supabase.from('profiles').select('*', { count: 'exact' }).limit(5);
      if (error) {
        results.push({ name: 'Tabela: profiles (SELECT)', status: 'warning', details: error.message });
      } else {
        results.push({ name: 'Tabela: profiles (SELECT)', status: 'ok', details: `${count || data?.length || 0} perfil(is) cadastrado(s)` });
      }
    } catch (err: any) {
      results.push({ name: 'Tabela: profiles', status: 'warning', details: err.message });
    }

    // 5. Check Auth User
    let authUserStr = 'Não autenticado (Modo Anônimo)';
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        authUserStr = `Autenticado: ${user.email} (${user.id.substring(0, 8)}...)`;
        results.push({ name: 'Supabase Auth', status: 'ok', details: authUserStr });
      } else {
        results.push({ name: 'Supabase Auth', status: 'ok', details: 'Nenhum usuário logado. Operações anônimas ativas.' });
      }
    } catch (err: any) {
      results.push({ name: 'Supabase Auth', status: 'warning', details: err.message });
    }

    return {
      success: allOk,
      authStatus: authUserStr,
      booksCount: bCount,
      postsCount: pCount,
      tests: results,
    };
  }

  /**
   * Seed / Synchronize Initial Books & Posts to Supabase if database is brand new
   */
  static async seedSampleDataIfEmpty(): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { count } = await supabase.from('books').select('*', { count: 'exact', head: true });
      if (count === 0) {
        console.log('Seeding initial books to Supabase...');
        // Insert sample books
        for (const book of INITIAL_BOOKS) {
          await this.saveBook(book);
        }
        for (const post of INITIAL_POSTS) {
          await this.savePost(post);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Seed check failed:', err);
      return false;
    }
  }
}
