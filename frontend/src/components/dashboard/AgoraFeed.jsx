import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, Share2, MapPin, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com';

const Badge = React.memo(({ label, icon, color }) => {
  return (
    <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-default ${color}`}>
      {icon} {label}
    </div>
  );
});

export default function AgoraFeed({ addToast, userContext }) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const locGu = userContext?.location?.[0] || '전체 지역';
  const isFarm = userContext?.industry?.includes('스마트팜') || userContext?.industry?.includes('농업');
  const isManuf = userContext?.industry?.includes('제조') || userContext?.industry?.includes('물류');

  const fetchFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/agora/feed`);
      setFeed(res.data.feed);
    } catch (err) {
      setError("피드 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleLike = (id) => {
    setFeed(prev => prev.map(item => item.id === id ? { ...item, likes: item.likes + 1, liked: true } : item));
    addToast("이 인사이트에 $MDGA를 후원했습니다!", "success");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl mx-auto w-full pb-20">
      <div className="flex flex-col gap-2 px-4 sm:px-0">
        <div className="flex items-center gap-3">
          <Badge label="LOCAL AGORA" color="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20" />
          <Badge label="LIVE" color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Community Feed</h2>
        <p className="text-slate-400 text-xs mt-1 leading-relaxed">
          {locGu} 지역 {isFarm ? '농업/스마트팜' : isManuf ? '제조/물류' : '상권/비즈니스'} 생태계에 업로드된 데이터에서 AI가 추출한 유용한 인사이트가 실시간으로 비식별화되어 공유됩니다. 유용한 정보에 후원(Like)해 보세요!
        </p>
      </div>

      <div className="space-y-4 px-4 sm:px-0 relative">
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw size={32} className="text-fuchsia-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-2xl flex flex-col items-center justify-center gap-2">
            <AlertCircle size={32} />
            <p className="text-sm font-bold">{error}</p>
            <button onClick={fetchFeed} className="mt-4 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl text-xs font-bold transition-colors">다시 시도</button>
          </div>
        ) : feed.length === 0 ? (
           <div className="bg-[#101725] border border-slate-800 text-slate-500 p-10 rounded-2xl flex flex-col items-center justify-center gap-3">
            <MessageSquare size={32} className="opacity-50" />
            <p className="text-sm font-bold">아직 공유된 인사이트가 없습니다.</p>
          </div>
        ) : (
          <AnimatePresence>
            {feed.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#101725] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-md hover:border-fuchsia-500/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
                      <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 text-sm">{item.industry} 종사자</span>
                        <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1"><MapPin size={10}/> {item.location}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{item.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                      Trust: {item.trust_index.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="bg-[#0A0F1A] p-4 rounded-xl border border-slate-800/80 mb-4 relative">
                  <span className="absolute -top-2.5 left-4 bg-fuchsia-500/20 text-fuchsia-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border border-fuchsia-500/30">AI Insight</span>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium pt-2">{item.insights}</p>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button 
                    onClick={() => handleLike(item.id)} 
                    disabled={item.liked}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${item.liked ? 'text-rose-400 cursor-default' : 'text-slate-400 hover:text-rose-400'}`}
                  >
                    <Heart size={16} className={item.liked ? "fill-current" : ""} /> 
                    {item.likes} {item.liked ? <span className="text-[9px] ml-1 text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">Tipped $MDGA</span> : ''}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors">
                    <MessageSquare size={16} /> Comment
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors ml-auto">
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}