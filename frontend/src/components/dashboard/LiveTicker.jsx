import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Sparkles, Activity } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com';

export default function LiveTicker() {
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/agora/feed`);
        setFeed(res.data.feed.slice(0, 8)); // Get latest 8 for ticker
      } catch (err) {
        console.error("Failed to load ticker data");
      }
    };
    fetchFeed();
    
    // Refresh ticker every minute to seem alive
    const interval = setInterval(fetchFeed, 60000);
    return () => clearInterval(interval);
  }, []);

  if (feed.length === 0) return null;

  return (
    <div className="w-full bg-[#0A0F1A] border-b border-slate-800 overflow-hidden flex items-center h-8 shrink-0 relative z-30">
      <div className="flex items-center gap-1.5 px-3 bg-[#0E1420] border-r border-slate-800 h-full z-10 shrink-0 shadow-[5px_0_10px_rgba(10,15,26,0.8)]">
        <Activity size={12} className="text-emerald-400 animate-pulse" />
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest hidden sm:inline">Live Network</span>
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest sm:hidden">Live</span>
      </div>
      
      {/* Marquee Container */}
      <div className="flex-1 overflow-hidden relative flex">
        <motion.div 
          className="flex whitespace-nowrap gap-8 py-1 items-center px-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
        >
          {/* Duplicate feed array twice for seamless infinite scrolling */}
          {[...feed, ...feed].map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span className="text-blue-400">{item.location}</span>
              <span className="opacity-40">•</span>
              <span className="text-emerald-400">+{Math.floor(item.trust_index * 100).toLocaleString()} $MDGA</span>
              <span className="opacity-40">•</span>
              <span className="text-slate-300 truncate max-w-[200px] inline-block">{item.insights.substring(0, 30)}...</span>
              <Sparkles size={10} className="text-yellow-500/50 inline ml-2" />
            </div>
          ))}
        </motion.div>
        
        {/* Gradients for fading effect */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0A0F1A] to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0A0F1A] to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}