import React from 'react';
import { ReadingGoal, Badge } from '../types';
import { Target, BookOpen, Flame, Award, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReadingGoalWidgetProps {
  goal: ReadingGoal;
  badges: Badge[];
  onOpenGoalModal?: () => void;
  onOpenBadgesModal?: () => void;
}

export const ReadingGoalWidget: React.FC<ReadingGoalWidgetProps> = ({
  goal,
  badges,
  onOpenGoalModal,
  onOpenBadgesModal,
}) => {
  const booksPercentage = Math.min(Math.round((goal.currentBooks / goal.targetBooks) * 100), 100);
  const pagesPercentage = Math.min(Math.round((goal.currentPages / goal.targetPages) * 100), 100);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ec4899', '#6366f1', '#10b981'],
    });
  };

  return (
    <div className="rounded-2xl border border-stone-800/80 bg-stone-900/90 backdrop-blur-md p-5 shadow-xl space-y-5 text-stone-100">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-stone-100">Meta Literária {goal.year}</h3>
            <p className="text-xs text-stone-400">Desafio de Leituras Skoob</p>
          </div>
        </div>

        <button
          onClick={triggerCelebration}
          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs flex items-center gap-1 transition-colors"
          title="Celebrar progresso!"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{booksPercentage}%</span>
        </button>
      </div>

      {/* Books Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-stone-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            Livros Lidos
          </span>
          <span className="text-amber-300">
            <strong className="text-white text-sm">{goal.currentBooks}</strong> / {goal.targetBooks}
          </span>
        </div>

        <div className="h-2.5 w-full bg-stone-800 rounded-full overflow-hidden p-0.5 border border-stone-700/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400 transition-all duration-500"
            style={{ width: `${booksPercentage}%` }}
          />
        </div>
      </div>

      {/* Pagômetro (Pages counter) & Streak */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Pagômetro */}
        <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pagômetro</span>
          </div>
          <div className="mt-2">
            <span className="text-base font-bold text-white tracking-tight">
              {goal.currentPages.toLocaleString('pt-BR')}
            </span>
            <span className="text-[10px] text-stone-400 ml-1">páginas</span>
          </div>
          <div className="mt-1 h-1 w-full bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${pagesPercentage}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Sequência</span>
          </div>
          <div className="mt-2">
            <span className="text-base font-bold text-white tracking-tight">
              {goal.streakDays}
            </span>
            <span className="text-[10px] text-stone-400 ml-1">dias seguidos</span>
          </div>
          <span className="text-[10px] text-amber-400 font-medium">🔥 Lendo hoje</span>
        </div>
      </div>

      {/* Badges Preview */}
      <div className="pt-2 border-t border-stone-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Conquistas Literárias
          </span>
          <button
            onClick={onOpenBadgesModal}
            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
          >
            Ver todas <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {badges.slice(0, 4).map((badge) => (
            <div
              key={badge.id}
              title={`${badge.name}: ${badge.description}`}
              className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                badge.unlockedAt
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-stone-800/40 border-stone-800 text-stone-600 opacity-60'
              }`}
            >
              <Award className="w-4 h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
