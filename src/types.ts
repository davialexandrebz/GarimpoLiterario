export type ReadingStatus = 'lendo' | 'lido' | 'quero_ler' | 'relendo' | 'abandonado';

export interface Book {
  id: string;
  title: string;
  originalTitle?: string;
  author: string;
  coverImage: string;
  totalPages: number;
  currentPage: number;
  status: ReadingStatus;
  rating: number; // 0 to 5
  userReview?: string;
  startDate?: string;
  finishedDate?: string;
  genres: string[];
  publisher?: string;
  year?: number;
  synopsis?: string;
  favoriteQuote?: string;
  tropes?: string[];
  contentWarnings?: string[];
  notes?: ReadingNote[];
  isFavorite?: boolean;
}

export interface ReadingNote {
  id: string;
  page: number;
  content: string;
  date: string;
  quote?: string;
}

export interface CarouselSlide {
  id: string;
  slideNumber: number;
  headline: string;
  bodyText: string;
  visualTip?: string;
  bgTheme?: string;
  coverImage?: string;
  slideType?: 'hook' | 'synopsis' | 'plot' | 'quote' | 'verdict' | 'custom';
}

export type QuoteTheme = 
  | 'dark-academia'
  | 'vintage-library'
  | 'cottagecore'
  | 'minimal-modern'
  | 'romantic-rose'
  | 'midnight-sky';

export interface QuoteCardData {
  quote: string;
  bookTitle: string;
  bookAuthor: string;
  pageNumber?: number;
  theme: QuoteTheme;
}

export interface Comment {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

export type PostType = 'carousel' | 'quote' | 'review' | 'aesthetic';

export interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
  };
  type: PostType;
  bookId?: string;
  bookTitle?: string;
  bookAuthor?: string;
  bookCover?: string;
  rating?: number;
  caption: string;
  hashtags: string[];
  carouselSlides?: CarouselSlide[];
  quoteCard?: QuoteCardData;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  commentsCount: number;
  comments: Comment[];
}

export interface ReadingGoal {
  year: number;
  targetBooks: number;
  currentBooks: number;
  targetPages: number;
  currentPages: number;
  streakDays: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

export interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  favoriteGenres: string[];
  readingGoal: ReadingGoal;
  badges: Badge[];
  followersCount: number;
  followingCount: number;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  relatedBook?: {
    title: string;
    author: string;
    coverImage?: string;
  };
}

export interface BookRecommendation {
  title: string;
  author: string;
  genre: string;
  matchScore: number;
  whyRead: string;
  vibe: string;
  tropes?: string[];
  hashtags?: string[];
  coverUrl?: string;
}

export interface TechnicalBookSheet {
  title: string;
  originalTitle: string;
  author: string;
  authorBio: string;
  publisher: string;
  pages: number;
  releaseYear: number;
  genres: string[];
  tropes: string[];
  contentWarnings: string[];
  synopsisWithoutSpoilers: string;
  keyThemes: string[];
  authorTrivia: string[];
  recommendedIfYouLiked: string[];
}
