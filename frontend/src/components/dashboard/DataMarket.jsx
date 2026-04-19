import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, ShieldCheck, Download, Users, RefreshCw, BarChart3, Database, Filter } from 'lucide-react';

const Badge = React.memo(({ label, icon, color }) => {
 return (
 <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-default ${color}`}>
 {icon} {label}
 </div>
 );
});

export default function DataMarket({ addToast, userContext, setWalletBalance }) {
 const [buying, setBuying] = useState(false);

 const isFarm = userContext?.industry?.includes('스마트팜') || userContext?.industry?.includes('농업');
 const isManuf = userContext?.industry?.includes('제조') || userContext?.industry?.includes('물류');
 const locGu = userContext?.location?.[0] || '전체 지역';

 const mockDataSets = [
 {
 id: 1,
 title: isFarm ? `${locGu} 온실 생육-날씨 상관관계 분석` : isManuf ? `${locGu} 산업단지 야간 물류 트래픽` : `${locGu} 상권 24년 1분기 소비 트렌드`,
 provider: isFarm ? "지니스팜 및 3개 농가" : isManuf ? "스마트물류(주) 컨소시엄" : "지역 상인 연합회",
 trust: 94.5,
 price: 15000,
 rows: "12,450",
 tags: isFarm ? ["스마트팜", "생육", "기상"] : isManuf ? ["물류", "트래픽", "야간"] : ["매출", "시간대별", "유동인구"],
 popular: true
 },
 {
 id: 2,
 title: isFarm ? "특용작물 병해충 발생 빈도와 습도" : isManuf ? "정밀가공 불량률 패턴 분석" : "MZ세대 야간 카페 방문 비율 데이터",
 provider: isFarm ? "스마트팜 혁신밸리" : isManuf ? "테크노폴리스 연합" : "대형 베이커리 네트워크",
 trust: 98.2,
 price: 25000,
 rows: "45,200",
 tags: isFarm ? ["병해충", "습도", "예측"] : isManuf ? ["제조", "불량률", "공정"] : ["카페", "배달", "수요예측"],
 popular: true
 },
 {
 id: 3,
 title: isFarm ? "로컬 유통망 농산물 시세 변동 기록" : isManuf ? "폐배터리 재활용 공정 효율 데이터" : "주말 관광객 오프라인 결제 리텐션",
 provider: isFarm ? "농산물 도매센터" : isManuf ? "에코 재생에너지" : "수성못 상인회",
 trust: 89.1,
 price: 8500,
 rows: "8,900",
 tags: isFarm ? ["시세", "유통", "예측"] : isManuf ? ["재활용", "효율", "에너지"] : ["관광", "리텐션", "소비"],
 popular: false
 }
 ];

 const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com';

 const handleBuy = async (item) => {
 setBuying(true);
 try {
 const res = await axios.post(`${API_BASE_URL}/api/dashboard/market/buy`, {
 industry: item.tags[0] || '분석',
 price: item.price
 });
 
 addToast(res.data.message, "success");
 if (setWalletBalance) setWalletBalance(res.data.new_balance);
 
 // Now fetch the real anonymized CSV export
 const pathStr = userContext.location ? userContext.location.join('/') : '전체 (Root)';
 const exportRes = await axios.get(`${API_BASE_URL}/api/dashboard/export?path=${pathStr}&industry=${encodeURIComponent(item.tags[0] || '공공')}`, { responseType: 'blob' });
 
 const url = window.URL.createObjectURL(new Blob([exportRes.data]));
 const link = document.createElement('a');
 link.href = url;
 link.setAttribute('download', `MDGA_Premium_${item.title.replace(/\s+/g, '_')}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 
 } catch(err) {
 if (err.response?.status === 400) {
 addToast(err.response.data.detail, "error");
 } else {
 addToast("결제 중 오류가 발생했습니다. 토큰 잔액을 확인하세요.", "error");
 }
 } finally {
 setBuying(false);
 }
 };

 return (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto w-full pb-10">
 <div className="flex flex-col gap-2 px-4 ">
 <div className="flex items-center gap-3">
 <Badge label="DATA MARKET" color="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" />
 <Badge label="BETA" color="bg-orange-500/10 text-orange-400 border-orange-500/20" />
 </div>
 <h2 className="text-3xl font-black text-white tracking-tight">Trust Data Exchange</h2>
 <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
 MDGA 생태계에서 검증된(Trust Index 기반) 고품질 로컬 데이터를 구매하고 연구/사업에 활용하세요. 데이터 제공자에게는 $MDGA 토큰으로 정당한 보상이 지급됩니다.
 </p>
 </div>

 <div className="grid grid-cols-1 gap-6 px-4 ">
 <div className=" space-y-4">
 <div className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg">
 <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-4"><Filter size={14}/> Filters</h3>
 <div className="space-y-3">
 <div>
 <p className="text-[10px] text-slate-500 font-bold mb-2">INDUSTRY</p>
 <div className="flex flex-wrap gap-2">
 {isFarm ? ['생육데이터', '기상/온습도', '병해충', '유통/시세'].map(tag => (
 <button key={tag} className="text-[10px] px-3 py-1.5 bg-slate-800/50 hover:bg-indigo-600/20 hover:text-indigo-400 text-slate-400 border border-slate-700 rounded-lg transition-colors">{tag}</button>
 )) : isManuf ? ['설비/센서', '물류/교통', '에너지', '품질관리'].map(tag => (
 <button key={tag} className="text-[10px] px-3 py-1.5 bg-slate-800/50 hover:bg-indigo-600/20 hover:text-indigo-400 text-slate-400 border border-slate-700 rounded-lg transition-colors">{tag}</button>
 )) : ['매출/결제', '유동인구', '부동산', '날씨'].map(tag => (
 <button key={tag} className="text-[10px] px-3 py-1.5 bg-slate-800/50 hover:bg-indigo-600/20 hover:text-indigo-400 text-slate-400 border border-slate-700 rounded-lg transition-colors">{tag}</button>
 ))}
 </div>
 </div>
 <div className="pt-3 border-t border-slate-800">
 <p className="text-[10px] text-slate-500 font-bold mb-2">MIN TRUST INDEX</p>
 <input type="range" min="50" max="99" defaultValue="85" className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-indigo-500" />
 <div className="flex justify-between text-[9px] text-slate-500 mt-1"><span>50%</span><span>85%</span><span>99%</span></div>
 </div>
 </div>
 </div>
 
 <div className="bg-indigo-900/10 p-5 rounded-2xl border border-indigo-500/20 shadow-inner">
 <h4 className="text-[10px] font-bold text-indigo-400 mb-2 flex items-center gap-1.5 uppercase tracking-widest"><ShieldCheck size={14}/> Trusted Protocol</h4>
 <p className="text-xs text-slate-300 leading-relaxed">모든 데이터셋은 MDGA의 교차 검증 알고리즘을 통과했으며 개인정보가 완벽히 비식별화(De-identified) 되었습니다.</p>
 </div>
 </div>

 <div className=" space-y-4">
 <div className="flex justify-between items-center mb-2">
 <p className="text-xs font-bold text-slate-400">Showing {mockDataSets.length} Premium Datasets</p>
 <select className="bg-[#101725] border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-1.5 outline-none">
 <option>Highest Trust First</option>
 <option>Newest First</option>
 <option>Price: Low to High</option>
 </select>
 </div>

 <div className="grid grid-cols-1 gap-4">
 {mockDataSets.map((dataset) => (
 <motion.div key={dataset.id} whileHover={{ y: -2 }} className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-md hover:border-indigo-500/30 transition-all group relative overflow-hidden flex flex-col gap-4 justify-between items-start ">
 {dataset.popular && (
 <div className="absolute top-0 right-0 bg-rose-500/20 text-rose-400 text-[8px] font-black px-3 py-1 rounded-bl-xl border-l border-b border-rose-500/20 uppercase tracking-widest">
 Hot Deal 🔥
 </div>
 )}
 
 <div className="space-y-3 flex-1">
 <div className="flex items-center gap-2">
 <h3 className="text-lg font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{dataset.title}</h3>
 </div>
 <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
 <span className="flex items-center gap-1"><Users size={12}/> {dataset.provider}</span>
 <span className="flex items-center gap-1"><Database size={12}/> {dataset.rows} rows</span>
 <span className="flex items-center gap-1 text-emerald-400 font-bold"><ShieldCheck size={12}/> Trust: {dataset.trust}%</span>
 </div>
 <div className="flex gap-2">
 {dataset.tags.map(tag => (
 <span key={tag} className="text-[9px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded uppercase tracking-wider">{tag}</span>
 ))}
 </div>
 </div>

 <div className="flex flex-row items-center justify-between w-full gap-4 shrink-0 border-t border-slate-800 pt-4 mt-2 ">
 <div className="flex flex-col ">
 <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Price</span>
 <span className="text-xl font-black text-yellow-400 flex items-center gap-1"><img src="/favicon.svg" className="w-4 h-4 opacity-70 grayscale contrast-200 brightness-200 sepia hue-rotate-15" alt=""/> {dataset.price.toLocaleString()} <span className="text-[10px] text-yellow-500/50">$MDGA</span></span>
 </div>
 <button onClick={() => handleBuy(dataset)} disabled={buying} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-900/20 flex items-center gap-2 transition-all disabled:opacity-50">
 {buying ? <RefreshCw size={14} className="animate-spin"/> : <ShoppingCart size={14}/>} Buy Data
 </button>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 </div>
 </motion.div>
 );
}