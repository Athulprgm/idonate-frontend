import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  Search,
  Droplets,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowUp
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import CommunityChoiceModal from './CommunityChoiceModal.jsx';
import { queryJeevaLinkAI } from '../utils/aiService.js';
import MascotVideo from './MascotVideo.jsx';

export default function BloodHeroAssistant() {
  const { user } = useAuthStore();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "👋 **Hello!** I am **Hemo**, your assistant for the JeevaLink blood donation network.\n\nI can help you with donor eligibility rules, blood compatibility, emergency requests, and platform services across Kerala.\n\nHow can I help you today?"
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Quick suggestion chips
  const SUGGESTED_PROMPTS = [
    { label: "🩸 Am I eligible to donate?", query: "Am I eligible to donate blood? What are the key requirements?" },
    { label: "🧪 O- Blood compatibility", query: "Which blood groups can receive O- negative blood?" },
    { label: "🚑 How emergency requests work", query: "How do emergency blood requests work on JeevaLink?" },
    { label: "📍 Find donors in Kerala", query: "How can I find registered voluntary donors across Kerala?" }
  ];

  // Scroll chat messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Lock body scroll on mobile when chat is open
  useEffect(() => {
    if (isOpen) {
      const handleResize = () => {
        if (window.innerWidth < 640) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('resize', handleResize);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isThinking) return;

    const currentHistory = [...messages];
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setInputQuery('');
    setIsThinking(true);

    try {
      const response = await queryJeevaLinkAI(query, currentHistory);
      setMessages((prev) => [...prev, { sender: 'assistant', text: response }]);
    } catch (err) {
      console.error('[BloodHeroAssistant] Error getting response:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `⚠️ **Connection Error**: ${err.message || 'Unable to connect to server. Please try again.'}`,
          isError: true,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleLanguageSelect = async (lang) => {
    setLanguageSelected(true);
    const query = `I prefer to communicate in ${lang}. Please reply in ${lang} from now on and greet me.`;
    const currentHistory = [...messages];

    setMessages((prev) => [...prev, { sender: 'user', text: `Selected Language: ${lang}` }]);
    setIsThinking(true);

    try {
      const response = await queryJeevaLinkAI(query, currentHistory);
      setMessages((prev) => [...prev, { sender: 'assistant', text: response }]);
    } catch (err) {
      console.error('[BloodHeroAssistant] Error setting language:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `⚠️ **Connection Error**: Unable to set language. Please try again.`,
          isError: true,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'assistant',
        text: "👋 **Chat Reset!** I am **Hemo**. Ask me anything about voluntary blood donation, donor eligibility, or emergency sourcing across Kerala."
      }
    ]);
    setLanguageSelected(false);
  };

  const handleAction = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  // Helper to render bold and bullet formatted text cleanly
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');

    return lines.map((line, lIdx) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ');
      const cleanLine = isBullet ? trimmed.replace(/^[*|-]\s+/, '') : line;
      const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);

      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-extrabold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={lIdx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-red-500 font-bold shrink-0">•</span>
            <span className="leading-snug">{formattedLine}</span>
          </div>
        );
      }

      return (
        <p key={lIdx} className={lIdx > 0 ? 'mt-1.5 leading-relaxed' : 'leading-relaxed'}>
          {formattedLine}
        </p>
      );
    });
  };

  if (location.pathname === '/login') {
    return null;
  }

  return (
    <>
      <CommunityChoiceModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
      />

      {/* ── Fixed Assistant Chatbox Dialog ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[9998] sm:hidden"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 14 }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
              className="fixed inset-x-3 bottom-3 top-14 sm:inset-auto sm:bottom-6 sm:right-6 z-[9999] w-auto sm:w-[395px] sm:h-[600px] sm:max-h-[calc(100vh-48px)] rounded-[32px] bg-white shadow-[0_24px_64px_-12px_rgba(0,0,0,0.16),0_0_1px_1px_rgba(0,0,0,0.06)] border border-slate-200/60 overflow-hidden flex flex-col select-text"
            >
              {/* Premium Minimal Frosted Header */}
              <div className="bg-white/95 backdrop-blur-xl px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 select-none">
                {/* Left: Avatar + Identity */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-slate-50 p-0.5 ring-1 ring-slate-200/80 shadow-xs flex items-center justify-center overflow-hidden">
                      <img src="/hemo_avatar.png" alt="Hemo" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 ring-2 ring-white rounded-full" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold tracking-tight text-slate-900 leading-none">Hemo</h3>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-semibold border border-red-100/70">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>AI</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-normal leading-tight mt-1">JeevaLink Assistant</p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    type="button"
                    onClick={handleClearChat}
                    title="Reset Chat"
                    aria-label="Reset Chat"
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    title="Close"
                    aria-label="Close Chat"
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chatbox Messages Body */}
              <div className="p-4 space-y-3 overflow-y-auto overscroll-contain flex-1 text-xs bg-[#fbfbfd] scrollbar-thin">
                {/* Quick Topic Prompts if few messages */}
                {messages.length <= 2 && (
                  <div className="space-y-2 mb-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                        Suggested Topics
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {SUGGESTED_PROMPTS.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => handleSendMessage(prompt.query)}
                          className="w-full text-left px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/70 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-medium transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
                        >
                          <span className="truncate">{prompt.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages List */}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'assistant' && (
                      <img
                        src="/hemo_avatar.png"
                        alt="Hemo"
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 shrink-0 mb-1"
                      />
                    )}
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-slate-900 text-white font-normal rounded-tr-xs shadow-xs text-[12.5px]'
                          : msg.isError
                            ? 'bg-rose-50 text-rose-900 border border-rose-200 font-medium rounded-tl-xs'
                            : 'bg-white text-slate-800 border border-slate-200/70 rounded-tl-xs shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
                      }`}
                    >
                      <div className="text-[12.5px] whitespace-pre-wrap leading-relaxed">
                        {msg.sender === 'assistant' ? renderFormattedText(msg.text) : msg.text}
                      </div>

                      {/* Language buttons */}
                      {msg.sender === 'assistant' && idx === 2 && !languageSelected && (
                        <div className="mt-3 flex gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleLanguageSelect('Malayalam')}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-[11px] font-semibold transition-all cursor-pointer"
                          >
                            മലയാളം
                          </button>
                          <button
                            onClick={() => handleLanguageSelect('English')}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-[11px] font-semibold transition-all cursor-pointer"
                          >
                            English
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isThinking && (
                  <div className="flex items-end gap-2">
                    <img
                      src="/hemo_avatar.png"
                      alt="Hemo"
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 shrink-0 mb-1"
                    />
                    <div className="bg-white border border-slate-200/70 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-2xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                      <span className="text-[11px] font-medium text-slate-400 ml-1">Hemo is thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Minimal Action Shortcuts Bar */}
              <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                {user?.role === 'user' ? (
                  <button
                    type="button"
                    onClick={() => handleAction('/donor/eligibility')}
                    className="flex-1 py-1.5 px-3 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-700 hover:text-slate-900 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Eligibility</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAction('/donor/search')}
                    className="flex-1 py-1.5 px-3 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-700 hover:text-slate-900 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Search className="w-3.5 h-3.5 text-red-600" />
                    <span>Find Donors</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleAction('/requests')}
                  className="flex-1 py-1.5 px-3 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-700 hover:text-slate-900 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Droplets className="w-3.5 h-3.5 text-red-600" />
                  <span>Blood Requests</span>
                </button>
              </div>

              {/* Chat Input Capsule */}
              <div className="p-3 border-t border-slate-100 bg-white shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative flex items-center"
                >
                  <div className="w-full flex items-center gap-2 bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-300 border border-transparent rounded-full pl-4 pr-1.5 py-1.5 transition-all">
                    <input
                      type="text"
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder="Ask Hemo about blood donation..."
                      className="flex-1 bg-transparent text-xs sm:text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!inputQuery.trim() || isThinking}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        inputQuery.trim() && !isThinking
                          ? 'bg-slate-900 text-white shadow-xs hover:bg-black active:scale-95'
                          : 'bg-slate-200/60 text-slate-400 cursor-not-allowed'
                      }`}
                      aria-label="Send message"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Floating Mascot Trigger Button (Responsive Size) ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 sm:bottom-6 right-2 sm:right-6 z-[9990] flex items-end select-none pointer-events-auto"
          >
            <motion.button
              type="button"
              onClick={() => setIsOpen(true)}
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.05 }}
              className="relative flex items-center justify-center p-0 bg-transparent border-0 outline-none cursor-pointer drop-shadow-2xl w-[145px] h-[145px] sm:w-[175px] sm:h-[175px] md:w-[200px] md:h-[200px] transition-all"
              aria-label="Open Hemo Blood Assistant"
            >
              <MascotVideo showBubble={true} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
