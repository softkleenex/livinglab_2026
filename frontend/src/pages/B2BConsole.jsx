import React, { useState } from 'react';
import { Search, Map as MapIcon, ChevronRight, X, DownloadCloud, Leaf, CloudSun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function B2BConsole() {
  const [selectedRegion, setSelectedRegion] = useState(null);

  return (
    <div className="flex h-screen w-full bg-[#0A0A0A] text-slate-100 overflow-hidden font-sans">
      {/* Left Sidebar (Filters) */}
      <aside className="w-64 bg-[#111111] border-r border-slate-800/50 p-6 flex flex-col gap-8 shrink-0 z-20 shadow-2xl relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
            <MapIcon size={18} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tight">MDGA Console</span>
        </div>

        <div className="flex flex-col gap-6 flex-1">
          {/* Filter Group: Crop */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Leaf size={14} /> 대상 작물
            </label>
            <div className="space-y-2">
              {['스마트팜 토마토', '노지 배추', '고랭지 사과'].map((crop) => (
                <label key={crop} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-800">
                  <input type="radio" name="crop" defaultChecked={crop === '스마트팜 토마토'} className="accent-blue-600 w-4 h-4 bg-slate-800 border-slate-700" />
                  <span className="text-sm font-medium text-slate-300">{crop}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter Group: Climate */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <CloudSun size={14} /> 기후 시나리오
            </label>
            <select className="w-full bg-[#1A1A1A] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:ring-2 focus:ring-blue-600/50 transition-shadow appearance-none">
              <option>RCP 8.5 (현재 추세)</option>
              <option>RCP 4.5 (저감 달성)</option>
              <option>과거 10년 평균</option>
            </select>
          </div>
        </div>

        {/* Bottom CTA / Profile placeholder */}
        <div className="mt-auto pt-6 border-t border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">Enterprise User</span>
              <span className="text-[10px] text-slate-500">AgriTech Corp.</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area (Map Placeholder) */}
      <main className="flex-1 relative bg-[#1A1A1A] flex items-center justify-center">
        {/* Decorative Grid Background for Map Placeholder */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="text-center space-y-4 z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-800/30 rounded-full flex items-center justify-center mb-2 border border-slate-800">
            <MapIcon size={32} className="text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-400 tracking-tight">Twin Map Rendered Here</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Interactive map visualizing agricultural zones, climate data, and yield predictions.
          </p>
          <button 
            onClick={() => setSelectedRegion('충청남도 평창군')}
            className="mt-6 px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-full border border-slate-700 transition-colors shadow-lg"
          >
            Simulate Region Click
          </button>
        </div>

        {/* Right Slide Panel (Sheet) */}
        <AnimatePresence>
          {selectedRegion && (
            <motion.div 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-[400px] bg-[#111111]/95 backdrop-blur-2xl border-l border-slate-800/80 shadow-2xl flex flex-col z-30"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
                <h3 className="text-lg font-bold text-white tracking-tight">{selectedRegion}</h3>
                <button onClick={() => setSelectedRegion(null)} className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-slate-800/50">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">예상 수확량</span>
                    <span className="text-2xl font-black text-white">12.4<span className="text-sm text-slate-500 font-medium ml-1">t/ha</span></span>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-slate-800/50">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">위험도 지수</span>
                    <span className="text-2xl font-black text-orange-500">High</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300">지역 상세 분석</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    선택된 지역은 최근 기후 변화로 인해 평균 기온이 2도 상승했으며, 이에 따른 특정 병해충 발생 확률이 40% 증가할 것으로 예측됩니다.
                  </p>
                  {/* Dummy Chart Bar */}
                  <div className="h-32 w-full bg-[#1A1A1A] rounded-2xl border border-slate-800/50 flex items-end p-4 gap-2">
                    {[40, 70, 45, 90, 65, 80].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-600/50 rounded-t-sm hover:bg-blue-500 transition-colors cursor-pointer" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="p-6 bg-[#111111] border-t border-slate-800/50">
                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                  <DownloadCloud size={18} />
                  [이 지역 합성데이터 API 구독하기]
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
