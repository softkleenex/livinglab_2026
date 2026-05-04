import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileJson, Camera, Mic, CheckCircle2, Clock } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

export default function DataConverter({ userContext, openIngest, openVoice }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      const pathStr = userContext.location.join('/');
      const res = await axios.get(`${API_BASE_URL}/api/v1/dashboard/personal?path=${pathStr}`);
      if (res.data?.store?.entries) {
        setEntries(res.data.store.entries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userContext.location]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-6"
    >
      <div className="bg-gradient-to-br from-blue-900/40 to-[#0A0F1A] border border-blue-800/50 rounded-2xl p-5 shadow-lg">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <FileJson className="text-blue-400" />
          AI Data One-Touch Converter
        </h2>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          수기 영농일지나 농작물 사진을 업로드하면, 정부 표준인 JSON 형태의 'AI-Ready' 데이터로 자동 변환됩니다.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={openIngest}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl transition-colors"
          >
            <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
              <Camera size={24} />
            </div>
            <span className="text-sm font-bold text-blue-100">사진/문서 촬영</span>
          </button>
          
          <button 
            onClick={openVoice}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl transition-colors"
          >
            <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400">
              <Mic size={24} />
            </div>
            <span className="text-sm font-bold text-emerald-100">음성 기록</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <Clock size={16} /> 최근 변환 기록
        </h3>
        
        {loading ? (
          <div className="text-center text-sm text-slate-500 py-10 animate-pulse">로딩 중...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-10 bg-[#0A0F1A]/50 rounded-xl border border-slate-800/50">
            아직 기록된 데이터가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {entries.slice(0, 10).map((entry, idx) => (
              <div key={idx} className="bg-[#0A0F1A]/80 border border-slate-800/80 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" /> 변환 완료
                  </div>
                  <div className="text-[10px] text-slate-500">{new Date(entry.timestamp * 1000).toLocaleString()}</div>
                </div>
                <div className="text-sm text-slate-200 font-medium mb-3">
                  {entry.raw_text}
                </div>
                <div className="bg-[#05080F] p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-emerald-400/80 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(entry.structured_data, null, 2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
