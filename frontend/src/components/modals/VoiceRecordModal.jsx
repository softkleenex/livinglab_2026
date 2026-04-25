import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mic, X, RefreshCw, AudioLines, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

export default function VoiceRecordModal({ isGuest, onClose, onSuccess, locationPath, addToast }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [recording]);

  const handleToggleRecord = () => {
    if (!recording) {
      setRecording(true);
      setTimer(0);
      setTranscript('');
    } else {
      setRecording(false);
      // Simulate STT processing time
      setLoading(true);
      setTimeout(() => {
        setTranscript('AI가 백그라운드에서 주변 소음과 현장 음성을 텍스트로 변환했습니다. "오전 10시, 토마토 모종 500개 추가 입고 완료. 어제보다 일조량이 좋아서 환풍기 2단으로 가동함."');
        setLoading(false);
      }, 1500);
    }
  };

  const handleIngest = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('raw_text', transcript);
    formData.append('location', locationPath);
    if (isGuest) formData.append('is_guest', 'true');
    
    try {
      await axios.post(`${API_BASE_URL}/api/v1/ingest`, formData);
      onSuccess();
    } catch (err) { 
      if (addToast) addToast("업로드에 실패했습니다. 음성 인식 결과를 다시 확인해주세요.", "error");
      else alert("업로드 실패"); 
    } finally { 
      setLoading(false); 
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0A0F1A]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#101725] w-full max-w-md rounded-3xl border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600"></div>
        
        <div className="p-5 flex justify-between items-center bg-[#0E1420]/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Mic size={18}/></div>
            <h3 className="text-base font-black text-white tracking-widest uppercase">AI Voice Assistant</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
        </div>

        <div className="p-8 flex flex-col items-center justify-center space-y-8">
          <AnimatePresence mode="wait">
            {recording ? (
              <motion.div key="recording" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping" style={{ animationDuration: '1.5s' }}></div>
                  <div className="absolute inset-2 bg-rose-500/30 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                  <button onClick={handleToggleRecord} className="w-24 h-24 bg-gradient-to-br from-rose-500 to-red-600 rounded-full shadow-[0_0_30px_rgba(244,63,94,0.5)] flex items-center justify-center relative z-10 hover:scale-95 transition-transform">
                    <StopCircle size={40} className="text-white" />
                  </button>
                </div>
                <div className="mt-6 flex items-center gap-3 text-rose-400 font-bold tracking-widest text-lg">
                  <AudioLines className="animate-pulse" />
                  {formatTime(timer)}
                </div>
                <p className="text-xs text-slate-400 mt-2">현장 상황을 자유롭게 말씀해 주세요...</p>
              </motion.div>
            ) : transcript ? (
              <motion.div key="transcript" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-4">
                <div className="bg-[#0A0F1A] p-4 rounded-xl border border-blue-500/30 relative">
                  <span className="absolute -top-2.5 left-4 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border border-blue-500/30">STT Result (수정 가능)</span>
                  <textarea 
                    value={transcript} 
                    onChange={(e) => setTranscript(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-200 leading-relaxed font-medium pt-2 outline-none resize-none min-h-[80px]" 
                  />
                </div>
                <button onClick={handleIngest} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-[0_5px_15px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all flex justify-center items-center gap-2 disabled:opacity-50 uppercase tracking-widest">
                  {loading ? <RefreshCw className="animate-spin" size={18}/> : "텍스트로 자산화하기"}
                </button>
                <button onClick={() => setTranscript('')} className="w-full py-3 bg-slate-800/50 text-slate-400 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all">
                  다시 녹음하기
                </button>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <button onClick={handleToggleRecord} className="w-24 h-24 bg-[#101725] border border-blue-500/30 rounded-full shadow-lg flex items-center justify-center group hover:bg-blue-600/10 transition-all">
                  <Mic size={40} className="text-blue-500 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
                </button>
                <p className="text-sm text-slate-300 font-bold mt-6 mb-1">마이크를 눌러 기록 시작</p>
                <p className="text-[10px] text-slate-500 text-center max-w-[200px] break-keep">장갑을 끼고 있거나 손에 이물질이 묻은 현장에서도 음성으로 완벽하게 기록하세요.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}