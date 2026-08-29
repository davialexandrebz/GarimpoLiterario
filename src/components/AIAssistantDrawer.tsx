import React, { useState, useRef, useEffect } from 'react';
import { Book, AIChatMessage, UserProfile } from '../types';
import {
  X,
  Sparkles,
  Send,
  BookOpen,
  HelpCircle,
  Layers,
  Award,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  user: UserProfile;
  onOpenCreatePostWithBook?: (bookTitle: string) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  books,
  user,
  onOpenCreatePostWithBook,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Olá, ${user.name.split(' ')[0]}! 📚✨ Sou a inteligência artificial central do **SocialBooks**.\n\nComo posso enriquecer suas leituras hoje?\n• Posso **recomendar livros** pelo seu humor ou tropos favoritos\n• Criar **carrosséis e legendas estéticas** para o seu feed Bookstagram\n• Gerar **fichas técnicas completas e resumos 100% sem spoilers**\n• Descobrir **curiosidades sobre autores** e debater obras!\n\nQual livro está no seu radar?`,
      timestamp: 'Agora',
      suggestedActions: [
        '🎯 Me recomende um livro para hoje',
        '📸 Criar carrossel para meu feed',
        '📋 Ficha técnica sem spoilers de Torto Arado',
        '✨ Sugerir hashtags em alta no BookTok',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const currentReadingBooks = books
    .filter((b) => b.status === 'lendo')
    .map((b) => b.title)
    .join(', ');

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: AIChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: 'Agora',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const res = await geminiService.sendChatMessage(
        query.trim(),
        [],
        {
          currentBooks: currentReadingBooks || 'A Biblioteca da Meia-Noite',
          readCount: user.readingGoal.currentBooks,
          favoriteGenres: user.favoriteGenres,
        }
      );

      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        timestamp: 'Agora',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error querying AI assistant:', err);
      const errorMsg: AIChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'Desculpe, tive uma breve oscilação na minha conexão literária. Por favor, tente me perguntar novamente!',
        timestamp: 'Agora',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-stone-900 border-l border-stone-800 h-full flex flex-col shadow-2xl text-stone-100">
        {/* Header */}
        <div className="p-4 px-6 border-b border-stone-800 bg-gradient-to-r from-stone-900 via-stone-850 to-amber-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-stone-950 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-white flex items-center gap-1.5">
                <span>IA Literária SocialBooks</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] text-amber-300 font-sans font-medium">
                  Central AI
                </span>
              </h3>
              <p className="text-[11px] text-stone-400">
                Recomendações, posts Bookstagram e fichas técnicas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-4 text-xs leading-relaxed font-sans shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-stone-950 font-medium rounded-tr-none'
                    : 'bg-stone-850 border border-stone-800 text-stone-200 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Suggested Action Pills */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-3 border-t border-stone-700/60 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(action)}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-amber-300 border border-stone-700 text-left transition-all"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-stone-500 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium bg-stone-850 border border-stone-800 p-3 rounded-2xl w-fit">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span>A IA Literária está folheando o catálogo...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-stone-850/80 border-t border-stone-800 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <button
            onClick={() => handleSendMessage('Me recomende um romance enemies to lovers envolvente')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 hover:text-amber-300 whitespace-nowrap border border-stone-700"
          >
            ⚔️ Enemies to Lovers
          </button>
          <button
            onClick={() => handleSendMessage('Quais as melhores tags literárias para usar hoje?')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 hover:text-amber-300 whitespace-nowrap border border-stone-700"
          >
            #️⃣ Hashtags em Alta
          </button>
          <button
            onClick={() => handleSendMessage('Crie um carrossel de 4 slides para o livro Torto Arado')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 hover:text-amber-300 whitespace-nowrap border border-stone-700"
          >
            🌾 Post Torto Arado
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 border-t border-stone-800 bg-stone-850 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Pergunte sobre livros, resenhas, posts..."
            className="flex-1 bg-stone-900 border border-stone-700/80 rounded-xl px-4 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 disabled:opacity-40 font-bold transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
