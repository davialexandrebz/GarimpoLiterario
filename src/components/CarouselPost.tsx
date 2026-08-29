import React, { useState } from 'react';
import { CarouselSlide } from '../types';
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, Quote, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CarouselPostProps {
  slides: CarouselSlide[];
  bookTitle?: string;
  bookAuthor?: string;
  className?: string;
}

export const CarouselPost: React.FC<CarouselPostProps> = ({
  slides,
  bookTitle,
  bookAuthor,
  className = '',
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIdx];

  const handleNext = () => {
    if (currentIdx < slides.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const getSlideIcon = (type?: string) => {
    switch (type) {
      case 'hook':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'quote':
        return <Quote className="w-4 h-4 text-rose-400" />;
      case 'verdict':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div
      id={`carousel-${bookTitle?.toLowerCase().replace(/\s+/g, '-') || 'post'}`}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-neutral-900 to-stone-950 border border-stone-800 shadow-2xl text-stone-100 ${className}`}
    >
      {/* Slide Index Badge */}
      <div className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-stone-300">
        {currentIdx + 1}/{slides.length}
      </div>

      {/* Book Badge (Top Left) */}
      {bookTitle && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium text-amber-200">
          <BookOpen className="w-3.5 h-3.5" />
          <span className="truncate max-w-[180px]">{bookTitle}</span>
        </div>
      )}

      {/* Slide Content Area */}
      <div className="relative min-h-[380px] md:min-h-[420px] p-8 md:p-10 flex flex-col justify-between pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id || currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col justify-center"
          >
            {/* Slide Category Header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1.5 rounded-lg bg-stone-800/80 border border-stone-700/50">
                {getSlideIcon(currentSlide.slideType)}
              </span>
              <span className="text-xs uppercase tracking-widest text-amber-400/90 font-medium">
                {currentSlide.slideType === 'hook'
                  ? 'Gancho Literário'
                  : currentSlide.slideType === 'synopsis'
                  ? 'Premissa'
                  : currentSlide.slideType === 'quote'
                  ? 'Citação Marcante'
                  : currentSlide.slideType === 'verdict'
                  ? 'Veredito Final'
                  : 'Destaque'}
              </span>
            </div>

            {/* Main Headline */}
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight leading-snug mb-4">
              {currentSlide.headline}
            </h3>

            {/* Slide Body Text */}
            <p className="text-stone-300 text-base md:text-lg leading-relaxed font-sans mb-6">
              {currentSlide.bodyText}
            </p>

            {/* Visual Tip if present */}
            {currentSlide.visualTip && (
              <div className="mt-auto p-3.5 rounded-xl bg-stone-850/90 border border-amber-900/30 text-xs text-amber-200/90 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Dica de Foto Bookstagram:</strong> {currentSlide.visualTip}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Carousel Bottom Navigation */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between z-20">
          {/* Dot Indicators */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIdx ? 'w-6 bg-amber-400' : 'w-1.5 bg-stone-700 hover:bg-stone-500'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Prev/Next Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className={`p-2 rounded-full border transition-all ${
                currentIdx === 0
                  ? 'opacity-30 border-stone-800 text-stone-600 cursor-not-allowed'
                  : 'bg-stone-800/80 hover:bg-stone-700 border-stone-700 text-stone-200 hover:text-white'
              }`}
              title="Slide anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIdx === slides.length - 1}
              className={`p-2 rounded-full border transition-all ${
                currentIdx === slides.length - 1
                  ? 'opacity-30 border-stone-800 text-stone-600 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 border-amber-400 text-stone-950 font-bold shadow-lg shadow-amber-500/20'
              }`}
              title="Próximo slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
