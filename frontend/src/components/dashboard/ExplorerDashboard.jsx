import React from 'react';
import { motion } from 'framer-motion';
import { Layers, TrendingUp, ShieldCheck, MapPin, ChevronRight, Activity, ArrowLeft, Database, FileText } from 'lucide-react';
import DigitalTwinMap from './DigitalTwinMap.jsx';
import PulseChart from './PulseChart.jsx';

const BigStat = React.memo(({ label, value }) => {
 return (
 <div className="space-y-1 min-w-0">
 <div className="flex items-center gap-1.5 opacity-60">
 <Activity size={10} className="shrink-0" />
 <p className="text-[9px] font-bold tracking-widest uppercase truncate">{label}</p>
 </div>
 <p className="text-lg font-bold text-white tracking-tight truncate">{value}</p>
 </div>
 );
});

const Badge = React.memo(({ label, icon, color }) => {
 return (
 <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-default ${color}`}>
 {icon} {label}
 </div>
 );
});

export default function ExplorerDashboard({ explorerData, currentPath, goBack, setCurrentPath, navigateTo }) {
 if (!explorerData) return null;

 return (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto w-full pb-8 px-2 ">
 {/* Header with Nav */}
 <div className="flex items-center gap-3">
 {currentPath.length > 0 && (
 <button onClick={goBack} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors text-slate-300 shadow-md"><ArrowLeft size={20} /></button>
 )}
 <div className="flex flex-col">
 <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1">
 <button onClick={() => setCurrentPath([])} className="hover:text-blue-400 transition-colors flex items-center gap-1"><MapPin size={10}/> 전체 (Root)</button> {currentPath.map((p, idx) => (
 <React.Fragment key={idx}>
 <ChevronRight size={12} className="text-slate-600" />
 <button onClick={() => setCurrentPath(currentPath.slice(0, idx + 1))} className="hover:text-blue-400 transition-colors">{p}</button>
 </React.Fragment>
 ))}
 </div>
 <div className="flex items-center gap-3">
 <h2 className="text-3xl font-black text-white uppercase break-keep leading-tight">{explorerData.current}</h2>
 <Badge label={`${explorerData.type} NODE`} color="bg-blue-600/10 text-blue-400 border-blue-500/20" />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-6">
 <div className=" space-y-6">
 
 {/* Digital Twin Map for Gov/Explorer */}
 <DigitalTwinMap childrenData={explorerData.children} onMarkerClick={navigateTo} />

 <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2"><Layers size={14} className="text-blue-500"/> Sub Nodes Leaderboard</h3>
 {explorerData.children && explorerData.children.length > 0 ? (
 <div className="grid grid-cols-1 gap-3">
 {explorerData.children.sort((a,b) => b.pulse - a.pulse).map((child, idx) => (
 <div key={child.name} onClick={() => navigateTo(child.name)} className="bg-[#101725] p-4 rounded-2xl border border-slate-800/80 hover:border-blue-500/50 hover:bg-[#121A2A] cursor-pointer group transition-all flex flex-col items-start justify-between relative overflow-hidden gap-4">
 {idx === 0 && (
 <div className="absolute top-0 right-0 bg-rose-500/20 text-rose-400 text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-lg shadow-rose-500/20">
 Top Activity 🔥
 </div>
 )}
 <div className="flex items-center gap-4 relative z-10 w-full ">
 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 border ${idx === 0 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : idx === 1 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : idx === 2 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
 {idx + 1}
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-base font-bold text-slate-200 truncate">{child.name}</p>
 <div className="flex items-center gap-2 mt-1">
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{child.type} LEVEL</p>
 <span className="text-slate-700 text-[8px]">|</span>
 <span className="text-[10px] font-bold text-yellow-400">₩{(child.value || 0).toLocaleString()}</span>
 </div>
 </div>
 </div>
 
 <div className="flex items-center justify-between w-full gap-6 shrink-0 border-t border-slate-800/60 pt-3 ">
 <div className="flex flex-col items-start ">
 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">ACTIVITY</p>
 <span className={`text-xl font-black font-mono tracking-tighter ${idx === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{child.pulse} <span className="text-[10px]">BPM</span></span>
 </div>
 <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-blue-600 transition-colors shrink-0">
 <ChevronRight size={16}/>
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="bg-[#101725] p-8 rounded-2xl border border-slate-800 text-center flex flex-col items-center gap-3">
 <Layers size={32} className="text-slate-600" />
 <p className="text-sm font-bold text-slate-400">하위 노드가 없습니다.</p>
 </div>
 )}
 </div>

 {/* Global Regional Analysis / Graphs Sidebar */}
 <div className=" space-y-4">
 <div className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group">
 <div className="absolute top-0 right-0 bg-blue-600/20 text-blue-400 text-[9px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-blue-500/20 uppercase">
 Aggregated
 </div>
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp size={12}/> 총 자산 규모 (Total Value)</p>
 <p className="text-3xl font-black text-emerald-400 mb-2 mt-2 drop-shadow-md">
 ₩{explorerData.total_value?.toLocaleString() || 0}
 </p>
 <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/60">
 <BigStat label="Node Density" value={explorerData.metadata?.nodes || 0} />
 <BigStat label="Integrity" value={`${explorerData.trust_index || explorerData.metadata?.trust_index || 50.0}%`} />
 </div>
 </div>
 
 <div className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg">
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
 <Activity size={14} className="text-blue-500" /> Regional Pulse Trend
 </h3>
 <div className="h-40 -mx-2">
 <PulseChart data={explorerData.metadata?.history || []} color="#fb7185" title="" subtitle="" />
 </div>
 <p className="text-[10px] text-slate-400 leading-relaxed mt-4 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
 <span className="font-bold text-rose-400">AI Insight:</span> 
 {' '}최근 하위 상권/생산 지역의 활성도(Pulse)가 상승 곡선을 그리고 있습니다. 전체 노드의 유기적인 연결과 실시간 피딩이 경제 효과(Asset Value) 증가로 이어지고 있습니다.
 </p>
 </div>
 </div>

 </div>

 {/* Roll-up Data Entries for Region */}
 {explorerData.entries && explorerData.entries.length > 0 && (
 <div className="space-y-4 mt-8 bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg">
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
 <Database size={14} className="text-emerald-400" /> 지역구 발생 데이터 집계 ({explorerData.entries.length})
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {explorerData.entries.map((entry, idx) => (
 <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-[#0A0F1A] p-4 rounded-2xl border border-slate-800 shadow-md relative group hover:border-slate-600 transition-colors">
 <div className="flex justify-between items-start mb-3">
 <div className="flex flex-col gap-1">
 <span className="text-[10px] font-bold text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-800/50 self-start truncate max-w-[150px]">
 {entry.store_name || "알 수 없음"}
 </span>
 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
 {entry.timestamp}
 </span>
 </div>
 <div className="flex flex-col items-end gap-1">
 <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
 Trust {entry.trust_index ? entry.trust_index.toFixed(1) : 50.0}%
 </span>
 <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-1">
 <TrendingUp size={10} /> +{entry.effective_value?.toLocaleString() || 0}
 </span>
 </div>
 </div>
 
 {entry.raw_text && (
 <div className="mb-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
 <p className="text-[9px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><FileText size={10}/> Uploaded Data</p>
 <p className="text-[10px] text-slate-400 leading-relaxed break-keep truncate">{entry.raw_text}</p>
 </div>
 )}
 
 <div>
 <p className="text-[9px] font-bold text-emerald-500 uppercase mb-1 flex items-center gap-1"><ShieldCheck size={10}/> AI Insight</p>
 <p className="text-[10px] text-slate-300 leading-relaxed font-medium line-clamp-3">{entry.insights}</p>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 )}

 </motion.div>
 );
}