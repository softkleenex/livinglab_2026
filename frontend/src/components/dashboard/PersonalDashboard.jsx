import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Database, Layers, FileText, Users, Upload, Download, Trash2, ShieldCheck, Activity } from 'lucide-react';
import PulseChart from './PulseChart.jsx';
import IoTSensors from './IoTSensors.jsx';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const Badge = React.memo(({ label, icon, color }) => {
 return (
 <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-default ${color}`}>
 {icon} {label}
 </div>
 );
});

export default function PersonalDashboard({ personalData, userContext, handleExportCSV, setShowReport, handleDeleteEntry, handleDemoInject }) {
 if (!personalData) return null;

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
 {isB2B 
 ? `[${userContext.industry}] 전용 비즈니스 통합 관리 대시보드` 
 : '내 매장 현황 및 데이터 자산화 보상 분석'}
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-6">
 <div className=" space-y-6">
 {/* Main Metric Cards */}
 {isB2B ? (
 <div className="grid grid-cols-1 gap-4">
 <div className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-colors">
 <div className="absolute top-0 right-0 bg-blue-600/20 text-blue-400 text-[9px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-blue-500/20 uppercase">
 Trust: {personalData.store.trust_index ? personalData.store.trust_index.toFixed(1) : 50.0}%
 </div>
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp size={12}/> 일간 주요 실적 (매출/생산)</p>
 <motion.p key={personalData.store.total_value} initial={{ scale: 1.1, color: '#34d399' }} animate={{ scale: 1, color: '#34d399' }} className="text-2xl font-bold text-emerald-400">
 ₩{(personalData.store.total_value * 2.5).toLocaleString()}
 </motion.p>
 <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1"><Activity size={10}/> 상권/산업 평균: ₩{personalData.parent.avg_value.toLocaleString()}</p>
 <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
 <PulseChart data={personalData.store.history.map(v => v * 1.2)} color="#10b981" title="" subtitle="" />
 </div>
 </div>
 
 <div className="bg-[#101725] p-5 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative group">
 <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-emerald-500/20 uppercase">
 AI Predicted
 </div>
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Database size={12}/> 익월 AI 추천/예측 지표</p>
 <motion.p key={personalData.store.pulse} initial={{ scale: 1.5, color: '#10b981' }} animate={{ scale: 1, color: '#10b981' }} className="text-2xl font-bold text-white mb-2">
 +{(personalData.store.pulse * 1.5).toFixed(0)}% 성장
 </motion.p>
 <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1"><ShieldCheck size={10}/> 업계 트렌드 및 기상청 분석 완료</p>
 </div>
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-4">
 <div className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
 <div className="absolute top-0 right-0 bg-blue-600/20 text-blue-400 text-[9px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-blue-500/20 uppercase">
 Trust: {personalData.store.trust_index ? personalData.store.trust_index.toFixed(1) : 50.0}%
 </div>
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">My Asset Value</p>
 <motion.p key={personalData.store.total_value} initial={{ scale: 1.1, color: '#34d399' }} animate={{ scale: 1, color: '#34d399' }} className="text-3xl font-bold text-emerald-400">
 ₩{personalData.store.total_value.toLocaleString()}
 </motion.p>
 <p className="text-[10px] text-slate-500 mt-2">상권 평균: ₩{personalData.parent.avg_value.toLocaleString()}</p>
 </div>
 <div className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Store Pulse</p>
 <motion.p key={personalData.store.pulse} initial={{ scale: 1.5, color: '#60a5fa' }} animate={{ scale: 1, color: '#3b82f6' }} className="text-3xl font-bold text-blue-400 mb-2">
 {personalData.store.pulse} BPM
 </motion.p>
 <p className="text-[10px] text-slate-500">상권 평균: {personalData.parent.pulse} BPM</p>
 <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-50">
 <PulseChart data={personalData.store.history} color="#3b82f6" title="" subtitle="" />
 </div>
 </div>
 </div>
 )}

 {/* Radar Chart: Me vs District */}
 <div className="bg-[#101725] p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col gap-6 items-center">
 <div className="w-full /2 h-48">
 <ResponsiveContainer width="100%" height="100%">
 <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
 <PolarGrid stroke="#1e293b" />
 <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9 }} />
 <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
 <Tooltip contentStyle={{ backgroundColor: '#0E1420', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }} />
 <Radar name="내 매장 (Store)" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
 <Radar name="상권 평균 (Avg)" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
 </RadarChart>
 </ResponsiveContainer>
 </div>
 <div className="w-full /2 space-y-3">
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
 <Layers size={14} className="text-blue-500" /> 데이터 통합 연동 (Data Hub)
 </h3>
 <Badge label="BETA" color="bg-orange-500/10 text-orange-400 border-orange-500/20" />
 </div>
 <div className="grid grid-cols-1 gap-3">
 <button onClick={handleDemoInject} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-xl transition-all cursor-pointer group">
 <FileText size={24} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
 <span className="text-xs font-bold text-slate-300">현장/수기 일지 연동</span>
 <span className="text-[9px] text-slate-500">사진/텍스트 찰영 및 추출</span>
 </button>
 <button onClick={handleDemoInject} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-xl transition-all cursor-pointer group">
 <Users size={24} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
 <span className="text-xs font-bold text-slate-300">주문/플랫폼 연동</span>
 <span className="text-[9px] text-slate-500">일별 주문/예약 자동 동기화</span>
 </button>
 <button onClick={handleDemoInject} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-xl transition-all cursor-pointer group">
 <Upload size={24} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
 <span className="text-xs font-bold text-slate-300">외부 API 연동</span>
 <span className="text-[9px] text-slate-500">물류/택배 배송 상태 수집</span>
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
 <p className="text-[10px] text-slate-500 leading-relaxed break-keep">가게 사진이나 영수증을 업로드하고 AI 컨설팅을 받아보세요.</p>
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
 <p className="text-xs text-slate-300 leading-relaxed font-medium mb-3">{entry.insights}</p>
 
 <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
 <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-1">
 <img src="/favicon.svg" className="w-3 h-3 opacity-80 grayscale contrast-200 brightness-200 sepia hue-rotate-15" alt=""/>
 +{entry.effective_value?.toLocaleString() || 0}
 </span>
 <button onClick={() => handleDeleteEntry(entry.hash)} className="text-slate-600 hover:text-red-400 transition-colors p-1" title="데이터 삭제 (신뢰도 하락 경고)">
 <Trash2 size={14} />
 </button>
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </div>
 </motion.div>
 );
}