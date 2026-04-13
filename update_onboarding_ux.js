const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf-8');

// 1. Desktop Zoom Fix: Wrap App in a container
code = code.replace(
  '<div className="min-h-screen bg-[#0A0F1A] text-slate-200 flex flex-col overflow-hidden">',
  '<div className="min-h-screen bg-[#0A0F1A] text-slate-200 flex flex-col overflow-hidden mx-auto w-full max-w-[1920px] shadow-2xl" style={{ zoom: 1 }}>'
);
// Onboarding wrapper
code = code.replace(
  '<div className="min-h-screen bg-[#0A0F1A] text-slate-200 flex items-center justify-center p-4 pb-24 sm:pb-4 selection:bg-blue-500/30 overflow-y-auto">',
  '<div className="min-h-screen bg-[#0A0F1A] text-slate-200 flex items-center justify-center p-4 pb-24 sm:pb-4 selection:bg-blue-500/30 overflow-y-auto mx-auto w-full max-w-[1920px]" style={{ zoom: 1 }}>'
);

const inputsRegex = /\{\/\* Location Inputs \*\/\}[\s\S]*?(?=\{\/\* Store Select \*\/)/m;

const newInputs = `          {/* Dynamic Location Selection UX */}
          <div className="space-y-4 pt-4 border-t border-slate-800/60">
            {/* GU Level */}
            {(levelId === 'gu' || levelId === 'dong' || levelId === 'street' || levelId === 'store') && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={12} className="text-blue-500"/> 자치구 (Gu)
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {[...new Set(ALL_MOCK_STORES.map(s => s.gu))].map(gu => (
                    <button
                      key={gu} type="button"
                      onClick={() => { setLocGu(gu); setLocDong(''); setLocStreet(''); setLocStore(''); }}
                      className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all \${locGu === gu ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'}\`}
                    >{gu}</button>
                  ))}
                  <input placeholder="직접 입력..." value={locGu} onChange={e=>setLocGu(e.target.value)} className="bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 outline-none text-white w-24 ml-2" />
                </div>
              </div>
            )}

            {/* DONG Level */}
            {(levelId === 'dong' || levelId === 'street' || levelId === 'store') && locGu && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={12} className="text-emerald-500"/> 행정동 (Dong)
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {[...new Set(ALL_MOCK_STORES.filter(s => s.gu === locGu).map(s => s.dong))].map(dong => (
                    <button
                      key={dong} type="button"
                      onClick={() => { setLocDong(dong); setLocStreet(''); setLocStore(''); }}
                      className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all \${locDong === dong ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'}\`}
                    >{dong}</button>
                  ))}
                  <input placeholder="직접 입력..." value={locDong} onChange={e=>setLocDong(e.target.value)} className="bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-emerald-500 outline-none text-white w-24 ml-2" />
                </div>
              </div>
            )}

            {/* STREET Level */}
            {(levelId === 'street' || levelId === 'store') && locDong && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={12} className="text-rose-500"/> 거리/상권 (Street)
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {[...new Set(ALL_MOCK_STORES.filter(s => s.gu === locGu && s.dong === locDong).map(s => s.street))].map(street => (
                    <button
                      key={street} type="button"
                      onClick={() => { setLocStreet(street); setLocStore(''); }}
                      className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all \${locStreet === street ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'}\`}
                    >{street}</button>
                  ))}
                  <input placeholder="직접 입력..." value={locStreet} onChange={e=>setLocStreet(e.target.value)} className="bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-rose-500 outline-none text-white w-32 ml-2" />
                </div>
              </div>
            )}
          </div>
          `;

code = code.replace(inputsRegex, newInputs);

fs.writeFileSync('frontend/src/App.jsx', code);
console.log('App.jsx updated with dynamic Gu/Dong/Street chip selectors and zoom fix.');
