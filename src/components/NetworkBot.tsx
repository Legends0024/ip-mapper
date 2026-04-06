import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, ChevronDown, Sparkles, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "bot" | "user";
  text: string;
  timestamp: Date;
}

interface NetworkBotProps {
  initialQuery?: string | null;
  onCloseQuery?: () => void;
}

export default function NetworkBot({ initialQuery, onCloseQuery }: NetworkBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Welcome to **NetGuide v2.1**! I am your advanced CNIP Assistant. Ask me anything about networking, IP security, or how to detect email scams.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (initialQuery) {
      setIsOpen(true);
      handleSend(initialQuery);
      if (onCloseQuery) onCloseQuery();
    }
  }, [initialQuery]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: "user", text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      
      setTimeout(() => {
        const botMsg: Message = { 
          role: "bot", 
          text: data.response || "I'm sorry, I encountered a network error in my knowledge core.", 
          timestamp: new Date() 
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 800);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "bot", text: "Connection error. Please ensure the backend server is active.", timestamp: new Date() }]);
    }
  };

  const quickPrompts = [
    "Find Email IP",
    "Explain IPv4 vs IPv6",
    "What is a Subnet Mask?",
    "Why is location USA?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
            className="w-[380px] sm:w-[420px] h-[600px] glass-card-static flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-indigo-500/40 mb-6 overflow-hidden ring-1 ring-white/10"
          >
            {/* Header */}
            <div className="relative p-5 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-brand-dark/40 border-b border-white/10 flex items-center justify-between backdrop-blur-2xl">
              <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                    <Bot size={26} className="text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-brand-dark rounded-full shadow-lg" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white leading-tight tracking-tight flex items-center gap-2">
                    NetGuide Pro
                    <Sparkles size={14} className="text-amber-400 fill-amber-400" />
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={10} className="text-indigo-400" />
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.1em]">Academic Intelligence</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all transform hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-black/10"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/10 text-slate-400'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`shadow-xl px-4 py-3 rounded-2xl text-[13px] leading-relaxed relative ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none backdrop-blur-md'}`}>
                      {msg.text.split('\n').map((line, j) => (
                        <p key={j} className={j > 0 ? "mt-2" : ""}>
                          {line.split('**').map((part, k) => k % 2 === 1 ? <b key={k} className="text-amber-400 font-bold">{part}</b> : part)}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3 items-center bg-white/5 px-4 py-3 rounded-2xl rounded-tl-none border border-white/10 backdrop-blur-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Input */}
            <div className="p-5 bg-black/40 border-t border-white/10 backdrop-blur-2xl">
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-2">
                {quickPrompts.map(p => (
                  <button 
                    key={p} 
                    onClick={() => handleSend(p)}
                    className="whitespace-nowrap px-4 py-2 rounded-xl bg-white/5 hover:bg-indigo-600/20 text-[11px] text-slate-400 hover:text-white border border-white/5 hover:border-indigo-500/50 transition-all font-bold tracking-tight"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex gap-3"
              >
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask NetGuide anything..."
                  className="flex-1 bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08, rotate: 5 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40 border border-white/30 relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <ChevronDown size={32} />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative">
              <MessageSquare size={30} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-indigo-600 rounded-full animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
