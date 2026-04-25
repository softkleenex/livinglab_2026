import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Volume2, VolumeX, CheckSquare, Square, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

export default function MDGACopilot({ locationPath, industry, entries = [], onActionComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "안녕하세요! MDGA AI Copilot입니다. 데이터를 선택하고 삭제, 생성, 수정 등 무엇이든 요청해 보세요.", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const messagesEndRef = useRef(null);
  
  const [selectedHashes, setSelectedHashes] = useState([]);
  const [showFiles, setShowFiles] = useState(false);

  useEffect(() => {
    if (entries) {
      setSelectedHashes(entries.map(e => e.hash));
    }
  }, [entries]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, showFiles]);

  useEffect(() => {
    // Cleanup audio on close
    if (!isOpen && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
    }
  }, [isOpen]);

  const handleSpeak = (id, text) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (playingId === id) {
        setPlayingId(null);
        return;
      }
    }
    setPlayingId(id);
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_]/g, ''));
    utterance.lang = 'ko-KR';
    utterance.rate = 1.1;
    utterance.onend = () => setPlayingId(null);
    window.speechSynthesis.speak(utterance);
  };
  
  const toggleHash = (hash) => {
    setSelectedHashes(prev => prev.includes(hash) ? prev.filter(h => h !== hash) : [...prev, hash]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), text: userMsg, sender: 'user' }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/chat`, {
        path: locationPath,
        industry: industry,
        message: userMsg,
        selected_hashes: selectedHashes
      });
      setMessages(prev => [...prev, { id: Date.now(), text: res.data.reply, sender: 'ai' }]);
      
      if (res.data.reply.includes('[시스템]') && onActionComplete) {
        onActionComplete();
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), text: "오류가 발생했습니다. 다시 시도해주세요.", sender: 'ai', error: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-6 z-50 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-110 transition-transform group flex items-center gap-2"
          >
            <Bot size={24} className="group-hover:animate-bounce" />
            <span className="hidden group-hover:inline font-bold text-xs pr-2 tracking-widest uppercase">Ask AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-6 z-50 w-[90vw] max-w-sm h-[500px] max-h-[70vh] bg-[#101725] border border-slate-700/80 shadow-2xl rounded-3xl flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-[#0E1420]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg"><Bot size={18}/></div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">MDGA Copilot</h3>
                  <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-1"><Sparkles size={8}/> Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white p-1"><X size={18}/></button>
            </div>
            
            {/* File Selection Context Bar */}
            <div className="bg-[#0A0F1A] border-b border-slate-800 px-4 py-2 flex flex-col gap-2">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowFiles(!showFiles)}>
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                  <FileText size={12}/> 첨부된 데이터 ({selectedHashes.length}/{entries.length})
                </span>
                <span className="text-[10px] text-slate-500">{showFiles ? '숨기기' : '펼치기'}</span>
              </div>
              
              <AnimatePresence>
                {showFiles && (
                  <motion.div initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}} exit={{height: 0, opacity: 0}} className="flex flex-col gap-1 max-h-32 overflow-y-auto custom-scrollbar">
                    {entries.map(e => (
                      <div key={e.hash} onClick={() => toggleHash(e.hash)} className="flex items-center gap-2 p-2 rounded hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-700">
                        {selectedHashes.includes(e.hash) ? <CheckSquare size={14} className="text-blue-400 shrink-0"/> : <Square size={14} className="text-slate-600 shrink-0"/>}
                        <span className="text-[10px] text-slate-300 truncate font-mono">[{e.hash.substring(0,8)}] {e.raw_text || e.insights.substring(0, 20)}...</span>
                      </div>
                    ))}
                    {entries.length === 0 && <p className="text-[10px] text-slate-500 py-1">현재 사업장에 데이터가 없습니다.</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-[#0E1420] to-[#101725]">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="relative group">
                    <div className={`max-w-[240px] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      m.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-sm' 
                        : m.error 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-bl-sm'
                          : 'bg-slate-800 text-slate-200 rounded-bl-sm shadow-md'
                    }`}>
                      {m.text}
                    </div>
                    {m.sender === 'ai' && !m.error && (
                      <button 
                        onClick={() => handleSpeak(m.id, m.text)} 
                        className="absolute -right-8 top-1 p-1.5 text-slate-500 hover:text-blue-400 bg-[#0E1420] border border-slate-700 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        title="TTS 읽어주기"
                      >
                        {playingId === m.id ? <VolumeX size={12} className="text-rose-400 animate-pulse" /> : <Volume2 size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 p-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-[#0E1420] flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask or command (e.g. Delete first data)..."
                className="flex-1 bg-[#101725] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 outline-none"
              />
              <button type="submit" disabled={!input.trim() || loading} className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-50 transition-colors">
                <Send size={16} className="ml-1" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}