import React, { useState } from 'react';
import axios from 'axios';
import { RefreshCw, PieChart, MapPin, TrendingUp, Users, BarChart3, BrainCircuit, X, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

const Badge = React.memo(({ label, icon, color }) => {
 return (
 <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-default ${color}`}>
 {icon} {label}
 </div>
 );
});

export default function GovernanceSim({ explorerData }) {
 const [budget, setBudget] = useState(100000000);
 const [simRes, setSimRes] = useState(null);
 const [loading, setLoading] = useState(false);
 const [errorMsg, setErrorMsg] = useState(null);

 const runSim = async () => {
 if(!explorerData) return;
 setLoading(true);
 setErrorMsg(null);
 try {
 const fd = new FormData();
 fd.append('budget', budget);
 fd.append('region', explorerData.current);
 const res = await axios.post(`${API_BASE_URL}/api/v1/simulate/governance`, fd);
 setSimRes(res.data.simulation);
 } catch(err) { 
 setErrorMsg("시뮬레이션 서버 연결에 실패했습니다.");
 } finally { 
 setLoading(false); 
 }
 }

 if (!explorerData) return null;

 const chartData = [
 { label: "서비스업", value: Math.floor(Math.random() * 40 + 20), color: "#3b82f6" },
 { label: "제조/농업", value: Math.floor(Math.random() * 30 + 15), color: "#10b981" },
 { label: "도소매업", value: Math.floor(Math.random() * 25 + 10), color: "#f59e0b" },
 { label: "관광/기타", value: Math.floor(Math.random() * 20 + 5), color: "#8b5cf6" },
 ].sort((a,b) => b.value - a.value);

 const maxVal = Math.max(...chartData.map(d => d.value));

 return (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto w-full pb-8 px-2 ">
 <div className="flex flex-col gap-2">
 <Badge label={`${explorerData?.type || 'GOV'} LEVEL SIMULATION`} color="bg-rose-500/10 text-rose-400 border-rose-500/20" />
 <h2 className="text-2xl font-black text-white">Policy Simulator</h2>
 <p className="text-slate-400 text-[10px] mt-1">AI 기반 예산 투입 효과 시뮬레이션 시스템</p>
 </div>

 <div className="grid grid-cols-1 gap-6">
 <div className=" bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg space-y-6 h-fit relative overflow-hidden">
 <div className="absolute -right-10 -top-10 opacity-5"><PieChart size={150} /></div>
 
 <div className="space-y-2 relative z-10">
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
 <MapPin size={12}/> Target Node
 </label>
 <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-sm font-bold text-blue-400">{explorerData.current}</div>
 </div>

 <div className="space-y-2 relative z-10">
 <div className="flex justify-between items-center">
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest break-keep">투입 예산 (Budget)</label>
 <span className="text-xs font-bold text-emerald-400">₩{parseInt(budget).toLocaleString()}</span>
 </div>
 <input type="range" min="10000000" max="1000000000" step="10000000" value={budget} onChange={(e)=>setBudget(e.target.value)} className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-blue-600" />
 </div>
 
 {errorMsg && (
 <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-bold flex items-center gap-2">
 <X size={14} className="shrink-0"/> {errorMsg}
 </div>
 )}

 <button onClick={runSim} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-[0_5px_15px_rgba(37,99,235,0.3)] hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all uppercase tracking-widest relative z-10">
 {loading ? <><RefreshCw className="animate-spin" size={16}/> 시뮬레이션 중...</> : "Run Simulation"}
 </button>
 </div>
 
 <div className="">
 {simRes ? (
 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-[#101725] p-4 rounded-2xl border border-slate-800 shadow-md">
 <p className="text-[9px] -[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5 break-keep"><TrendingUp size={12}/> 예상 ROI 배수</p>
 <p className="text-2xl font-black text-emerald-400">{simRes.roi_multiplier}</p>
 </div>
 <div className="bg-[#101725] p-4 rounded-2xl border border-slate-800 shadow-md">
 <p className="text-[9px] -[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5 break-keep"><Users size={12}/> 일자리 창출</p>
 <p className="text-2xl font-black text-blue-400">{simRes.job_creation}</p>
 </div>
 </div>
 
 <div className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg">
 <h4 className="text-xs font-bold text-slate-300 mb-6 flex items-center gap-2 tracking-widest uppercase"><BarChart3 size={16} className="text-blue-400"/> 산업별 파급 효과 (Impact Index)</h4>
 <div className="space-y-4">
 {chartData.map((d, i) => (
 <div key={i} className="space-y-1.5">
 <div className="flex justify-between text-[10px] font-bold">
 <span className="text-slate-400">{d.label}</span>
 <span style={{color: d.color}}>{d.value} pts</span>
 </div>
 <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
 <motion.div 
 initial={{ width: 0 }} 
 animate={{ width: `${(d.value / maxVal) * 100}%` }} 
 transition={{ duration: 1, delay: i * 0.1, type: 'spring' }}
 className="h-full rounded-full"
 style={{ backgroundColor: d.color }}
 />
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="bg-blue-900/10 p-4 rounded-2xl border border-blue-500/20 shadow-inner">
 <h4 className="text-[10px] font-bold text-blue-400 mb-2 flex items-center gap-1.5 uppercase tracking-widest"><BrainCircuit size={14}/> AI Policy Recommendation</h4>
 <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{simRes.ai_recommendation}</p>
 <div className="mt-4 pt-4 border-t border-blue-500/20 grid grid-cols-2 gap-3 text-[10px]">
 <div>
 <span className="text-blue-400 font-bold block mb-0.5">Boost Sector</span> 
 <span className="text-slate-300">{simRes.sector_boost}</span>
 </div>
 <div>
 <span className="text-rose-400 font-bold block mb-0.5 flex items-center gap-1"><X size={10}/> Warning</span> 
 <span className="text-slate-300 break-keep">{simRes.vulnerability_warning}</span>
 </div>
 </div>
 </div>
 </motion.div>
 ) : (
 <div className="h-full min-h-[300px] border-2 border-dashed border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-slate-500 gap-3 p-4 text-center">
 <Layers size={40} className="opacity-20" />
 <p className="text-sm font-bold uppercase tracking-widest">No Simulation Data</p>
 <p className="text-[10px] break-keep">타겟과 예산을 설정하고 Run을 클릭하세요.</p>
 </div>
 )}
 </div>
 </div>
 </motion.div>
 );
}