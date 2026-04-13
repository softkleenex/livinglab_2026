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

export default function DataMarket({ addToast }) {
  const [buying, setBuying] = useState(false);

  const mockDataSets = [
    {
      id: 1,
      title: "대구 북구 요식업 24년 1분기 트렌드",
      provider: "경대북문 상권 리더 연합",
      trust: 94.5,
      price: 15000,
      rows: "12,450",
      tags: ["요식업", "매출", "시간대별"],
      popular: true
    },
    {
      id: 2,
      title: "산격동 스마트팜 생육-날씨 상관관계",
      provider: "지니스팜 및 3개 농가",
      trust: 98.2,
      price: 25000,
      rows: "45,200",
      tags: ["스마트팜", "생육", "기상"],
      popular: true
    },
    {
      id: 3,
      title: "수성구 카페/베이커리 배달 수요 변화",
      provider: "수성못 카페 연합회",
      trust: 89.1,
      price: 8500,
      rows: "8,900",
      tags: ["카페", "배달", "수요예측"],
      popular: false
    }
  ];

  const handleBuy = (item) => {
    setBuying(true);
    setTimeout(() => {
      setBuying(false);
      addToast(`결제가 완료되었습니다. ${item.title} 다운로드가 시작됩니다.`, "success");
      
      let csvContent = "Date,Region,Value,Category\n";
      for(let i=0; i<50; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        csvContent += `${d.toISOString().split('T')[0]},대구광역시,${Math.floor(Math.random() * 100000)},${item.tags[0] || '분석'}\n`;
      }
      
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MDGA_Dataset_${item.title.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto w-full pb-10">
      <div className="flex flex-col gap-2 px-4 sm:px-0">
        <div className="flex items-center gap-3">
          <Badge label="DATA MARKET" color="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" />
          <Badge label="BETA" color="bg-orange-500/10 text-orange-400 border-orange-500/20" />
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Trust Data Exchange</h2>
        <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
          MDGA 생태계에서 검증된(Trust Index 기반) 고품질 로컬 데이터를 구매하고 연구/사업에 활용하세요. 데이터 제공자에게는 $MDGA 토큰으로 정당한 보상이 지급됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 sm:px-0">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-4"><Filter size={14}/> Filters</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-slate-500 font-bold mb-2">INDUSTRY</p>
                <div className="flex flex-wrap gap-2">
                  {['요식업', '스마트팜', '도소매', '서비스'].map(tag => (
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

        <div className="md:col-span-3 space-y-4">
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
              <motion.div key={dataset.id} whileHover={{ y: -2 }} className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-md hover:border-indigo-500/30 transition-all group relative overflow-hidden flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
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

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 sm:gap-2 shrink-0 border-t sm:border-t-0 border-slate-800 pt-4 sm:pt-0 mt-2 sm:mt-0">
                  <div className="flex flex-col sm:items-end">
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