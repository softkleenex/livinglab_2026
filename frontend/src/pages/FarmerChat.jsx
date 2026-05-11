import React, { useState } from 'react';
import { Send, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FarmerChat() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: '안녕하세요! 무엇을 도와드릴까요?' }
  ]);
  const [input, setInput] = useState('');
  const [toast, setToast] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { id: Date.now(), type: 'user', text: input }]);
    setInput('');
    
    // Simulate AI parsing result after a short delay
    setTimeout(() => {
      setToast('✅ 기록 완료: 온도 30도, 흰가루병 감지됨');
      setTimeout(() => setToast(null), 3000);
    }, 500);
  };

  const handleCameraClick = () => {
    setToast('✅ 기록 완료: 온도 30도, 흰가루병 감지됨');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#FAFAFA] text-slate-900 font-sans sm:max-w-md sm:mx-auto sm:border-x sm:border-slate-200 sm:shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-white/90 backdrop-blur-lg border-b border-slate-200 flex items-center px-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold tracking-tight text-slate-800">MDGA Copilot</h1>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#F0F2F5]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm ${msg.type === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-3 pb-safe shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-slate-100 rounded-full px-2 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
          <button type="button" onClick={handleCameraClick} className="p-2 text-slate-400 hover:text-slate-600 transition-colors shrink-0">
            <Camera size={22} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="상태를 입력하세요..."
            className="flex-1 bg-transparent border-none outline-none text-[15px] px-1 placeholder:text-slate-400 text-slate-800"
          />
          <button type="submit" disabled={!input.trim()} className="p-2 bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:bg-slate-300 transition-colors shrink-0 shadow-sm">
            <Send size={18} className="-ml-0.5" />
          </button>
        </form>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90%] bg-slate-900/95 backdrop-blur-md text-white px-4 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-center text-sm font-semibold text-center z-50 tracking-wide"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
