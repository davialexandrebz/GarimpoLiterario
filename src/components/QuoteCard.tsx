import React from 'react';
import { QuoteCardData, QuoteTheme } from '../types';
import { Quote, BookOpen, Share2, Copy, Check } from 'lucide-react';

interface QuoteCardProps {
  data: QuoteCardData;
  className?: string;
  onShare?: () => void;
}

const THEME_STYLES: Record<
  QuoteTheme,
  {
    bg: string;
    text: string;
    authorText: string;
    border: string;
    badge: string;
    font: string;
    quoteIcon: string;
  }
> = {
  'dark-academia': {
    bg: 'bg-gradient-to-br from-stone-900 via-stone-850 to-amber-950 text-stone-100',
    text: 'text-amber-100/90 font-serif leading-relaxed',
    authorText: 'text-amber-300/80',
    border: 'border-stone-800/80',
    badge: 'bg-stone-800/90 text-amber-200 border-amber-900/40',
    font: 'font-serif italic',
    quoteIcon: 'text-amber-500/30',
  },
  'vintage-library': {
    bg: 'bg-gradient-to-br from-amber-900 via-stone-900 to-amber-950 text-amber-50',
    text: 'text-amber-100 font-serif leading-relaxed',
    authorText: 'text-amber-300/90',
    border: 'border-amber-900/60',
    badge: 'bg-amber-950/80 text-amber-200 border-amber-800/50',
    font: 'font-serif',
    quoteIcon: 'text-amber-400/25',
  },
  'cottagecore': {
    bg: 'bg-gradient-to-br from-emerald-950 via-stone-900 to-teal-950 text-emerald-50',
    text: 'text-emerald-100/95 font-sans leading-relaxed',
    authorText: 'text-emerald-300',
    border: 'border-emerald-900/50',
    badge: 'bg-emerald-900/60 text-emerald-200 border-emerald-700/40',
    font: 'font-sans italic',
    quoteIcon: 'text-emerald-400/25',
  },
  'minimal-modern': {
    bg: 'bg-gradient-to-br from-zinc-900 via-zinc-950 to-neutral-900 text-zinc-100',
    text: 'text-zinc-100 font-sans tracking-wide leading-relaxed',
    authorText: 'text-zinc-400',
    border: 'border-zinc-800',
    badge: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/50',
    font: 'font-sans font-light',
    quoteIcon: 'text-zinc-500/25',
  },
  'romantic-rose': {
    bg: 'bg-gradient-to-br from-rose-950 via-stone-900 to-rose-900 text-rose-50',
    text: 'text-rose-100/90 font-serif leading-relaxed',
    authorText: 'text-rose-300',
    border: 'border-rose-900/50',
    badge: 'bg-rose-900/60 text-rose-200 border-rose-700/40',
    font: 'font-serif italic',
    quoteIcon: 'text-rose-400/25',
  },
  'midnight-sky': {
    bg: 'bg-gradient-to-br from-indigo-950 via-slate-950 to-blue-950 text-indigo-50',
    text: 'text-indigo-100/90 font-serif leading-relaxed',
    authorText: 'text-indigo-300',
    border: 'border-indigo-900/50',
    badge: 'bg-indigo-900/60 text-indigo-200 border-indigo-700/40',
    font: 'font-serif',
    quoteIcon: 'text-indigo-400/25',
  },
};

export const QuoteCard: React.FC<QuoteCardProps> = ({ data, className = '', onShare }) => {
  const [copied, setCopied] = React.useState(false);
  const theme = THEME_STYLES[data.theme] || THEME_STYLES['dark-academia'];

  const handleCopy = () => {
    const textToCopy = `"${data.quote}"\n— ${data.bookTitle}, ${data.bookAuthor}${data.pageNumber ? ` (pág. ${data.pageNumber})` : ''}\n#SocialBooks`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={`quote-card-${data.bookTitle.toLowerCase().replace(/\s+/g, '-')}`}
      className={`relative overflow-hidden rounded-2xl border p-6 md:p-8 shadow-xl transition-all duration-300 ${theme.bg} ${theme.border} ${className}`}
    >
      {/* Background Decorative Quote Icon */}
      <Quote
        className={`absolute -top-4 -right-4 h-32 w-32 ${theme.quoteIcon} transform rotate-12 pointer-events-none select-none`}
      />

      {/* Header Tag */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${theme.badge}`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Citação Marcante</span>
          {data.pageNumber && <span className="opacity-80">• Pág. {data.pageNumber}</span>}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            id={`btn-copy-quote-${data.bookTitle.replace(/\s+/g, '')}`}
            onClick={handleCopy}
            title="Copiar citação"
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-stone-300 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          {onShare && (
            <button
              id={`btn-share-quote-${data.bookTitle.replace(/\s+/g, '')}`}
              onClick={onShare}
              title="Compartilhar"
              className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-stone-300 hover:text-white transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quote Body */}
      <blockquote className="relative z-10 my-4">
        <p className={`text-lg md:text-xl ${theme.font} ${theme.text}`}>
          «{data.quote}»
        </p>
      </blockquote>

      {/* Book & Author Citation Footer */}
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
        <div>
          <h4 className="text-base font-semibold text-white tracking-tight">{data.bookTitle}</h4>
          <p className={`text-xs ${theme.authorText}`}>{data.bookAuthor}</p>
        </div>
        <span className="text-[11px] uppercase tracking-widest text-stone-400 font-mono">
          SocialBooks
        </span>
      </div>
    </div>
  );
};
