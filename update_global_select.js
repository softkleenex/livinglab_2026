const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf-8');

const regex = /\{\/\* Global Quick Select List \*\/\}[\s\S]*?\n\s+\)\}/;

const newGlobalList = `{/* Global Quick Select List (Always Visible) */}
        {levelId && (
          <div className="mt-8 pt-6 border-t border-slate-800 relative z-10">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <MapPin size={12} className="text-blue-500"/> 전체 지역/파트너사 빠른 이동 (Global Quick Select)
            </label>

            {levelId === 'gu' && (
              <div className="flex flex-wrap gap-2 pb-2">
                {[...new Set(ALL_MOCK_STORES.map(s => s.gu))].map(gu => (
                  <button key={gu} type="button"
                    onClick={() => { setLocGu(gu); setLocDong(''); setLocStreet(''); setLocStore(''); const found=ALL_MOCK_STORES.find(s=>s.gu===gu); if(found) setMapCenter([found.lat, found.lng]); }}
                    className={\`shrink-0 px-3 py-2 rounded-xl text-left border transition-all \${locGu === gu ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-[#101725] border-slate-800 hover:border-slate-600'}\`}
                  >
                    <p className="text-xs font-bold text-slate-200">{gu}</p>
                  </button>
                ))}
              </div>
            )}

            {levelId === 'dong' && (
              <div className="flex flex-wrap gap-2 pb-2">
                {[...new Map(ALL_MOCK_STORES.map(s => [s.dong, s])).values()].map(store => (
                  <button key={store.dong} type="button"
                    onClick={() => { setLocGu(store.gu); setLocDong(store.dong); setLocStreet(''); setLocStore(''); setMapCenter([store.lat, store.lng]); }}
                    className={\`shrink-0 px-3 py-2 rounded-xl text-left border transition-all \${locDong === store.dong ? 'bg-emerald-600/20 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-[#101725] border-slate-800 hover:border-slate-600'}\`}
                  >
                    <p className="text-xs font-bold text-slate-200">{store.dong}</p>
                    <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider">{store.gu}</p>
                  </button>
                ))}
              </div>
            )}

            {levelId === 'street' && (
              <div className="flex flex-wrap gap-2 pb-2">
                {[...new Map(ALL_MOCK_STORES.map(s => [s.street, s])).values()].map(store => (
                  <button key={store.street} type="button"
                    onClick={() => { setLocGu(store.gu); setLocDong(store.dong); setLocStreet(store.street); setLocStore(''); setMapCenter([store.lat, store.lng]); }}
                    className={\`shrink-0 px-3 py-2 rounded-xl text-left border transition-all \${locStreet === store.street ? 'bg-rose-600/20 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-[#101725] border-slate-800 hover:border-slate-600'}\`}
                  >
                    <p className="text-xs font-bold text-slate-200">{store.street}</p>
                    <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider">{store.gu} {store.dong}</p>
                  </button>
                ))}
              </div>
            )}

            {levelId === 'store' && (
              <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                {ALL_MOCK_STORES.map(store => (
                  <button key={store.name} type="button"
                    onClick={() => {
                      setLevelId('store'); setLocGu(store.gu); setLocDong(store.dong); setLocStreet(store.street);
                      setLocStore(store.name); setIndustry(store.industry); setMapCenter([store.lat, store.lng]); setIsNewStore(false);
                    }}
                    className={\`shrink-0 px-3 py-2 rounded-xl text-left border transition-all \${locStore === store.name ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-[#101725] border-slate-800 hover:border-slate-600'}\`}
                  >
                    <p className="text-xs font-bold text-slate-200">{store.name}</p>
                    <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider">{store.dong} | {store.industry}</p>
                  </button>
                ))}
              </div>
            )}
            
            {/* Always show Store Quick Select as a fallback if not in store mode, allowing instant jump */}
            {levelId !== 'store' && (
              <div className="mt-6">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Store size={10} className="text-slate-500"/> 특정 매장/농장으로 즉시 점프 (Jump to Store)
                </label>
                <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar opacity-70 hover:opacity-100 transition-opacity">
                  {ALL_MOCK_STORES.map(store => (
                    <button key={'jump-'+store.name} type="button"
                      onClick={() => {
                        setLevelId('store'); setLocGu(store.gu); setLocDong(store.dong); setLocStreet(store.street);
                        setLocStore(store.name); setIndustry(store.industry); setMapCenter([store.lat, store.lng]); setIsNewStore(false);
                      }}
                      className="shrink-0 px-2 py-1.5 rounded-lg text-left border bg-[#0E1420] border-slate-800 hover:border-slate-500 transition-all"
                    >
                      <p className="text-[10px] font-bold text-slate-300">{store.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}`;

code = code.replace(regex, newGlobalList);
fs.writeFileSync('frontend/src/App.jsx', code);
console.log('App.jsx Global Quick Select updated for ALL levels.');
