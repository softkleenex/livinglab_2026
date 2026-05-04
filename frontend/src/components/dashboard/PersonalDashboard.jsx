import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TrendingUp, Database, Layers, FileText, Users, Upload, Download, Trash2, ShieldCheck, Activity, AlertTriangle, CloudRain, ShoppingCart } from 'lucide-react';
import PulseChart from './PulseChart.jsx';
import IoTSensors from './IoTSensors.jsx';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

const Badge = React.memo(({ label, icon, color }) => {
 return (
 <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-default ${color}`}>
 {icon} {label}
 </div>
 );
});

export default function PersonalDashboard({ personalData, userContext, handleExportCSV, setShowReport, handleDeleteEntry, handleDeleteStore, handleDemoInject }) {
 const [syntheticData, setSyntheticData] = useState(null);

 useEffect(() => {
   if (userContext.industry === '생산자 (농업/스마트팜)') {
     const fetchSynthetic = async () => {
       try {
         const region = userContext.location[0] + ' ' + userContext.location[1]; // e.g. 대구광역시 북구
         const res = await axios.get(`${API_BASE_URL}/api/v1/ax-data/yield-prediction?region=${region}&crop=사과`);
         setSyntheticData(res.data.data);
       } catch (e) {
         console.error(e);
       }
     };
     fetchSynthetic();
   }
 }, [userContext]);

 if (!personalData) return null;

 const isProducer = userContext.industry === '생산자 (농업/스마트팜)';
 const isSmallBusiness = userContext.industry === '소상공인 (카페/식당)';
 const isB2B = userContext.industry && userContext.industry !== '공공';
 const trustScore = personalData.store.trust_index || 50.0;
 
 let trustTier = { name: "BRONZE", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" };
 if (trustScore >= 95) trustTier = { name: "DIAMOND", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.4)]" };
 else if (trustScore >= 85) trustTier = { name: "PLATINUM", color: "text-purple-400 bg-purple-500/10 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.3)]" };
 else if (trustScore >= 70) trustTier = { name: "GOLD", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" };
 else if (trustScore >= 60) trustTier = { name: "SILVER", color: "text-slate-300 bg-slate-500/10 border-slate-500/20" };

 // Radar chart data comparing Store vs District (Parent)
 const radarData = [
 {
 subject: '자산 가치 (Value)',
 A: personalData.store.total_value > 0 ? 95 : 30, // Store
 B: personalData.parent.avg_value > 0 ? 80 : 50, // Parent Average
 fullMark: 100,
 },
 {
 subject: '활성도 (Pulse)',
 A: personalData.store.pulse || 60,
 B: personalData.parent.pulse || 65,
 fullMark: 100,
 },
 {
 subject: '신뢰도 (Trust)',
 A: personalData.store.trust_index || 50,
 B: 75,
 fullMark: 100,
 },
 {
 subject: '성장률 (Growth)',
 A: personalData.store.history && personalData.store.history.length > 1 
 ? Math.min(100, 50 + (personalData.store.history[personalData.store.history.length-1] - personalData.store.history[0]) * 2) 
 : 50,
 B: 60,
 fullMark: 100,
 },
 {
 subject: '기여도 (Entries)',
 A: Math.min(100, (personalData.store.entries?.length || 0) * 20),
 B: 40,
 fullMark: 100,
 }
 ];

 return (
 <motion.div key="personal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl mx-auto w-full pb-8 px-2 ">
 <div className="flex flex-col gap-4">
 <div className="space-y-2">
 <div className="flex items-center gap-2">
 <Badge label="STORE LEVEL" color="bg-blue-600/10 text-blue-400 border-blue-500/20" />
 <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border flex items-center gap-1 transition-all ${trustTier.color}`}>
 <ShieldCheck size={10}/> {trustTier.name} CLASS
 </div>
 </div>
 <h2 className="text-3xl font-black text-white leading-tight break-keep">{personalData.store.name}</h2>
 <p className="text-slate-400 text-xs ">
 {userContext.industry} 전용 통합 관리 대시보드
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-6">
 <div className=" space-y-6">
 {/* Phase 2 Persona Specific Metrics */}
 {isProducer && (
 <div className="grid grid-cols-1 gap-4">
   <div className="bg-[#101725] p-5 rounded-2xl border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)] relative overflow-hidden">
     <div className="absolute top-0 right-0 bg-orange-600/20 text-orange-400 text-[9px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-orange-500/20 uppercase">
       기상청 데이터 융합
     </div>
     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><CloudRain size={12}/> AI 예측 수확량 (Synthetic Data)</p>
     {syntheticData ? (
       <>
         <motion.p key="yield" initial={{ scale: 1.1, color: '#fb923c' }} animate={{ scale: 1, color: '#fb923c' }} className="text-3xl font-bold text-orange-400">
           {syntheticData.predicted_yield_kg.toLocaleString()} kg
         </motion.p>
         <p className="text-[10px] text-slate-400 mt-2">과거 대비 <span className={syntheticData.yield_change_percent < 0 ? 'text-red-400' : 'text-emerald-400'}>{syntheticData.yield_change_percent}%</span> (수급 위험도: {syntheticData.oversupply_risk_level})</p>
         <div className="mt-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
           <p className="text-[11px] text-orange-300 leading-relaxed font-medium flex items-start gap-1.5">
             <AlertTriangle size={14} className="shrink-0 mt-0.5" />
             {syntheticData.actionable_insight}
           </p>
         </div>
       </>
     ) : (
       <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-6 bg-slate-800 rounded w-3/4"></div></div></div>
     )}
   </div>
 </div>
 )}

 {isSmallBusiness && (
 <div className="grid grid-cols-1 gap-4">
   <div className="bg-[#101725] p-5 rounded-2xl border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)] relative overflow-hidden">
     <div className="absolute top-0 right-0 bg-blue-600/20 text-blue-400 text-[9px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-blue-500/20 uppercase">
       B2B 역순환 매칭
     </div>
     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><ShoppingCart size={12}/> 주변 B급 농산물 직거래 매칭</p>
     <div className="mt-3 flex flex-col gap-2">
       <div className="p-3 bg-blue-900/30 rounded-xl border border-blue-800 flex justify-between items-center cursor-pointer hover:border-blue-500/50 transition-colors">
         <div>
           <div className="text-sm font-bold text-white flex items-center gap-2">
             [사과] 흠집난 가공용 10kg <Badge label="B등급" color="bg-orange-500/20 text-orange-400 border-orange-500/30" />
           </div>
           <div className="text-[10px] text-slate-400 mt-1">대구 북구 산격동 지니스팜 (1.2km)</div>
         </div>
         <div className="text-right">
           <div className="text-lg font-black text-blue-400">₩8,500</div>
           <button className="mt-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold transition-colors">즉시 구매</button>
         </div>
       </div>
       <div className="p-3 bg-emerald-900/20 rounded-xl border border-emerald-800/50 flex justify-between items-center cursor-pointer hover:border-emerald-500/50 transition-colors">
         <div>
           <div className="text-sm font-bold text-white flex items-center gap-2">
             커피박 부산물 무상 수거 <Badge label="퇴비용" color="bg-emerald-500/20 text-emerald-400 border-emerald-500/30" />
           </div>
           <div className="text-[10px] text-slate-400 mt-1">AI 이물질 검수 완료 (통과)</div>
         </div>
         <div className="text-right">
           <button className="mt-1 px-3 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 rounded text-[10px] font-bold transition-colors">수거 요청</button>
         </div>
       </div>
     </div>
   </div>
 </div>
 )}

 {/* Default Metric Cards */}
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-colors">
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp size={12}/> 내 자산 가치</p>
 <motion.p key={personalData.store.total_value} initial={{ scale: 1.1, color: '#34d399' }} animate={{ scale: 1, color: '#34d399' }} className="text-2xl font-bold text-emerald-400 truncate">
 ₩{personalData.store.total_value.toLocaleString()}
 </motion.p>
 <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1"><Activity size={10}/> 상권 평균: ₩{personalData.parent.avg_value.toLocaleString()}</p>
 </div>
 
 <div className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-colors">
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Database size={12}/> 객체 활성도 (Pulse)</p>
 <motion.p key={personalData.store.pulse} initial={{ scale: 1.5, color: '#60a5fa' }} animate={{ scale: 1, color: '#3b82f6' }} className="text-2xl font-bold text-blue-400 mb-2 truncate">
 {personalData.store.pulse} BPM
 </motion.p>
 <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
 <PulseChart data={personalData.store.history} color="#3b82f6" title="" subtitle="" />
 </div>
 </div>
 </div>

 {/* Radar Chart: Me vs District */}
 <div className="bg-[#101725] p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col gap-6 items-center">
 <div className="w-full h-48">
 <ResponsiveContainer width="100%" height="100%">
 <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
 <PolarGrid stroke="#1e293b" />
 <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9 }} />
 <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
 <Tooltip contentStyle={{ backgroundColor: '#0E1420', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }} />
 <Radar name="내 사업장 (Site)" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
 <Radar name="상권 평균 (Avg)" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
 </RadarChart>
 </ResponsiveContainer>
 </div>
 <div className="w-full space-y-3">
 <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2 border-b border-slate-800 pb-2">Competitiveness Analysis</h3>
 <p className="text-sm text-slate-400 leading-relaxed">
 상위 노드({personalData.parent.name}) 평균 대비 
 <span className="text-blue-400 font-bold mx-1">활성도</span>와 
 <span className="text-emerald-400 font-bold mx-1">자산 가치</span>가 월등히 높습니다. 데이터 피딩을 꾸준히 유지하여 경쟁 우위를 지키세요.
 </p>
 </div>
 </div>

 {/* IoT Sensors (Only for B2B) */}
 <IoTSensors industry={userContext.industry} />

 {/* Data Hub */}
 {isB2B && (
 <div className="bg-[#101725] p-6 rounded-2xl border border-slate-800 shadow-lg">
 <div className="flex flex-col justify-between mb-4 gap-2">
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
 <Layers size={14} className="text-blue-500" /> AI-Ready 데이터 통합 연동
 </h3>
 <Badge label="Phase 2" color="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" />
 </div>
 <div className="grid grid-cols-1 gap-3">
 <button onClick={() => { if(typeof window.openIngest === 'function') window.openIngest(); else handleDemoInject(); }} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-xl transition-all cursor-pointer group">
 <FileText size={24} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
 <span className="text-xs font-bold text-slate-300">원터치 수기 장부 변환</span>
 <span className="text-[9px] text-slate-500">사진 업로드 시 JSON 자동 포맷팅</span>
 </button>
 </div>
 </div>
 )}
 </div>

 {/* Right Sidebar: AI & Data Entries */}
 <div className=" space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Consultings (보상)</h3>
 <div className="flex flex-col items-end gap-2">
 <button onClick={handleExportCSV} className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1.5 rounded-lg border border-emerald-500/20 transition-colors uppercase whitespace-nowrap">
 <Download size={12} /> CSV 다운
 </button>
 <button onClick={() => setShowReport(true)} className="flex items-center gap-1.5 text-[9px] font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1.5 rounded-lg border border-blue-500/20 transition-colors uppercase whitespace-nowrap">
 <FileText size={12} /> 주간 리포트
 </button>
 </div>
 </div>
 
 {personalData.store.entries.length === 0 ? (
 <div className="bg-[#101725] p-8 rounded-2xl border border-slate-800 text-center flex flex-col items-center gap-4 shadow-lg">
 <Database size={40} className="text-slate-700" />
 <p className="text-sm font-bold text-slate-400">자산화된 데이터가 없습니다.</p>
 <p className="text-[10px] text-slate-500 leading-relaxed break-keep">현장 사진이나 데이터를 업로드하고 AI 컨설팅을 받아보세요.</p>
 <button onClick={handleDemoInject} className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-colors w-full mt-2">
 데모 데이터 자동 주입
 </button>
 </div>
 ) : (
 <div className="space-y-3">
 {[...personalData.store.entries].reverse().map((entry, idx) => (
 <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="bg-[#101725] p-4 rounded-2xl border border-slate-800 shadow-md relative group hover:border-slate-600 transition-colors">
 <div className="flex justify-between items-start mb-3">
 <span className="text-[9px] font-bold text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded uppercase tracking-wider border border-slate-800/80">
 {entry.timestamp}
 </span>
 <div className="flex items-center gap-1.5">
 <Badge label={entry.scope === 'store_specific' ? 'Store' : 'Public'} color="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" />
 <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
 {entry.trust_index ? entry.trust_index.toFixed(1) : 50.0}%
 </span>
 </div>
 </div>
 {entry.raw_text && (
   <div className="mb-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
     <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><FileText size={10}/> Uploaded Data</p>
     <p className="text-xs text-slate-400 leading-relaxed break-keep">{entry.raw_text}</p>
     {entry.drive_link && (
       <a href={entry.drive_link} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-1 rounded">
         <Layers size={10} /> 첨부 파일 열기
       </a>
     )}
   </div>
 )}
 <div className="mb-3">
   <p className="text-[10px] font-bold text-emerald-500 uppercase mb-1 flex items-center gap-1"><ShieldCheck size={10}/> AI Insight</p>
   <p className="text-xs text-slate-300 leading-relaxed font-medium">{entry.insights}</p>
 </div>
 
 <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
 <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-1">
 <img src="/favicon.svg" className="w-3 h-3 opacity-80 grayscale contrast-200 brightness-200 sepia hue-rotate-15" alt="MDGA token icon"/>
 +{entry.effective_value?.toLocaleString() || 0}
 </span> <button onClick={() => handleDeleteEntry(entry.hash)} className="text-slate-600 hover:text-red-400 transition-colors p-1" title="데이터 삭제 (신뢰도 하락 경고)">
 <Trash2 size={14} />
 </button>
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </div>

 <div className="mt-8 pt-6 border-t border-slate-800/80 flex justify-center">
 <button onClick={handleDeleteStore} className="flex items-center gap-2 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-4 py-2 rounded-xl transition-all shadow-sm shadow-rose-900/20">
 <Trash2 size={16} /> 사업장(객체) 영구 삭제
 </button>
 </div>
 </div>
 </motion.div>
 );
}