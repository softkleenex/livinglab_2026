import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FileText, X, RefreshCw, Download, Volume2, VolumeX, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

export default function ReportModal({ onClose, locationPath, userContext }) {
 const [report, setReport] = useState('');
 const [loading, setLoading] = useState(true);
 const [speaking, setSpeaking] = useState(false);
 const [copied, setCopied] = useState(false);
 const utteranceRef = useRef(null);

 const isB2B = userContext?.industry && userContext?.industry !== '공공';
 const industryName = userContext?.industry || '비즈니스';

 useEffect(() => {
 const fetchReport = async () => {
 try {
 const res = await axios.get(`${API_BASE_URL}/api/v1/dashboard/report`, {
   params: {
     path: locationPath,
     industry: userContext?.industry || '공공'
   }
 });
 setReport(res.data.report);
 } catch (err) { 
   console.error(err);
   setReport("리포트를 생성하지 못했습니다.");
 } finally {
 setLoading(false);
 }
 };
 fetchReport();
 
 return () => {
 if (window.speechSynthesis) window.speechSynthesis.cancel();
 };
 }, [locationPath, isB2B, userContext?.industry]);

 const handleDownload = () => {
 const element = document.createElement("a");
 const file = new Blob([report], {type: 'text/plain'});
 element.href = URL.createObjectURL(file);
 element.download = isB2B ? `${industryName}_AI_Report_${new Date().toISOString().split('T')[0]}.txt` : `MDGA_주간_경영_리포트_${new Date().toISOString().split('T')[0]}.txt`;
 document.body.appendChild(element);
 element.click();
 document.body.removeChild(element);
 };

 const handleCopy = () => {
 navigator.clipboard.writeText(report);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 };

 const toggleTTS = () => {
 if (!('speechSynthesis' in window)) return alert('TTS를 지원하지 않는 브라우저입니다.');
 
 if (speaking) {
 window.speechSynthesis.cancel();
 setSpeaking(false);
 } else {
 const cleanText = report.replace(/[*#_[\]]/g, '');
 const utterance = new SpeechSynthesisUtterance(cleanText);
 utterance.lang = 'ko-KR';
 utterance.rate = 1.15;
 utterance.onend = () => setSpeaking(false);
 utteranceRef.current = utterance;
 window.speechSynthesis.speak(utterance);
 setSpeaking(true);
 }
 };

 return (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0A0F1A]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
 <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#101725] w-full max-w-2xl max-h-[85vh] rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col relative overflow-hidden">
 
 {/* Header */}
 <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-[#0E1420] shrink-0">
 <div className="flex items-center gap-3">
 <div className={`p-2 rounded-xl text-white shadow-lg ${isB2B ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-blue-600 shadow-blue-600/20'}`}><FileText size={18}/></div>
 <div>
 <h3 className="text-sm font-black text-white uppercase tracking-wider">{isB2B ? `AI ${industryName} 데이터 분석 리포트` : '주간 경영 요약 뉴스레터'}</h3>
 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{locationPath}</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 {!loading && (
 <button onClick={toggleTTS} className={`p-2 rounded-xl border transition-all ${speaking ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse' : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'}`} title="AI 브리핑 듣기">
 {speaking ? <VolumeX size={16}/> : <Volume2 size={16}/>}
 </button>
 )}
 <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/50 rounded-xl border border-transparent transition-all"><X size={20}/></button>
 </div>
 </div>

 {/* Content */}
 <div className="p-6 overflow-y-auto grow custom-scrollbar bg-gradient-to-b from-[#101725] to-[#0A0F1A]">
 <AnimatePresence mode="wait">
 {loading ? (
 <motion.div key="loader" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="py-20 flex flex-col items-center justify-center gap-6">
 <div className="relative">
 <RefreshCw className={`animate-spin ${isB2B ? 'text-emerald-500' : 'text-blue-500'}`} size={40}/>
 <div className={`absolute inset-0 blur-xl opacity-50 ${isB2B ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
 </div>
 <div className="text-center space-y-2">
 <p className="text-base text-white font-bold tracking-wide">데이터 교차 분석 및 리포트 작성 중...</p>
 <p className="text-xs text-slate-500">지역 평균 지표와 농장 실시간 펄스(Pulse)를 비교하고 있습니다.</p>
 </div>
 </motion.div>
 ) : (
 <motion.div key="content" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="flex flex-col h-full">
 <div className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap font-medium flex-grow mb-8 font-mono bg-[#0E1420] p-5 rounded-2xl border border-slate-800 shadow-inner">
 {report}
 </div>
 
 {/* Actions */}
 <div className="flex flex-col gap-3 mt-auto shrink-0">
 <button 
 onClick={handleCopy}
 className="flex-1 py-3.5 bg-[#0E1420] text-slate-300 border border-slate-700 hover:bg-slate-800 hover:border-slate-500 rounded-xl font-bold text-xs transition-all flex justify-center items-center gap-2"
 >
 {copied ? <Check size={16} className="text-emerald-400"/> : <Copy size={16}/>} 
 {copied ? '복사 완료!' : '텍스트 복사'}
 </button>
 <button 
 onClick={handleDownload}
 className={`flex-1 py-3.5 border rounded-xl font-black text-xs transition-all flex justify-center items-center gap-2 shadow-lg ${isB2B ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-600 hover:text-white hover:shadow-emerald-500/30' : 'bg-blue-600/20 text-blue-400 border-blue-500/50 hover:bg-blue-600 hover:text-white hover:shadow-blue-500/30'}`}
 >
 <Download size={16} /> 원문 다운로드 (.txt)
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </motion.div>
 </motion.div>
 );
}
