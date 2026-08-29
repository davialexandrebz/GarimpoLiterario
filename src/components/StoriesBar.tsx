import React from 'react';
import { Plus, Sparkles, BookOpen } from 'lucide-react';
import { STORIES_MOCK } from '../data/mockBooks';

interface StoriesBarProps {
  onStoryClick?: (storyId: string) => void;
  onCreateStory?: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({ onStoryClick, onCreateStory }) => {
  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-transparent">
      {/* Create Story Button */}
      <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group" onClick={onCreateStory}>
        <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-amber-500/60 group-hover:border-amber-400 flex items-center justify-center bg-stone-850 transition-all">
          <div className="w-full h-full rounded-full bg-stone-800 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="absolute bottom-0 right-0 p-1 bg-amber-500 rounded-full text-stone-950">
            <Sparkles className="w-2.5 h-2.5" />
          </span>
        </div>
        <span className="text-xs text-stone-300 font-medium group-hover:text-amber-300 truncate max-w-[70px]">
          Novo Story
        </span>
      </div>

      {/* Stories List */}
      {STORIES_MOCK.map((story) => (
        <div
          key={story.id}
          className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
          onClick={() => onStoryClick?.(story.id)}
        >
          <div
            className={`w-16 h-16 rounded-full p-[2px] transition-all transform group-hover:scale-105 ${
              story.hasUnseen
                ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500'
                : 'bg-stone-700'
            }`}
          >
            <div className="w-full h-full rounded-full p-0.5 bg-stone-900 overflow-hidden">
              <img
                src={story.user.avatar}
                alt={story.user.name}
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <span className="text-xs text-stone-300 group-hover:text-white truncate max-w-[72px] text-center">
            {story.previewTitle || story.user.name.split(' ')[0]}
          </span>
        </div>
      ))}
    </div>
  );
};
