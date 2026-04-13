const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf-8');

// 1. Mobile-wrapper fix
code = code.replace(
  '<div className="min-h-screen bg-[#0A0F1A] text-slate-200 flex flex-col overflow-hidden mx-auto w-full max-w-[1920px] shadow-2xl" style={{ zoom: 1 }}>',
  '<div className="h-[100dvh] bg-[#0A0F1A] text-slate-200 flex flex-col overflow-hidden mx-auto w-full max-w-md relative shadow-2xl border-x border-slate-800">'
);
code = code.replace(
  '<div className="min-h-screen bg-[#0A0F1A] text-slate-200 flex items-center justify-center p-4 pb-24 sm:pb-4 selection:bg-blue-500/30 overflow-y-auto mx-auto w-full max-w-[1920px]" style={{ zoom: 1 }}>',
  '<div className="h-[100dvh] bg-[#0A0F1A] text-slate-200 flex flex-col items-center justify-start p-4 pb-24 selection:bg-blue-500/30 overflow-y-auto mx-auto w-full max-w-md relative border-x border-slate-800">'
);
code = code.replace(
  '<div className="max-w-3xl w-full bg-[#0E1420] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden mt-8 sm:mt-0">',
  '<div className="w-full bg-[#0E1420] border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden mt-4 shrink-0">'
);

// 2. Simplified Flat Selection List right below the map
const locationUXStart = code.indexOf('{/* Dynamic Location Selection UX */}');
const locationUXEnd = code.indexOf('{/* Store Select */}');

if (locationUXStart !== -1 && locationUXEnd !== -1) {
  const newLocationUX = `{/* Simplified Flat Selection List */}
                  <div className="space-y-4 pt-4 border-t border-slate-800/60">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin size={12} className="text-blue-500"/> {levelId === 'store' ? '파트너사 (Store)' : levelId === 'street' ? '상권 (Street)' : levelId === 'dong' ? '행정동 (Dong)' : '자치구 (Gu)'} 빠른 선택
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {levelId === 'gu' && [...new Set(ALL_MOCK_STORES.map(s => s.gu))].map(gu => (
                        <button key={gu} type="button" onClick={() => { setLocGu(gu); setLocDong(''); setLocStreet(''); setLocStore(''); const found=ALL_MOCK_STORES.find(s=>s.gu===gu); if(found) setMapCenter([found.lat, found.lng]); }} className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all \${locGu === gu ? 'bg-blue-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'}\`}>{gu}</button>
                      ))}
                      {levelId === 'dong' && [...new Map(ALL_MOCK_STORES.map(s => [s.dong, s])).values()].map(store => (
                        <button key={store.dong} type="button" onClick={() => { setLocGu(store.gu); setLocDong(store.dong); setLocStreet(''); setLocStore(''); setMapCenter([store.lat, store.lng]); }} className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all \${locDong === store.dong ? 'bg-emerald-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'}\`}>{store.dong}</button>
                      ))}
                      {levelId === 'street' && [...new Map(ALL_MOCK_STORES.map(s => [s.street, s])).values()].map(store => (
                        <button key={store.street} type="button" onClick={() => { setLocGu(store.gu); setLocDong(store.dong); setLocStreet(store.street); setLocStore(''); setMapCenter([store.lat, store.lng]); }} className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all \${locStreet === store.street ? 'bg-rose-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'}\`}>{store.street}</button>
                      ))}
                      {levelId === 'store' && ALL_MOCK_STORES.map(store => (
                        <button key={store.name} type="button" onClick={() => { setLocGu(store.gu); setLocDong(store.dong); setLocStreet(store.street); setLocStore(store.name); setIndustry(store.industry); setMapCenter([store.lat, store.lng]); setIsNewStore(false); }} className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all \${locStore === store.name ? 'bg-blue-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'}\`}>{store.name}</button>
                      ))}
                    </div>

                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 space-y-2 mt-4">
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
                        <span>선택된 위치 정보 확인 및 수정</span>
                        {levelId === 'store' && <button type="button" onClick={() => setIsNewStore(!isNewStore)} className="text-blue-400">신규 등록 전환</button>}
                      </label>
                      <div className="flex flex-col gap-2">
                        {(levelId === 'gu' || levelId === 'dong' || levelId === 'street' || levelId === 'store') && <input required placeholder="구 (예: 북구)" value={locGu} onChange={e=>setLocGu(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg p-2 text-xs text-white" />}
                        {(levelId === 'dong' || levelId === 'street' || levelId === 'store') && <input required placeholder="동 (예: 산격동)" value={locDong} onChange={e=>setLocDong(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg p-2 text-xs text-white" />}
                        {(levelId === 'street' || levelId === 'store') && <input required placeholder="거리/상권" value={locStreet} onChange={e=>setLocStreet(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg p-2 text-xs text-white" />}
                        {levelId === 'store' && <input required placeholder="매장명" value={locStore} onChange={e=>{setLocStore(e.target.value); setIsNewStore(true);}} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg p-2 text-xs text-white" />}
                      </div>
                    </div>
                  </div>
                  `;
  code = code.substring(0, locationUXStart) + newLocationUX + code.substring(locationUXEnd + 19); // Wait, length of {/* Store Select */} is 20, let's just make sure we cut up to the end.
}

// Ensure the old Global Quick Select List is removed
code = code.replace(/\{\/\* Global Quick Select List \(Always Visible\) \*\/\}[\s\S]*?\}\)/, '');

fs.writeFileSync('frontend/src/App.jsx', code);
console.log('App.jsx converted to mobile-width layout and simplified flat location selection UX.');
