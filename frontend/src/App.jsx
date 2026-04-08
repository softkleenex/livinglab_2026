/* eslint-disable */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Radar, Map, Zap, ArrowLeft, Upload, Database, ShieldCheck, Plus, X, Layers, Lock, TrendingUp, BarChart3, PieChart, RefreshCw, Folder, BrainCircuit
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
    <div className="flex h-[100dvh] w-full bg-[#0A0F1A] text-slate-200 overflow-hidden font-sans antialiased flex-col md:flex-row selection:bg-blue-500/30">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-[#0E1420] border-r border-slate-800/80 flex-col z-50 shrink-0 shadow-lg">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10 cursor-pointer group" onClick={()=>{setCurrentPath([]); setActiveTab('explorer');}}>
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:scale-105 transition-transform"><Radar size={22} className="text-white"/></div>
            <div>
              <span className="text-xl font-bold text-white block leading-none mb-1">MDGA TWIN</span>
              <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase opacity-90">Spatial Intelligence</span>
            </div>
          </div>
          <nav className="space-y-2 flex-1">
            <SidebarLink icon={<Map size={18}/>} label="디지털 트윈 맵" active={activeTab === 'explorer'} onClick={()=>{setActiveTab('explorer'); setShowIngest(false);}} />
            <SidebarLink icon={<BarChart3 size={18}/>} label="정책 시뮬레이터" active={activeTab === 'governance'} onClick={()=>{setActiveTab('governance'); setShowIngest(false);}} />
            <SidebarLink icon={<Zap size={18}/>} label="하이퍼 피딩" active={showIngest} onClick={()=>setShowIngest(true)} />
          </nav>
          
          <div className="mt-auto bg-[#131A29] rounded-xl p-4 border border-slate-800/50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">System Health</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Connectivity</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0F1A]">
        {/* Top Header */}
        <header className="h-12 shrink-0 border-b border-slate-800/60 bg-[#0A0F1A]/80 backdrop-blur-xl px-4 md:px-6 flex items-center sticky top-0 z-40">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider overflow-x-auto no-scrollbar whitespace-nowrap">
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-12 scroll-smooth">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full items-center justify-center">
                <RefreshCw size={28} className="text-blue-600 animate-spin" />
              </motion.div>
            ) : activeTab === 'governance' && explorerData ? (
              <motion.div key="gov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto w-full">
                <div className="space-y-2">
                  <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 inline-block">Policy Projection</div>
                  <h2 className="text-2xl md:text-4xl font-bold text-white">Budget Simulation</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    선택된 노드 <span className="text-blue-400 font-semibold">[{explorerData.current}]</span>에 대한 가상 예산 투입 결과를 확인하세요.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-2 bg-[#101725] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6 h-fit">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Budget (KRW)</label>
                      <input type="range" min="10000000" max="1000000000" step="10000000" value={budget} onChange={(e)=>setBudget(e.target.value)} className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600" />
                      <div className="text-2xl font-bold text-white">₩{(parseInt(budget)).toLocaleString()}</div>
                    </div>
                    <button onClick={handleSimulate} disabled={simLoading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm shadow-[0_5px_15px_rgba(37,99,235,0.2)] hover:bg-blue-500 active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                      {simLoading ? <RefreshCw className="animate-spin" size={16}/> : "Execute Simulation"}
                    </button>
                  </div>

                  <div className="lg:col-span-3 flex flex-col">
                    <AnimatePresence mode="wait">
                      {simRes ? (
                        <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 h-full flex flex-col">
                          <div className="grid grid-cols-2 gap-4">
                            <GovStat label="ROI Multiplier" value={simRes.roi_multiplier} icon={<TrendingUp size={16} className="text-emerald-400"/>} />
                            <GovStat label="Job Creation" value={simRes.job_creation} icon={<Plus size={16} className="text-blue-400"/>} />
                          </div>
                          <div className="bg-[#101725] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 relative overflow-hidden flex-1">
                            <div className="absolute -top-6 -right-6 opacity-[0.03]"><PieChart size={120}/></div>
                            <h4 className="text-xs font-bold uppercase text-white tracking-wider">AI Policy Directive</h4>
                            <div className="text-sm leading-relaxed border-l-2 border-blue-500 pl-4 text-slate-300 whitespace-pre-wrap relative z-10">
                              {simRes.ai_recommendation}
                            </div>
                            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-4 relative z-10">
                              <div><p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Benefit Sector</p><p className="text-sm font-semibold text-blue-400 break-keep">{simRes.sector_boost}</p></div>
                              <div><p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Vulnerability</p><p className="text-sm font-semibold text-rose-400 break-keep">{simRes.vulnerability_warning}</p></div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="empty" className="h-full min-h-[160px] flex flex-col items-center justify-center text-center space-y-3 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 p-6">
                          <PieChart size={32} className="text-slate-700 animate-pulse" />
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Ready for Simulation</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : explorerData ? (
              <motion.div key="explorer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-5xl mx-auto w-full">
                
                {/* Identity Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="space-y-4 flex-1 w-full">
                    <div className="flex flex-wrap gap-2">
                      <Badge label={`${explorerData.type} NODE`} color="bg-blue-600/10 text-blue-400 border-blue-500/20" />
                      <Badge label={`PULSE: ${explorerData.metadata.pulse_rate}BPM`} color="bg-rose-500/10 text-rose-400 border-rose-500/20" />
                      <Badge label="VALIDATED ASSET" icon={<Lock size={10}/>} color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
                    </div>
                    <div className="flex items-center gap-3">
                      {currentPath.length > 0 && (
                        <button onClick={goBack} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors text-slate-300 shrink-0"><ArrowLeft size={20} /></button>
                      )}
                      <h2 className="text-3xl md:text-5xl font-bold text-white uppercase break-keep leading-tight">
                        {explorerData.current}
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                      <BigStat label="Accumulated Value" value={`₩${(explorerData.metadata.total_value || 0).toLocaleString()}`} />
                      <BigStat label="Node Density" value={explorerData.metadata.nodes} />
                      <BigStat label="Integrity Score" value={`${explorerData.metadata.trust_index || 0}%`} />
                    </div>
                  </div>
                </div>

                {/* Hierarchy Grid */}
                {explorerData.children && explorerData.children.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Layers size={14} className="text-blue-500"/> Spatial Map
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {explorerData.children.map(child => (
                        <motion.div key={child.name} whileHover={{ y: -2 }} onClick={() => navigateTo(child.name)} className="bg-[#101725] p-5 rounded-2xl border border-slate-800/80 hover:border-blue-500/40 hover:bg-[#141D2C] transition-all cursor-pointer group relative overflow-hidden shadow-sm">
                          <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"><Database size={80}/></div>
                          <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-start">
                              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><Folder size={18} /></div>
                              <div className="text-right w-16">
                                <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">{child.pulse} bpm</span>
                                <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                                  <div className="h-full bg-rose-500 rounded-full" style={{width: `${child.pulse}%`}} />
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors truncate">{child.name}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{child.type}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feed */}
                {explorerData.entries && explorerData.entries.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Intelligence Stream</h3>
                    <div className="space-y-4">
                      {explorerData.entries.map((entry, idx) => (
                        <div key={idx} className="bg-[#101725] p-5 md:p-6 rounded-2xl border border-slate-800/80 relative overflow-hidden group shadow-sm">
                          <div className="absolute top-0 right-0 p-6 opacity-[0.02]"><BrainCircuit size={100} /></div>
                          <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{entry.timestamp}</span>
                          </div>
                          <div className="text-sm leading-relaxed text-slate-300 mb-4 whitespace-pre-wrap border-l-2 border-blue-600 pl-3 relative z-10">
                            {entry.insights}
                          </div>
                          {entry.drive_link && entry.drive_link !== "Not Connected" && entry.drive_link !== "Storage Error" && (
                            <a href={entry.drive_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors mb-4 bg-blue-500/10 px-2.5 py-1 rounded-md relative z-10">
                              <ShieldCheck size={12} /> View Asset
                            </a>
                          )}
                          <div className="pt-4 border-t border-slate-800/50 font-mono text-[9px] text-slate-600 break-all uppercase flex items-center gap-1.5">
                            <Lock size={10} className="text-slate-600" /> Hash: {entry.hash}
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
      <nav className="md:hidden flex items-center justify-around bg-[#0E1420]/95 backdrop-blur-lg border-t border-slate-800/80 h-16 shrink-0 pb-safe z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] relative">
        <BottomNavLink icon={<Map size={20}/>} label="트윈 맵" active={activeTab === 'explorer' && !showIngest} onClick={()=>{setActiveTab('explorer'); setShowIngest(false);}} />
        <BottomNavLink icon={<BarChart3 size={20}/>} label="시뮬레이터" active={activeTab === 'governance' && !showIngest} onClick={()=>{setActiveTab('governance'); setShowIngest(false);}} />
        <BottomNavLink icon={<Zap size={20}/>} label="피딩" active={showIngest} onClick={()=>setShowIngest(true)} special />
      </nav>

      {/* Ingest Modal */}
      <AnimatePresence>
        {showIngest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0A0F1A]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#101725] w-full max-w-lg max-h-[85dvh] flex flex-col rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden relative">
              <div className="p-4 sm:p-5 border-b border-slate-800/80 flex justify-between items-center bg-[#0E1420]/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-900/40"><Upload size={18}/></div>
                  <div>
                    <h3 className="text-base font-bold uppercase text-white tracking-tight">Hyper Ingest</h3>
                    <p className="text-blue-400 font-semibold text-[9px] uppercase tracking-wider mt-0.5">Asset Integration</p>
                  </div>
                </div>
                <button onClick={()=>setShowIngest(false)} className="text-slate-500 hover:text-white p-1.5 transition-colors bg-slate-800/50 rounded-full"><X size={18}/></button>
              </div>
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                {!ingestRes ? (
                  <>
                    <p className="text-slate-400 text-xs leading-relaxed text-center break-keep">
                      비정형 로컬 데이터를 분석하여 <strong className="text-slate-300">계층 구조에 매핑</strong>하고 <strong className="text-slate-300">자산화</strong>를 수행합니다.
                    </p>
                    <textarea value={rawText} onChange={(e)=>setRawText(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-slate-200 placeholder:text-slate-600 resize-none shadow-inner" rows={4} placeholder="텍스트 데이터를 입력하세요..." />
                    <div className="relative">
                      <input type="file" onChange={(e)=>setFile(e.target.files[0])} className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 transition-all cursor-pointer bg-[#0A0F1A] p-2 rounded-xl border border-slate-800" />
                    </div>
                    <button onClick={handleIngest} disabled={ingestLoading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-[0_5px_15px_rgba(37,99,235,0.3)] hover:bg-blue-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 tracking-wide uppercase">
                      {ingestLoading ? <RefreshCw className="animate-spin" size={16}/> : "Execute Sync"}
                    </button>
                  </>
                ) : (
                  <div className="py-12 space-y-6 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.15)] border-2 border-emerald-500/20 relative">
                      <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping" />
                      <ShieldCheck size={28} />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-lg font-bold uppercase text-white tracking-tight">Synced</h4>
                      <p className="text-blue-400 text-xs font-semibold tracking-wide bg-blue-500/10 px-3 py-1.5 rounded-full inline-block">{ingestRes.path.join(' ❯ ')}</p>
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
    <button onClick={onClick} className={`w-full flex items-center justify-start text-left whitespace-nowrap overflow-hidden gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'}`}>
      <span className="shrink-0">{icon}</span>
      <span className="tracking-wide truncate">{label}</span>
    </button>
  );
}

function BottomNavLink({ icon, label, active, onClick, special }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors relative ${active ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
      {special && (
        <div className={`absolute -top-3 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-900/40 border-[3px] border-[#0E1420] ${active ? 'scale-105' : ''} transition-transform`}>
          {icon}
        </div>
      )}
      {!special && icon}
      <span className={`text-[9px] font-bold tracking-wide ${special ? 'mt-5 text-slate-400' : ''}`}>{label}</span>
    </button>
  );
}

function GovStat({ label, value, icon }) {
  return (
    <div className="bg-[#0A0F1A]/50 p-4 rounded-xl border border-slate-800/50 space-y-2">
      <div className="flex items-center gap-2 text-slate-400">
        {icon} <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-white tracking-tight truncate">{value}</p>
    </div>
  );
}

function BigStat({ label, value }) {
  return (
    <div className="space-y-1 min-w-0">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight truncate">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">{value}</p>
    </div>
  );
}

function Badge({ label, icon, color }) {
  return (
    <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-default ${color}`}>
      {icon} {label}
    </div>
  );
}

export default App;