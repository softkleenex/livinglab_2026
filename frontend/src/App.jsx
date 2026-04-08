import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BrainCircuit, Folder, ChevronRight, Zap, ArrowLeft, Search, Upload, Globe, Database, ShieldCheck, Plus, X, Activity, Layers, Lock, Cpu, Radar, TrendingUp, Landmark, BarChart3, Coins, PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [currentPath, setCurrentPath] = useState([]);
  const [explorerData, setExplorerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('explorer'); // 'explorer' or 'governance'
  
  // Ingest/Sim States
  const [showIngest, setShowIngest] = useState(false);
  const [rawText, setRawText] = useState('');
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestRes, setIngestRes] = useState(null);

  // Governance States
  const [budget, setBudget] = useState(100000000);
  const [simRes, setSimRes] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => { fetchExplorer(); }, [currentPath]);

  const fetchExplorer = async () => {
    setLoading(true);
    try {
      const pathStr = currentPath.join('/');
      const res = await axios.get(`${API_BASE_URL}/api/hierarchy/explore?path=${pathStr}`);
      setExplorerData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleIngest = async () => {
    setIngestLoading(true);
    const formData = new FormData();
    if (rawText) formData.append('raw_text', rawText);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ingest`, formData);
      setIngestRes(res.data.entry);
      setTimeout(() => { setShowIngest(false); fetchExplorer(); setIngestRes(null); }, 2500);
    } catch (err) { alert("Ingest Error"); }
    finally { setIngestLoading(false); }
  };

  const handleSimulate = async () => {
    setSimLoading(true);
    const formData = new FormData();
    formData.append('budget', budget);
    formData.append('region', explorerData.current);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/simulate/governance`, formData);
      setSimRes(res.data.simulation);
    } catch (err) { alert("Sim Error"); }
    finally { setSimLoading(false); }
  };

  const navigateTo = (name) => setCurrentPath([...currentPath, name]);
  const goBack = () => setCurrentPath(currentPath.slice(0, -1));

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30 antialiased">
      
      {/* Sidebar (Command Center Style) */}
      <aside className="w-20 md:w-80 bg-[#0F172A] border-r border-white/5 flex flex-col z-50 shadow-2xl relative">
        <div className="p-8 md:p-12 relative z-10">
          <div className="flex items-center gap-5 mb-20 group cursor-pointer" onClick={()=>{setCurrentPath([]); setActiveTab('explorer');}}>
            <div className="p-5 bg-blue-600 rounded-[1.5rem] shadow-[0_0_60px_rgba(37,99,235,0.6)] active:scale-90 transition-all border border-blue-400/20"><Landmark size={36} className="text-white"/></div>
            <div className="hidden md:block">
              <span className="text-3xl font-black tracking-tighter uppercase text-white block">MDGA GOV</span>
              <span className="text-[10px] text-blue-400 font-black tracking-[0.4em] uppercase opacity-70">Region OS v15.0</span>
            </div>
          </div>
          <nav className="space-y-10">
            <SidebarLink icon={<Database size={26}/>} label="데이터 익스플로러" active={activeTab === 'explorer'} onClick={()=>{setActiveTab('explorer'); setShowIngest(false);}} />
            <SidebarLink icon={<BarChart3 size={26}/>} label="거버넌스 시뮬레이터" active={activeTab === 'governance'} onClick={()=>setActiveTab('governance')} />
            <SidebarLink icon={<Zap size={26}/>} label="데이터 피딩" active={showIngest} onClick={()=>setShowIngest(true)} />
          </nav>
        </div>
        
        <div className="mt-auto p-10 hidden md:block">
          <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 space-y-4 shadow-inner">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Policy Efficiency</p>
            <p className="text-5xl font-black text-white tracking-tighter">{explorerData?.metadata.budget_efficiency || 94.2}%</p>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 overflow-y-auto relative bg-[#020617] transition-all">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />
        
        <header className="h-28 border-b border-white/5 bg-slate-900/40 backdrop-blur-3xl px-12 flex items-center sticky top-0 z-40">
          <div className="flex items-center gap-5 text-[11px] font-black text-slate-500 overflow-x-auto no-scrollbar uppercase tracking-[0.4em]">
            <button onClick={()=>{setCurrentPath([]); setActiveTab('explorer');}} className="hover:text-blue-400 transition-all">DEAGU_CENTER</button>
            {currentPath.map((segment, i) => (
              <React.Fragment key={i}>
                <ChevronRight size={14} className="shrink-0 opacity-20" />
                <button onClick={()=>setCurrentPath(currentPath.slice(0, i+1))} className="hover:text-blue-400 transition-all text-slate-300">{segment}</button>
              </React.Fragment>
            ))}
          </div>
        </header>

        <div className="p-12 md:p-24 max-w-7xl mx-auto w-full min-h-full">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[60vh] items-center justify-center">
                <div className="w-24 h-24 border-[8px] border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
              </motion.div>
            ) : activeTab === 'governance' ? (
              <motion.div key="gov" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-20">
                <div className="space-y-6">
                  <div className="px-6 py-2 bg-emerald-600/10 text-emerald-400 rounded-2xl text-xs font-black uppercase tracking-widest border border-emerald-500/20 inline-block">Policy Projection Mode</div>
                  <h2 className="text-7xl md:text-9xl font-black tracking-tighter text-white leading-none">Budget Simulation</h2>
                  <p className="text-slate-400 text-2xl font-medium max-w-3xl leading-relaxed">
                    선택된 지역 <span className="text-blue-400">[{explorerData.current}]</span>에 대한 정책 예산 투입 효과를 미리 확인하세요.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  <div className="lg:col-span-5 bg-slate-800/40 p-16 rounded-[5rem] border border-white/10 shadow-2xl space-y-12">
                    <div className="space-y-6">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Total Budget (KRW)</label>
                      <input type="range" min="10000000" max="1000000000" step="10000000" value={budget} onChange={(e)=>setBudget(e.target.value)} className="w-full h-3 bg-slate-900 rounded-full appearance-none cursor-pointer accent-blue-600" />
                      <div className="text-5xl font-black text-white tracking-tighter">₩{(parseInt(budget)).toLocaleString()}</div>
                    </div>
                    <button onClick={handleSimulate} disabled={simLoading} className="w-full py-10 bg-blue-600 text-white rounded-[3rem] font-black text-3xl shadow-[0_30px_100px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest">
                      {simLoading ? "Calculating Impact..." : "Execute Simulation"}
                    </button>
                  </div>

                  <div className="lg:col-span-7">
                    <AnimatePresence>
                      {simRes ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                          <div className="grid grid-cols-2 gap-8">
                            <GovStat label="ROI Multiplier" value={simRes.roi_multiplier} icon={<TrendingUp className="text-emerald-400"/>} />
                            <GovStat label="Job Creation" value={simRes.job_creation} icon={<Plus className="text-blue-400"/>} />
                          </div>
                          <div className="bg-white p-16 rounded-[5rem] shadow-2xl text-slate-900 space-y-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-5"><PieChart size={200}/></div>
                            <h4 className="text-3xl font-black uppercase tracking-tight">AI Policy Directive</h4>
                            <div className="text-xl font-bold leading-relaxed border-l-8 border-blue-600 pl-10 opacity-90 whitespace-pre-wrap">
                              {simRes.ai_recommendation}
                            </div>
                            <div className="pt-10 border-t border-slate-100 grid grid-cols-2 gap-10">
                              <div><p className="text-[10px] font-black text-slate-400 uppercase mb-2">Benefit Sector</p><p className="text-lg font-black text-blue-600">{simRes.sector_boost}</p></div>
                              <div><p className="text-[10px] font-black text-slate-400 uppercase mb-2">Vulnerability</p><p className="text-lg font-black text-rose-600">{simRes.vulnerability_warning}</p></div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-10 bg-white/5 rounded-[5rem] border-2 border-dashed border-white/5 p-20">
                          <PieChart size={120} className="text-slate-800 animate-pulse" />
                          <p className="text-2xl font-black text-slate-500 uppercase tracking-widest">Ready for Simulation</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="explorer" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-24 pb-40">
                
                {/* Identity Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                  <div className="space-y-6 flex-1">
                    <div className="flex flex-wrap gap-4">
                      <Badge label={`${explorerData.type} COMPONENT`} color="bg-blue-600/10 text-blue-400 border-blue-500/20" />
                      <Badge label={`PULSE: ${explorerData.metadata.pulse_rate}BPM`} color="bg-rose-600/10 text-rose-400 border-rose-500/20" />
                      <Badge label="VERIFIED BY MDGA" icon={<ShieldCheck size={12}/>} color="bg-emerald-600/10 text-emerald-400 border-emerald-500/20" />
                    </div>
                    <h2 className="text-8xl md:text-9xl font-black tracking-tighter text-white leading-none uppercase">{explorerData.current}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 pt-8">
                      <BigStat label="ACCUMULATED WEALTH" value={`₩${(explorerData.metadata.total_value || 0).toLocaleString()}`} />
                      <BigStat label="NETWORK DENSITY" value={explorerData.metadata.nodes} />
                      <BigStat label="TRUST QUOTIENT" value={`${explorerData.metadata.trust_index || 98.5}%`} />
                    </div>
                  </div>
                  {currentPath.length > 0 && (
                    <button onClick={goBack} className="p-8 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all text-slate-400 hover:text-white shadow-2xl active:scale-90"><ArrowLeft size={48} /></button>
                  )}
                </div>

                {/* 계층 탐색 Grid */}
                {explorerData.children.length > 0 && (
                  <div className="space-y-12">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.6em] ml-2 font-mono flex items-center gap-4">
                      <Layers size={16} className="text-blue-500"/> Spatial Hierarchy Map
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                      {explorerData.children.map(child => (
                        <motion.div key={child.name} whileHover={{ y: -15, scale: 1.03 }} onClick={() => navigateTo(child.name)} className="bg-slate-800/30 p-14 rounded-[4.5rem] border border-white/5 hover:border-blue-500/40 hover:bg-blue-600/5 transition-all cursor-pointer group shadow-[0_50px_100px_rgba(0,0,0,0.4)] backdrop-blur-3xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all"><Database size={150}/></div>
                          <div className="space-y-10 relative z-10">
                            <div className="flex justify-between items-start">
                              <div className="p-6 bg-blue-600/10 text-blue-400 rounded-3xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><Folder size={40} /></div>
                              <div className="text-right">
                                <span className="text-xs font-black text-rose-500 uppercase tracking-widest">{child.pulse} bpm</span>
                                <div className="w-24 h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden shadow-inner">
                                  <div className="h-full bg-rose-500" style={{width: `${child.pulse}%`}} />
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-4xl font-black tracking-tighter group-hover:text-white transition-all leading-none">{child.name}</p>
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-4">{child.type} Object</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 전략 피드 */}
                {explorerData.entries.length > 0 && (
                  <div className="space-y-20">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.6em] ml-2 font-mono text-center">Intelligence Pulse Stream</h3>
                    <div className="space-y-32">
                      {explorerData.entries.map((entry, idx) => (
                        <div key={idx} className="bg-white p-20 md:p-28 rounded-[6rem] shadow-[0_80px_200px_rgba(0,0,0,0.6)] border border-white/10 text-slate-900 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-24 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><BrainCircuit size={400} /></div>
                          <div className="flex items-center justify-between mb-20">
                            <div className="flex items-center gap-6">
                              <div className="w-4 h-4 rounded-full bg-blue-600 animate-ping shadow-[0_0_20px_rgba(37,99,235,0.8)]" />
                              <span className="text-sm font-black text-slate-400 uppercase tracking-[0.5em]">{entry.timestamp}</span>
                            </div>
                            {entry.signal && (
                              <div className="px-6 py-2 bg-rose-50 text-rose-600 rounded-full text-xs font-black uppercase border border-rose-100 shadow-sm animate-bounce">
                                Active Signal
                              </div>
                            )}
                          </div>
                          <h4 className="text-5xl font-black mb-16 tracking-tighter leading-tight italic decoration-blue-500/20 underline underline-offset-12">Deep Strategic Scan</h4>
                          <div className="text-3xl font-bold leading-[1.8] opacity-90 mb-20 whitespace-pre-wrap border-l-[16px] border-blue-600 pl-16">
                            {entry.insights}
                          </div>
                          {entry.signal && (
                            <div className="p-10 bg-rose-600 text-white rounded-[3rem] shadow-2xl mb-16 flex items-center gap-8">
                              <Zap size={48} className="animate-pulse" />
                              <div>
                                <p className="text-xs font-black uppercase tracking-[0.4em] opacity-70">Agent Alert</p>
                                <p className="text-3xl font-black tracking-tight">{entry.signal}</p>
                              </div>
                            </div>
                          )}
                          <div className="pt-16 border-t border-slate-100 font-mono text-[11px] text-slate-400 break-all uppercase tracking-tighter flex items-center gap-6">
                            <Lock size={20} className="text-blue-400" /> Genesis_Hash: {entry.hash}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Massive Ingest Modal */}
      <AnimatePresence>
        {showIngest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/98 backdrop-blur-[60px] z-[100] flex items-center justify-center p-8">
            <motion.div initial={{ scale: 0.8, y: 200 }} animate={{ scale: 1, y: 0 }} className="bg-[#1E293B] w-full max-w-5xl rounded-[8rem] border border-white/10 shadow-[0_100px_300px_rgba(0,0,0,0.9)] overflow-hidden relative">
              <div className="p-20 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-10">
                  <div className="p-10 bg-blue-600 rounded-[3.5rem] text-white shadow-[0_0_100px_rgba(37,99,235,0.7)] animate-pulse"><Upload size={64} strokeWidth={4}/></div>
                  <div>
                    <h3 className="text-7xl font-black uppercase tracking-tighter text-white leading-none">Hyper Ingest</h3>
                    <p className="text-blue-400 font-bold text-lg uppercase tracking-[0.6em] mt-6">Autonomous Spatial Integration</p>
                  </div>
                </div>
                <button onClick={()=>setShowIngest(false)} className="text-slate-500 hover:text-white p-8 transition-all active:rotate-180"><X size={100}/></button>
              </div>
              <div className="p-24 space-y-20 text-center">
                {!ingestRes ? (
                  <>
                    <p className="text-slate-400 text-4xl font-medium leading-relaxed max-w-4xl mx-auto italic">"비정형 비즈니스 로그를 분석하여 계층 구조 투사 및 무결성 블록체인 자산화를 즉시 수행합니다."</p>
                    <textarea value={rawText} onChange={(e)=>setRawText(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-[6rem] p-20 text-4xl font-medium focus:ring-[24px] focus:ring-blue-500/10 outline-none transition-all text-slate-300 shadow-inner placeholder:text-slate-800" rows={4} placeholder="Input Contextual Data Stream..." />
                    <button onClick={handleIngest} disabled={ingestLoading} className="w-full py-14 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[6rem] font-black text-5xl shadow-[0_60px_200px_rgba(37,99,235,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all border border-blue-400/30 uppercase tracking-widest">Execute Sync</button>
                  </>
                ) : (
                  <div className="py-32 space-y-24 animate-in zoom-in-95 duration-1000 text-white">
                    <div className="relative inline-flex">
                      <div className="w-80 h-84 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_300px_rgba(16,185,129,0.7)] border-[12px] border-emerald-500/30"><BrainCircuit size={180} strokeWidth={3} className="animate-pulse" /></div>
                      <div className="absolute -top-8 -right-8 bg-emerald-500 p-10 rounded-full shadow-2xl border-[8px] border-[#1E293B]"><ShieldCheck size={64} className="text-white"/></div>
                    </div>
                    <div className="space-y-10">
                      <h4 className="text-9xl font-black tracking-tighter uppercase leading-none">Spatial Synced</h4>
                      <p className="text-slate-400 text-4xl font-medium italic underline underline-offset-[30px] decoration-blue-500">Path: {ingestRes.path.join(' ❯ ')}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-10 p-10 rounded-[4rem] transition-all duration-700 ${active ? 'bg-blue-600 text-white shadow-[0_40px_120px_rgba(37,99,235,0.7)] translate-x-14 scale-[1.2]' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
      {icon} <span className="hidden md:block font-black text-base uppercase tracking-[0.6em]">{label}</span>
    </button>
  );
}

function GovStat({ label, value, icon }) {
  return (
    <div className="bg-white/5 p-12 rounded-[4rem] border border-white/5 space-y-6">
      <div className="flex items-center gap-4 text-slate-500">
        {icon} <span className="text-[11px] font-black uppercase tracking-[0.5em]">{label}</span>
      </div>
      <p className="text-6xl font-black text-white tracking-tighter">{value}</p>
    </div>
  );
}

function BigStat({ label, value }) {
  return (
    <div className="space-y-4">
      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.6em] font-mono">{label}</p>
      <p className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none">{value}</p>
    </div>
  );
}

function Badge({ label, icon, color }) {
  return (
    <div className={`px-8 py-3 rounded-full text-[12px] font-black uppercase tracking-widest border flex items-center gap-4 shadow-xl ${color}`}>
      {icon} {label}
    </div>
  );
}

export default App;
