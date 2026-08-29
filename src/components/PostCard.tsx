import React, { useState } from 'react';
import { Post, Comment } from '../types';
import { Heart, MessageCircle, Bookmark, Share2, Star, MoreHorizontal, Send, Sparkles } from 'lucide-react';
import { CarouselPost } from './CarouselPost';
import { QuoteCard } from './QuoteCard';
import { motion, AnimatePresence } from 'motion/react';

interface PostCardProps {
  post: Post;
  onLikeToggle?: (postId: string) => void;
  onSaveToggle?: (postId: string) => void;
  onAddComment?: (postId: string, commentText: string) => void;
  onHashtagClick?: (tag: string) => void;
  onBookClick?: (bookTitle: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLikeToggle,
  onSaveToggle,
  onAddComment,
  onHashtagClick,
  onBookClick,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [showHeartPop, setShowHeartPop] = useState(false);

  const handleLike = () => {
    if (!post.isLiked) {
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
    }
    onLikeToggle?.(post.id);
  };

  const handleDoubleTap = () => {
    if (!post.isLiked) {
      handleLike();
    } else {
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment?.(post.id, commentInput.trim());
    setCommentInput('');
  };

  return (
    <article
      id={`post-${post.id}`}
      className="rounded-2xl border border-stone-800/80 bg-stone-900/90 backdrop-blur-sm overflow-hidden shadow-xl mb-6 transition-all"
    >
      {/* Post Author Header */}
      <div className="flex items-center justify-between p-4 border-b border-stone-800/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40"
              referrerPolicy="no-referrer"
            />
            {post.author.verified && (
              <span className="absolute -bottom-1 -right-1 p-0.5 bg-amber-500 rounded-full text-stone-950 text-[10px]">
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-stone-100">{post.author.name}</span>
              <span className="text-xs text-stone-400">@{post.author.username}</span>
            </div>
            <span className="text-[11px] text-stone-500">{post.timestamp}</span>
          </div>
        </div>

        {/* Book tag in header if review */}
        <div className="flex items-center gap-2">
          {post.bookTitle && (
            <button
              onClick={() => onBookClick?.(post.bookTitle!)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition-colors"
            >
              <span>{post.bookTitle}</span>
              {post.rating && (
                <span className="flex items-center gap-0.5 text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {post.rating}
                </span>
              )}
            </button>
          )}

          <button className="text-stone-500 hover:text-stone-300 p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Post Media (Carousel, Quote Card, or Review Photo) */}
      <div className="relative" onDoubleClick={handleDoubleTap}>
        {post.type === 'carousel' && post.carouselSlides && (
          <CarouselPost
            slides={post.carouselSlides}
            bookTitle={post.bookTitle}
            bookAuthor={post.bookAuthor}
            className="rounded-none border-x-0 border-t-0"
          />
        )}

        {post.type === 'quote' && post.quoteCard && (
          <div className="p-4 md:p-6 bg-stone-950">
            <QuoteCard data={post.quoteCard} />
          </div>
        )}

        {post.type === 'review' && post.bookCover && (
          <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-stone-950 flex items-center justify-center">
            <img
              src={post.bookCover}
              alt={post.bookTitle || 'Capa do Livro'}
              className="w-full h-full object-cover filter brightness-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent flex flex-col justify-end p-6">
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < (post.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-stone-600'
                    }`}
                  />
                ))}
              </div>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-1">
                {post.bookTitle}
              </h3>
              <p className="text-sm text-stone-300">{post.bookAuthor}</p>
            </div>
          </div>
        )}

        {/* Double-tap Heart Animation */}
        <AnimatePresence>
          {showHeartPop && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            >
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Bar (Like, Comment, Save, Share) */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              id={`btn-like-${post.id}`}
              onClick={handleLike}
              className="flex items-center gap-1.5 text-stone-300 hover:text-rose-400 transition-colors group"
            >
              <Heart
                className={`w-6 h-6 transition-transform group-active:scale-125 ${
                  post.isLiked ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              <span className="text-sm font-semibold">{post.likes}</span>
            </button>

            <button
              id={`btn-comment-${post.id}`}
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-stone-300 hover:text-amber-400 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm font-semibold">{post.commentsCount}</span>
            </button>

            <button className="text-stone-300 hover:text-amber-400 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <button
            id={`btn-save-${post.id}`}
            onClick={() => onSaveToggle?.(post.id)}
            className="text-stone-300 hover:text-amber-400 transition-colors"
          >
            <Bookmark
              className={`w-6 h-6 ${post.isSaved ? 'fill-amber-400 text-amber-400' : ''}`}
            />
          </button>
        </div>

        {/* Caption & Hashtags */}
        <div className="space-y-2">
          <p className="text-sm text-stone-200 whitespace-pre-line leading-relaxed font-sans">
            <span className="font-semibold text-stone-100 mr-2">{post.author.username}</span>
            {post.caption}
          </p>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.hashtags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => onHashtagClick?.(tag)}
                  className="text-xs font-medium text-amber-400 hover:text-amber-300 hover:underline"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="pt-3 border-t border-stone-800/60 space-y-3">
            <div className="max-h-56 overflow-y-auto space-y-2.5 pr-2">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment: Comment) => (
                  <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <div className="bg-stone-850/80 rounded-xl p-2 border border-stone-800">
                        <span className="font-semibold text-stone-200 mr-1.5">
                          {comment.authorHandle}
                        </span>
                        <span className="text-stone-300">{comment.text}</span>
                      </div>
                      <span className="text-[10px] text-stone-500 ml-1">{comment.timestamp}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500 py-2 text-center">
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </p>
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Escreva um comentário literário..."
                className="flex-1 bg-stone-800/80 border border-stone-700/80 rounded-full px-4 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="p-2 rounded-full bg-amber-500 text-stone-950 disabled:opacity-40 hover:bg-amber-400 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
};
