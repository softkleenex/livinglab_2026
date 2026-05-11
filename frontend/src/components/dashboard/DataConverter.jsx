import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileJson, Camera, Mic, CheckCircle2, Clock, FileBadge } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

export default function DataConverter({ userContext, openIngest, openVoice }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      const pathStr = userContext.location.join('/');
      const res = await axios.get(`${API_BASE_URL}/api/v1/dashboard/personal?path=${pathStr}`);
      if (res.data?.farm?.entries) {
        setEntries(res.data.farm.entries);
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
      <div className="bg-gradient-to-br from-indigo-900/40 to-[#0A0F1A] border border-indigo-800/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2 relative z-10">
          <FileBadge className="text-indigo-400" />
          HACCP & 백신 일지 자동화
        </h2>
        <p className="text-xs text-slate-300 mb-5 leading-relaxed relative z-10">
          현장에서 작성한 교배, 백신 접종, 사육 일지를 촬영하거나 음성으로 말하세요. 
          이중 입력의 번거로움 없이 정부 인증 양식(JSON)으로 즉시 변환됩니다.
        </p>

        <div className="grid grid-cols-2 gap-3 relative z-10">
          <button 
            onClick={openIngest}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl transition-all hover:-translate-y-0.5"
          >
            <div className="p-3 bg-indigo-500/20 rounded-full text-indigo-400">
              <Camera size={24} />
            </div>
            <span className="text-sm font-bold text-indigo-100">현장 일지 촬영</span>
          </button>
          
          <button 
            onClick={openVoice}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/30 rounded-xl transition-all hover:-translate-y-0.5"
          >
            <div className="p-3 bg-teal-500/20 rounded-full text-teal-400">
              <Mic size={24} />
            </div>
            <span className="text-sm font-bold text-teal-100">간편 음성 입력</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <Clock size={16} /> 최근 문서 변환 기록
        </h3>
        
        {loading ? (
          <div className="text-center text-sm text-slate-500 py-10 animate-pulse">로딩 중...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-10 bg-[#0A0F1A]/50 rounded-xl border border-slate-800/50">
            아직 기록된 일지나 문서가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {entries.slice(0, 10).map((entry, idx) => (
              <div key={idx} className="bg-[#0A0F1A]/80 border border-slate-800/80 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 size={14} className="text-indigo-500" /> 전자 문서화 완료
                  </div>
                  <div className="text-[10px] text-slate-500">{entry.timestamp}</div>
                </div>
                <div className="text-sm text-slate-200 font-medium mb-3">
                  {entry.raw_text}
                </div>
                <div className="bg-[#05080F] p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-indigo-300/80 overflow-x-auto whitespace-pre-wrap">
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
