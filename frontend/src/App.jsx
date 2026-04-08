import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Radar, Map, Activity, Zap, ArrowLeft, Upload, Database, ShieldCheck, Plus, X, Layers, Lock, TrendingUp, BarChart3, PieChart, RefreshCw, Cpu
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
        current: currentPath.length > 0 ? currentPath[currentPath.length - 1] : "대구광역시",
        type: "City",
        metadata: { trust_index: 98.4, pulse_rate: 78, total_value: 5200000, nodes: 0 },
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
    <div className="flex h-[100dvh] w-full bg-[#0B0F19] text-slate-200 overflow-hidden font-sans antialiased flex-col md:flex-row selection:bg-blue-500/30">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 lg:w-80 bg-[#0F1523] border-r border-slate-800/60 flex-col z-50 shrink-0 shadow-2xl">
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-12 cursor-pointer group" onClick={()=>{setCurrentPath([]); setActiveTab('explorer');}}>
            <div className="p-3.5 bg-blue-600 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] group-hover:scale-105 transition-transform"><Radar size={28} className="text-white"/></div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white block leading-none mb-1">MDGA<br/>TWIN</span>
              <span className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase opacity-90">Spatial Intelligence</span>
            </div>
          </div>
          <nav className="space-y-3 flex-1">
            <SidebarLink icon={<Map size={20}/>} label="디지털 트윈 맵" active={activeTab === 'explorer'} onClick={()=>{setActiveTab('explorer'); setShowIngest(false);}} />
            <SidebarLink icon={<BarChart3 size={20}/>} label="정책 시뮬레이터" active={activeTab === 'governance'} onClick={()=>{setActiveTab('governance'); setShowIngest(false);}} />
            <SidebarLink icon={<Zap size={20}/>} label="하이퍼 피딩" active={showIngest} onClick={()=>setShowIngest(true)} />
          </nav>
          
          <div className="mt-auto bg-[#131B2C] rounded-2xl p-5 border border-slate-800/50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">System Health</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-300">Connectivity</span>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0B0F19]">
        {/* Top Header */}
        <header className="h-14 shrink-0 border-b border-slate-800/40 bg-[#0B0F19]/80 backdrop-blur-xl px-4 md:px-8 flex items-center sticky top-0 z-40">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest overflow-x-auto no-scrollbar whitespace-nowrap">
            <button onClick={()=>{setCurrentPath([]); setActiveTab('explorer');}} className="hover:text-blue-400 transition-colors">ROOT</button>
            {currentPath.map((segment, i) => (
              <React.Fragment key={i}>
                <span className="shrink-0 opacity-40">/</span>
                <button onClick={()=>setCurrentPath(currentPath.slice(0, i+1))} className="hover:text-blue-400 transition-colors text-slate-300">{segment}</button>
              </React.Fragment>
            ))}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 pb-24 md:pb-12 scroll-smooth">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full items-center justify-center">
                <RefreshCw size={32} className="text-blue-600 animate-spin" />
              </motion.div>
            ) : activeTab === 'governance' && explorerData ? (
              <motion.div key="gov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto w-full">
                <div className="space-y-3">
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-xs font-bold uppercase tracking-wider border border-emerald-500/20 inline-block">Policy Projection</div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">Budget Simulation</h2>
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                    선택된 노드 <span className="text-blue-400 font-semibold">[{explorerData.current}]</span>에 대한 가상 예산 투입 결과를 확인하세요.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  <div className="bg-[#131B2C] p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl space-y-8">
                    <div className="space-y-4">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Total Budget (KRW)</label>
                      <input type="range" min="10000000" max="1000000000" step="10000000" value={budget} onChange={(e)=>setBudget(e.target.value)} className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600" />
                      <div className="text-3xl md:text-4xl font-black text-white tracking-tight">₩{(parseInt(budget)).toLocaleString()}</div>
                    </div>
                    <button onClick={handleSimulate} disabled={simLoading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:bg-blue-500 active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                      {simLoading ? <RefreshCw className="animate-spin" size={20}/> : "Execute Simulation"}
                    </button>
                  </div>

                  <div className="flex flex-col">
                    <AnimatePresence mode="wait">
                      {simRes ? (
                        <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 h-full flex flex-col">
                          <div className="grid grid-cols-2 gap-4">
                            <GovStat label="ROI Multiplier" value={simRes.roi_multiplier} icon={<TrendingUp size={18} className="text-emerald-400"/>} />
                            <GovStat label="Job Creation" value={simRes.job_creation} icon={<Plus size={18} className="text-blue-400"/>} />
                          </div>
                          <div className="bg-[#131B2C] p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl space-y-6 relative overflow-hidden flex-1">
                            <div className="absolute -top-4 -right-4 opacity-5"><PieChart size={120}/></div>
                            <h4 className="text-sm font-bold uppercase text-white tracking-wider">AI Policy Directive</h4>
                            <div className="text-sm leading-relaxed border-l-2 border-blue-500 pl-4 text-slate-300 whitespace-pre-wrap">
                              {simRes.ai_recommendation}
                            </div>
                            <div className="pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-4">
                              <div><p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Benefit Sector</p><p className="text-sm font-semibold text-blue-400 break-keep">{simRes.sector_boost}</p></div>
                              <div><p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Vulnerability</p><p className="text-sm font-semibold text-rose-400 break-keep">{simRes.vulnerability_warning}</p></div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="empty" className="h-full min-h-[200px] flex flex-col items-center justify-center text-center space-y-4 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800 p-8">
                          <PieChart size={48} className="text-slate-700 animate-pulse" />
                          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Ready for Simulation</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : explorerData ? (
              <motion.div key="explorer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-6xl mx-auto w-full">
                
                {/* Identity Header */}
                <div className="flex flex-col xl:flex-row justify-between items-start gap-8">
                  <div className="space-y-6 flex-1 w-full">
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      <Badge label={`${explorerData.type} NODE`} color="bg-blue-600/10 text-blue-400 border-blue-500/20 hover:bg-blue-600/20" />
                      <Badge label={`PULSE: ${explorerData.metadata.pulse_rate}BPM`} color="bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20" />
                      <Badge label="VALIDATED ASSET" icon={<Lock size={12}/>} color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" />
                    </div>
                    <div className="flex items-center gap-4">
                      {currentPath.length > 0 && (
                        <button onClick={goBack} className="p-3 bg-slate-800/50 hover:bg-slate-700/80 rounded-2xl border border-slate-700 transition-colors text-slate-300 shrink-0"><ArrowLeft size={24} /></button>
                      )}
                      <h2 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white uppercase break-keep leading-tight md:leading-none">
                        {explorerData.current}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                      <BigStat label="Accumulated Value" value={`₩${(explorerData.metadata.total_value || 0).toLocaleString()}`} />
                      <BigStat label="Node Density" value={explorerData.metadata.nodes} />
                      <BigStat label="Integrity Score" value={`${explorerData.metadata.trust_index || 0}%`} />
                    </div>
                  </div>
                </div>

                {/* Hierarchy Grid */}
                {explorerData.children && explorerData.children.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Layers size={16} className="text-blue-500"/> Spatial Map
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                      {explorerData.children.map(child => (
                        <motion.div key={child.name} whileHover={{ y: -4 }} onClick={() => navigateTo(child.name)} className="bg-[#131B2C] p-5 rounded-[1.5rem] border border-slate-800/60 hover:border-blue-500/40 hover:bg-[#1A243A] transition-all cursor-pointer group relative overflow-hidden shadow-lg">
                          <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-[0.08] transition-opacity"><Database size={100}/></div>
                          <div className="space-y-5 relative z-10">
                            <div className="flex justify-between items-start">
                              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><Folder size={22} /></div>
                              <div className="text-right w-20">
                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{child.pulse} bpm</span>
                                <div className="w-full h-1.5 bg-slate-800/80 rounded-full mt-1.5 overflow-hidden">
                                  <div className="h-full bg-rose-500 rounded-full" style={{width: `${child.pulse}%`}} />
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-xl font-black tracking-tight text-slate-200 group-hover:text-white transition-colors truncate">{child.name}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{child.type}</p>
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
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center">Intelligence Stream</h3>
                    <div className="space-y-6">
                      {explorerData.entries.map((entry, idx) => (
                        <div key={idx} className="bg-[#131B2C] p-6 md:p-8 rounded-[2rem] border border-slate-800/60 relative overflow-hidden group shadow-xl">
                          <div className="absolute top-0 right-0 p-8 opacity-[0.03]"><BrainCircuit size={160} /></div>
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{entry.timestamp}</span>
                          </div>
                          <div className="text-sm md:text-base leading-relaxed text-slate-300 mb-6 whitespace-pre-wrap border-l-2 border-blue-600 pl-4">
                            {entry.insights}
                          </div>
                          {entry.drive_link && entry.drive_link !== "Not Connected" && entry.drive_link !== "Storage Error" && (
                            <a href={entry.drive_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors mb-5 bg-blue-500/10 px-3 py-1.5 rounded-lg">
                              <ShieldCheck size={14} /> View Attached Asset
                            </a>
                          )}
                          <div className="pt-5 border-t border-slate-800/50 font-mono text-[10px] text-slate-600 break-all uppercase flex items-center gap-2">
                            <Lock size={12} className="text-slate-600" /> Hash: {entry.hash}
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
      <nav className="md:hidden flex items-center justify-around bg-[#0F1523]/95 backdrop-blur-xl border-t border-slate-800/60 h-16 shrink-0 pb-safe z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] relative">
        <BottomNavLink icon={<Map size={22}/>} label="트윈 맵" active={activeTab === 'explorer' && !showIngest} onClick={()=>{setActiveTab('explorer'); setShowIngest(false);}} />
        <BottomNavLink icon={<BarChart3 size={22}/>} label="시뮬레이터" active={activeTab === 'governance' && !showIngest} onClick={()=>{setActiveTab('governance'); setShowIngest(false);}} />
        <BottomNavLink icon={<Zap size={22}/>} label="피딩" active={showIngest} onClick={()=>setShowIngest(true)} special />
      </nav>

      {/* Ingest Modal */}
      <AnimatePresence>
        {showIngest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0B0F19]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#131B2C] w-full max-w-2xl max-h-[90dvh] flex flex-col rounded-[2.5rem] border border-slate-700/50 shadow-2xl overflow-hidden relative">
              <div className="p-5 sm:p-6 border-b border-slate-800/60 flex justify-between items-center bg-[#0F1523]/80">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-900/50"><Upload size={22}/></div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black uppercase text-white tracking-tight">Hyper Ingest</h3>
                    <p className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-0.5">Asset Integration</p>
                  </div>
                </div>
                <button onClick={()=>setShowIngest(false)} className="text-slate-500 hover:text-white p-2 transition-colors bg-slate-800/50 rounded-full"><X size={20}/></button>
              </div>
              <div className="p-5 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                {!ingestRes ? (
                  <>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed text-center break-keep">
                      비정형 로컬 데이터를 분석하여 <strong className="text-slate-300">계층 구조에 매핑</strong>하고 <strong className="text-slate-300">자산화</strong>를 수행합니다.
                    </p>
                    <textarea value={rawText} onChange={(e)=>setRawText(e.target.value)} className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 text-sm sm:text-base focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-slate-200 placeholder:text-slate-600 resize-none shadow-inner" rows={5} placeholder="텍스트 데이터를 입력하세요..." />
                    <div className="relative">
                      <input type="file" onChange={(e)=>setFile(e.target.files[0])} className="w-full text-xs sm:text-sm text-slate-400 file:mr-3 sm:file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] sm:file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 transition-all cursor-pointer bg-[#0B0F19] p-2.5 sm:p-3 rounded-2xl border border-slate-800" />
                    </div>
                    <button onClick={handleIngest} disabled={ingestLoading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm sm:text-base shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:bg-blue-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 tracking-wide uppercase">
                      {ingestLoading ? <RefreshCw className="animate-spin" size={20}/> : "Execute Sync"}
                    </button>
                  </>
                ) : (
                  <div className="py-16 space-y-8 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)] border-2 border-emerald-500/20 relative">
                      <div className="absolute inset-0 rounded-full border border-emerald-500/40 animate-ping" />
                      <ShieldCheck size={40} className="sm:w-12 sm:h-12" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">Synced</h4>
                      <p className="text-blue-400 text-xs sm:text-sm font-semibold tracking-wide bg-blue-500/10 px-4 py-2 rounded-full inline-block">{ingestRes.path.join(' ❯ ')}</p>
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
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
      {icon} <span className="tracking-wide">{label}</span>
    </button>
  );
}

function BottomNavLink({ icon, label, active, onClick, special }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1.5 w-full h-full transition-colors relative ${active ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
      {special && (
        <div className={`absolute -top-3 w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-900/50 border-[4px] border-[#0F1523] ${active ? 'scale-110' : ''} transition-transform`}>
          {icon}
        </div>
      )}
      {!special && icon}
      <span className={`text-[10px] font-bold tracking-wide ${special ? 'mt-6 text-slate-400' : ''}`}>{label}</span>
    </button>
  );
}

function GovStat({ label, value, icon }) {
  return (
    <div className="bg-[#0B0F19]/50 p-4 sm:p-5 rounded-2xl border border-slate-800/50 space-y-2.5">
      <div className="flex items-center gap-2 text-slate-400">
        {icon} <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xl sm:text-2xl font-black text-white tracking-tight">{value}</p>
    </div>
  );
}

function BigStat({ label, value }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">{label}</p>
      <p className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">{value}</p>
    </div>
  );
}

function Badge({ label, icon, color }) {
  return (
    <div className={`px-2.5 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5 transition-colors cursor-default ${color}`}>
      {icon} {label}
    </div>
  );
}

export default App;