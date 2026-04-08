import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BrainCircuit, Folder, ChevronRight, Zap, ArrowLeft, Upload, Database, ShieldCheck, Plus, X, Layers, Lock, TrendingUp, Landmark, BarChart3, PieChart, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [currentPath, setCurrentPath] = useState([]);
  const [explorerData, setExplorerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('explorer');
  
  const [showIngest, setShowIngest] = useState(false);
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState(null);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestRes, setIngestRes] = useState(null);

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
    } catch (err) { 
      console.error(err);
      setExplorerData({
        current: currentPath.length > 0 ? currentPath[currentPath.length - 1] : "API_ERROR",
        type: "Error",
        metadata: { trust_index: 0, pulse_rate: 0, total_value: 0, nodes: 0 },
        children: [],
        entries: []
      });
    }
    finally { setLoading(false); }
  };

  const handleIngest = async () => {
    setIngestLoading(true);
    const formData = new FormData();
    if (rawText) formData.append('raw_text', rawText);
    if (file) formData.append('file', file);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ingest`, formData);
      setIngestRes({ entry: res.data.entry, path: res.data.assigned_path });
      setTimeout(() => { 
        setShowIngest(false); 
        fetchExplorer(); 
        setIngestRes(null); 
        setRawText('');
        setFile(null);
      }, 2500);
    } catch (err) { alert("Ingest Error. Check connection."); }
    finally { setIngestLoading(false); }
  };

  const handleSimulate = async () => {
    if (!explorerData) return;
    setSimLoading(true);
    const formData = new FormData();
    formData.append('budget', budget);
    formData.append('region', explorerData.current);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/simulate/governance`, formData);
      setSimRes(res.data.simulation);
    } catch (err) { alert("Simulation Error. Check connection."); }
    finally { setSimLoading(false); }
  };

  const navigateTo = (name) => setCurrentPath([...currentPath, name]);
  const goBack = () => setCurrentPath(currentPath.slice(0, -1));

  return (
    <div className="flex h-[100dvh] w-full bg-slate-950 text-slate-200 overflow-hidden font-sans antialiased flex-col md:flex-row selection:bg-blue-500/30">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-slate-900 border-r border-slate-800 flex-col z-50 shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={()=>{setCurrentPath([]); setActiveTab('explorer');}}>
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/50"><Landmark size={24} className="text-white"/></div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">MDGA GOV</span>
              <span className="text-xs text-blue-400 font-semibold tracking-wider uppercase opacity-80">Region OS v15.0</span>
            </div>
          </div>
          <nav className="space-y-2">
            <SidebarLink icon={<Database size={20}/>} label="데이터 익스플로러" active={activeTab === 'explorer'} onClick={()=>{setActiveTab('explorer'); setShowIngest(false);}} />
            <SidebarLink icon={<BarChart3 size={20}/>} label="거버넌스 시뮬레이터" active={activeTab === 'governance'} onClick={()=>{setActiveTab('governance'); setShowIngest(false);}} />
            <SidebarLink icon={<Zap size={20}/>} label="데이터 피딩" active={showIngest} onClick={()=>setShowIngest(true)} />
          </nav>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
        {/* Header */}
        <header className="h-14 shrink-0 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 flex items-center sticky top-0 z-40">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button onClick={()=>{setCurrentPath([]); setActiveTab('explorer');}} className="hover:text-blue-400 transition-colors">DAEGU</button>
            {currentPath.map((segment, i) => (
              <React.Fragment key={i}>
                <ChevronRight size={14} className="shrink-0 opacity-40" />
                <button onClick={()=>setCurrentPath(currentPath.slice(0, i+1))} className="hover:text-blue-400 transition-colors text-slate-200">{segment}</button>
              </React.Fragment>
            ))}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full items-center justify-center">
                <RefreshCw size={32} className="text-blue-600 animate-spin" />
              </motion.div>
            ) : activeTab === 'governance' && explorerData ? (
              <motion.div key="gov" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-5xl mx-auto">
                <div className="space-y-3">
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-xs font-bold uppercase tracking-wider border border-emerald-500/20 inline-block">Policy Projection Mode</div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">Budget Simulation</h2>
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                    선택된 지역 <span className="text-blue-400 font-semibold">[{explorerData.current}]</span>에 대한 정책 예산 투입 효과를 확인하세요.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-8">
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Total Budget (KRW)</label>
                      <input type="range" min="10000000" max="1000000000" step="10000000" value={budget} onChange={(e)=>setBudget(e.target.value)} className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600" />
                      <div className="text-3xl md:text-4xl font-black text-white tracking-tight">₩{(parseInt(budget)).toLocaleString()}</div>
                    </div>
                    <button onClick={handleSimulate} disabled={simLoading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/20 hover:bg-blue-500 active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                      {simLoading ? <RefreshCw className="animate-spin" size={20}/> : "Execute Simulation"}
                    </button>
                  </div>

                  <div className="flex flex-col">
                    <AnimatePresence mode="wait">
                      {simRes ? (
                        <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <GovStat label="ROI Multiplier" value={simRes.roi_multiplier} icon={<TrendingUp size={18} className="text-emerald-400"/>} />
                            <GovStat label="Job Creation" value={simRes.job_creation} icon={<Plus size={18} className="text-blue-400"/>} />
                          </div>
                          <div className="bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6 relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 opacity-5"><PieChart size={120}/></div>
                            <h4 className="text-lg font-bold uppercase text-white">AI Policy Directive</h4>
                            <div className="text-sm md:text-base leading-relaxed border-l-4 border-blue-500 pl-4 text-slate-300 whitespace-pre-wrap">
                              {simRes.ai_recommendation}
                            </div>
                            <div className="pt-4 border-t border-slate-700 grid grid-cols-2 gap-4">
                              <div><p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Benefit Sector</p><p className="text-sm font-semibold text-blue-400">{simRes.sector_boost}</p></div>
                              <div><p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Vulnerability</p><p className="text-sm font-semibold text-rose-400">{simRes.vulnerability_warning}</p></div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="empty" className="h-full min-h-[200px] flex flex-col items-center justify-center text-center space-y-4 bg-slate-900/50 rounded-3xl border border-dashed border-slate-700 p-8">
                          <PieChart size={48} className="text-slate-600 animate-pulse" />
                          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Ready for Simulation</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : explorerData ? (
              <motion.div key="explorer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-6xl mx-auto">
                
                {/* Identity Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <Badge label={`${explorerData.type} COMPONENT`} color="bg-blue-500/10 text-blue-400 border-blue-500/20" />
                      <Badge label={`PULSE: ${explorerData.metadata.pulse_rate}BPM`} color="bg-rose-500/10 text-rose-400 border-rose-500/20" />
                      <Badge label="VERIFIED" icon={<ShieldCheck size={12}/>} color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase">{explorerData.current}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 pt-4">
                      <BigStat label="WEALTH" value={`₩${(explorerData.metadata.total_value || 0).toLocaleString()}`} />
                      <BigStat label="NODES" value={explorerData.metadata.nodes} />
                      <BigStat label="TRUST" value={`${explorerData.metadata.trust_index || 0}%`} />
                    </div>
                  </div>
                  {currentPath.length > 0 && (
                    <button onClick={goBack} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 transition-colors text-slate-400 hover:text-white shrink-0"><ArrowLeft size={24} /></button>
                  )}
                </div>

                {/* Hierarchy Grid */}
                {explorerData.children && explorerData.children.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Layers size={16} className="text-blue-500"/> Spatial Map
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {explorerData.children.map(child => (
                        <motion.div key={child.name} whileHover={{ y: -4 }} onClick={() => navigateTo(child.name)} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-pointer group relative overflow-hidden">
                          <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity"><Database size={80}/></div>
                          <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-start">
                              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><Folder size={24} /></div>
                              <div className="text-right w-20">
                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">{child.pulse} bpm</span>
                                <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                  <div className="h-full bg-rose-500" style={{width: `${child.pulse}%`}} />
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-xl font-bold text-slate-200 group-hover:text-white transition-colors">{child.name}</p>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{child.type}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feed */}
                {explorerData.entries && explorerData.entries.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Intelligence Stream</h3>
                    <div className="space-y-8">
                      {explorerData.entries.map((entry, idx) => (
                        <div key={idx} className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-8 opacity-5"><BrainCircuit size={120} /></div>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{entry.timestamp}</span>
                          </div>
                          <div className="text-sm md:text-base leading-relaxed text-slate-300 mb-6 whitespace-pre-wrap border-l-4 border-blue-600 pl-4">
                            {entry.insights}
                          </div>
                          {entry.drive_link && entry.drive_link !== "Not Connected" && entry.drive_link !== "Storage Error" && (
                            <a href={entry.drive_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors mb-4">
                              <ShieldCheck size={14} /> View Attached Source File
                            </a>
                          )}
                          <div className="pt-4 border-t border-slate-800 font-mono text-[10px] text-slate-600 break-all uppercase flex items-center gap-2">
                            <Lock size={12} className="text-slate-500" /> {entry.hash}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden flex items-center justify-around bg-slate-900 border-t border-slate-800 h-16 shrink-0 pb-safe z-50">
        <BottomNavLink icon={<Database size={20}/>} label="탐색" active={activeTab === 'explorer' && !showIngest} onClick={()=>{setActiveTab('explorer'); setShowIngest(false);}} />
        <BottomNavLink icon={<BarChart3 size={20}/>} label="시뮬레이터" active={activeTab === 'governance' && !showIngest} onClick={()=>{setActiveTab('governance'); setShowIngest(false);}} />
        <BottomNavLink icon={<Zap size={20}/>} label="피딩" active={showIngest} onClick={()=>setShowIngest(true)} />
      </nav>

      {/* Ingest Modal */}
      <AnimatePresence>
        {showIngest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-slate-900 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-700 shadow-2xl overflow-hidden relative">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-xl text-white"><Upload size={24}/></div>
                  <div>
                    <h3 className="text-xl font-black uppercase text-white">Hyper Ingest</h3>
                    <p className="text-blue-400 font-bold text-[10px] uppercase tracking-wider mt-1">Data Integration</p>
                  </div>
                </div>
                <button onClick={()=>setShowIngest(false)} className="text-slate-400 hover:text-white p-2 transition-colors"><X size={24}/></button>
              </div>
              <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                {!ingestRes ? (
                  <>
                    <p className="text-slate-400 text-sm leading-relaxed italic text-center">비정형 비즈니스 로그를 분석하여 계층 구조 투사 및 무결성 블록체인 자산화를 즉시 수행합니다.</p>
                    <textarea value={rawText} onChange={(e)=>setRawText(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-sm md:text-base focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-slate-200 placeholder:text-slate-600 resize-none" rows={5} placeholder="텍스트 데이터를 입력하세요..." />
                    <div className="relative">
                      <input type="file" onChange={(e)=>setFile(e.target.files[0])} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 transition-all cursor-pointer bg-slate-950 p-3 rounded-2xl border border-slate-700" />
                    </div>
                    <button onClick={handleIngest} disabled={ingestLoading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-blue-900/20 hover:bg-blue-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                      {ingestLoading ? <RefreshCw className="animate-spin" size={20}/> : "Execute Sync"}
                    </button>
                  </>
                ) : (
                  <div className="py-12 space-y-8 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)] border-4 border-emerald-500/30">
                      <ShieldCheck size={48} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black uppercase mb-2 text-white">Synced</h4>
                      <p className="text-blue-400 text-sm font-semibold">{ingestRes.path.join(' ❯ ')}</p>
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
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-semibold text-sm ${active ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
      {icon} <span>{label}</span>
    </button>
  );
}

function BottomNavLink({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${active ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

function GovStat({ label, value, icon }) {
  return (
    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 space-y-2">
      <div className="flex items-center gap-2 text-slate-400">
        {icon} <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl md:text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function BigStat({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl md:text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function Badge({ label, icon, color }) {
  return (
    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${color}`}>
      {icon} {label}
    </div>
  );
}

export default App;