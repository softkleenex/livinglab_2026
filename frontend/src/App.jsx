/* eslint-disable */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Radar, Map, Zap, ArrowLeft, Upload, Database, ShieldCheck, Plus, X, Layers, Lock, TrendingUp, BarChart3, PieChart, RefreshCw, Folder, BrainCircuit, Store, Users, Building2, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com';

const ROLES = [
  { id: 'store', name: '소상공인 (Store Level)', icon: <Store size={24}/>, desc: '내 매장 데이터 분석 및 피딩' },
  { id: 'leader', name: '상권 리더 (Street/Dong)', icon: <Users size={24}/>, desc: '관할 상권 트렌드 및 지표' },
  { id: 'gov', name: '정책 담당자 (Gu/City)', icon: <Building2 size={24}/>, desc: '디지털 트윈 맵 및 정책 시뮬레이션' }
];

function App() {
  const [userContext, setUserContext] = useState(null); // { role, industry, location: [] }
  
  if (!userContext) {
    return <Onboarding onComplete={setUserContext} />;
  }

  return <MainApp userContext={userContext} onLogout={() => setUserContext(null)} />;
}

function Onboarding({ onComplete }) {
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [locGu, setLocGu] = useState('');
  const [locDong, setLocDong] = useState('');
  const [locStreet, setLocStreet] = useState('');
  const [locStore, setLocStore] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) return alert('역할을 선택해주세요.');
    
    let location = ['대구광역시'];
    if (locGu) location.push(locGu);
    if (locDong) location.push(locDong);
    if (locStreet) location.push(locStreet);
    if (role === 'store' && locStore) location.push(locStore);

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/user/context`, {
        role, industry: industry || '공공', location
      });
      onComplete({ role, industry, location });
    } catch (err) {
      alert('초기화 실패. 서버 연결을 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-slate-200 flex items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="max-w-2xl w-full bg-[#0E1420] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5"><Radar size={200}/></div>
        <h1 className="text-3xl font-black text-white mb-2 relative z-10">MDGA Context Setup</h1>
        <p className="text-slate-400 mb-8 relative z-10">원활한 맞춤형 지능형 분석을 위해 역할을 설정합니다.</p>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">1. Select Persona</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ROLES.map(r => (
                <div key={r.id} onClick={() => setRole(r.id)} className={`p-4 rounded-xl border cursor-pointer transition-all ${role === r.id ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                  <div className="mb-3 text-blue-400">{r.icon}</div>
                  <div className="font-bold mb-1 text-sm">{r.name}</div>
                  <div className="text-[10px] opacity-70 break-keep">{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {role && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6">
                {role === 'store' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Industry (산업군)</label>
                    <input required placeholder="예: 요식업, 카페, 도소매" value={industry} onChange={e=>setIndustry(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white" />
                  </div>
                )}
                
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location Definition</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="구 (예: 북구)" value={locGu} onChange={e=>setLocGu(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white" />
                    {(role === 'store' || role === 'leader') && (
                      <input required placeholder="동 (예: 산격동)" value={locDong} onChange={e=>setLocDong(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white" />
                    )}
                    {(role === 'store' || role === 'leader') && (
                      <input required={role==='store'} placeholder="거리/상권 (예: 경북대 북문)" value={locStreet} onChange={e=>setLocStreet(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white" />
                    )}
                    {role === 'store' && (
                      <input required placeholder="매장명 (예: MDGA 카페)" value={locStore} onChange={e=>setLocStore(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white" />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" disabled={!role || loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-[0_5px_15px_rgba(37,99,235,0.3)] hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 uppercase tracking-widest mt-8">
            {loading ? <RefreshCw className="animate-spin" size={18}/> : "Enter Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
}

function MainApp({ userContext, onLogout }) {
  const [currentPath, setCurrentPath] = useState(userContext.role === 'gov' ? [] : userContext.location.slice(1));
  const [explorerData, setExplorerData] = useState(null);
  const [personalData, setPersonalData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const defaultTab = userContext.role === 'store' ? 'personal' : 'explorer';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const [showIngest, setShowIngest] = useState(false);

  useEffect(() => {
    if (activeTab === 'personal' && userContext.role === 'store') {
      fetchPersonal();
    } else {
      fetchExplorer();
    }
  }, [currentPath, activeTab]);

  const fetchExplorer = async () => {
    setLoading(true);
    try {
      const pathStr = ['대구광역시', ...currentPath].join('/');
      const res = await axios.get(`${API_BASE_URL}/api/hierarchy/explore?path=${pathStr}`);
      setExplorerData(res.data);
    } catch (err) { 
      setExplorerData(null);
    }
    finally { setLoading(false); }
  };

  const fetchPersonal = async () => {
    setLoading(true);
    try {
      const pathStr = userContext.location.join('/');
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/personal?path=${pathStr}`);
      setPersonalData(res.data);
    } catch (err) {
      setPersonalData(null);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (name) => setCurrentPath([...currentPath, name]);
  const goBack = () => setCurrentPath(currentPath.slice(0, -1));

  return (
    <div className="flex h-[100dvh] w-full bg-[#05080F] text-slate-200 overflow-hidden font-sans antialiased justify-center selection:bg-blue-500/30">
      
      {/* Mobile-first App Container */}
      <div className="w-full max-w-[480px] bg-[#0A0F1A] h-full flex flex-col relative border-x border-slate-800/60 shadow-2xl">

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0F1A]">
        {/* Header */}
        <header className="h-14 shrink-0 border-b border-slate-800/80 bg-[#0A0F1A]/95 backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg shadow-md"><Radar size={16} className="text-white"/></div>
            <span className="text-sm font-black text-white tracking-wider">MDGA</span>
          </div>
          <button onClick={onLogout} className="text-[10px] font-bold text-slate-400 uppercase bg-slate-800/50 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
            Logout
          </button>
        </header>

        {/* Path Breadcrumbs */}
        <div className="px-4 py-2 border-b border-slate-800/40 bg-[#0A0F1A] flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider overflow-x-auto no-scrollbar whitespace-nowrap shrink-0">
          <span className="text-blue-400">DAEGU</span>
          {currentPath.map((segment, i) => (
            <React.Fragment key={i}>
              <span className="shrink-0 opacity-40">/</span>
              <span className="text-slate-300">{segment}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-24 scroll-smooth">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full items-center justify-center">
                <RefreshCw size={28} className="text-blue-600 animate-spin" />
              </motion.div>
            ) : activeTab === 'personal' && personalData ? (
              <motion.div key="personal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl mx-auto w-full">
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <Badge label="STORE LEVEL" color="bg-blue-600/10 text-blue-400 border-blue-500/20" />
                    <h2 className="text-3xl md:text-5xl font-black text-white">{personalData.store.name}</h2>
                    <p className="text-slate-400 text-sm">내 매장 현황 및 데이터 자산화 보상 분석</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">My Asset Value</p>
                    <p className="text-2xl font-bold text-emerald-400">₩{personalData.store.total_value.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 mt-2">상권 평균: ₩{personalData.parent.avg_value.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Store Pulse</p>
                    <p className="text-2xl font-bold text-blue-400">{personalData.store.pulse} BPM</p>
                    <p className="text-[10px] text-slate-500 mt-2">상권 평균: {personalData.parent.pulse} BPM</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Consultings (보상)</h3>
                  {personalData.store.entries.length === 0 ? (
                    <div className="bg-[#101725] p-8 rounded-2xl border border-slate-800 text-center">
                      <p className="text-sm text-slate-400">아직 입력된 데이터가 없습니다. 하이퍼 피딩을 통해 매장 데이터를 업로드하고 AI 컨설팅을 받아보세요.</p>
                    </div>
                  ) : (
                    personalData.store.entries.map((entry, idx) => (
                      <div key={idx} className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-md">
                        <div className="flex items-center gap-2 mb-3">
                          <BrainCircuit size={16} className="text-blue-500" />
                          <span className="text-[10px] font-bold text-slate-400">{entry.timestamp}</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-blue-600 pl-3">{entry.insights}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ) : activeTab === 'explorer' && explorerData ? (
              <motion.div key="explorer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto w-full">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge label={`${explorerData.type} NODE`} color="bg-blue-600/10 text-blue-400 border-blue-500/20" />
                    <Badge label={`PULSE: ${explorerData.metadata.pulse_rate}BPM`} color="bg-rose-500/10 text-rose-400 border-rose-500/20" />
                  </div>
                  <div className="flex items-center gap-3">
                    {currentPath.length > (userContext.role==='gov'?0:userContext.location.length-1) && (
                      <button onClick={goBack} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors text-slate-300"><ArrowLeft size={20} /></button>
                    )}
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase break-keep leading-tight">{explorerData.current}</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <BigStat label="Aggregated Value" value={`₩${(explorerData.metadata.total_value || 0).toLocaleString()}`} />
                    <BigStat label="Node Density" value={explorerData.metadata.nodes} />
                    <BigStat label="Integrity" value={`${explorerData.metadata.trust_index || 0}%`} />
                  </div>
                </div>

                {explorerData.children && explorerData.children.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Layers size={14} className="text-blue-500"/> Sub Nodes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {explorerData.children.map(child => (
                        <div key={child.name} onClick={() => navigateTo(child.name)} className="bg-[#101725] p-5 rounded-2xl border border-slate-800/80 hover:border-blue-500/40 hover:bg-[#141D2C] cursor-pointer group transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white"><Folder size={18} /></div>
                            <div className="text-right w-16">
                              <span className="text-[9px] font-bold text-rose-400 uppercase">{child.pulse} bpm</span>
                              <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden"><div className="h-full bg-rose-500" style={{width: `${child.pulse}%`}} /></div>
                            </div>
                          </div>
                          <p className="text-lg font-bold text-slate-200 truncate">{child.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{child.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {explorerData.entries && explorerData.entries.length > 0 && userContext.role !== 'store' && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aggregated Insights</h3>
                    <div className="space-y-4">
                      {explorerData.entries.slice(-5).map((entry, idx) => (
                        <div key={idx} className="bg-[#101725] p-5 rounded-2xl border border-slate-800/80">
                          <div className="flex items-center gap-2 mb-3">
                            <BrainCircuit size={14} className="text-blue-500" />
                            <span className="text-[10px] font-bold text-slate-500">{entry.timestamp}</span>
                          </div>
                          <div className="text-sm text-slate-300 border-l-2 border-blue-600 pl-3">{entry.insights}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'governance' ? (
              <GovernanceSim explorerData={explorerData} />
            ) : null}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Nav (App-like for all views) */}
      <nav className="flex items-center justify-around bg-[#0E1420]/95 backdrop-blur-lg border-t border-slate-800/80 h-16 shrink-0 pb-safe z-50 absolute bottom-0 left-0 right-0 w-full">
        {userContext.role === 'store' && (
          <BottomNavLink icon={<Store size={20}/>} label="내 매장" active={activeTab === 'personal' && !showIngest} onClick={()=>{setActiveTab('personal'); setShowIngest(false);}} />
        )}
        <BottomNavLink icon={<Map size={20}/>} label="트윈 맵" active={activeTab === 'explorer' && !showIngest} onClick={()=>{setActiveTab('explorer'); setShowIngest(false);}} />
        {(userContext.role === 'gov' || userContext.role === 'leader') && (
          <BottomNavLink icon={<BarChart3 size={20}/>} label="시뮬레이터" active={activeTab === 'governance' && !showIngest} onClick={()=>{setActiveTab('governance'); setShowIngest(false);}} />
        )}
        {userContext.role === 'store' && (
          <BottomNavLink icon={<Zap size={20}/>} label="피딩" active={showIngest} onClick={()=>setShowIngest(true)} special />
        )}
      </nav>

      {/* Ingest Modal for Store */}
      <AnimatePresence>
        {showIngest && (
          <IngestModal 
            onClose={() => setShowIngest(false)} 
            onSuccess={() => {
              setShowIngest(false);
              if (activeTab === 'personal') fetchPersonal();
              else fetchExplorer();
            }}
            locationPath={userContext.location.join('/')}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

function IngestModal({ onClose, onSuccess, locationPath }) {
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);

  const handleIngest = async () => {
    setLoading(true);
    const formData = new FormData();
    if (rawText) formData.append('raw_text', rawText);
    if (file) formData.append('file', file);
    formData.append('location', locationPath);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ingest`, formData);
      setRes(response.data);
      setTimeout(onSuccess, 2500);
    } catch (err) { alert("업로드 실패"); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0A0F1A]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#101725] w-full max-w-lg rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden relative">
        <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-[#0E1420]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white"><Upload size={18}/></div>
            <h3 className="text-base font-bold text-white uppercase">Data Ingest</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20}/></button>
        </div>
        <div className="p-5 space-y-4">
          {!res ? (
            <>
              <p className="text-xs text-slate-400 text-center">매장의 일상, 영수증, 장부 등을 올려 자산화하고 AI 컨설팅을 받으세요.</p>
              <textarea value={rawText} onChange={e=>setRawText(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-200" rows={4} placeholder="오늘 우리 매장에는..." />
              <input type="file" onChange={e=>setFile(e.target.files[0])} className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-500/10 file:text-blue-400 bg-[#0A0F1A] p-2 rounded-xl border border-slate-800" />
              <button onClick={handleIngest} disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 flex justify-center items-center gap-2">
                {loading ? <RefreshCw className="animate-spin" size={16}/> : "업로드 및 자산화"}
              </button>
            </>
          ) : (
            <div className="py-10 text-center space-y-4">
              <ShieldCheck size={48} className="text-emerald-400 mx-auto" />
              <h4 className="text-lg font-bold text-white">업로드 완료</h4>
              <p className="text-xs text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full inline-block">+ ₩{res.value_added.toLocaleString()} 자산 증가</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function GovernanceSim({ explorerData }) {
  const [budget, setBudget] = useState(100000000);
  const [simRes, setSimRes] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSim = async () => {
    if(!explorerData) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('budget', budget);
      fd.append('region', explorerData.current);
      const res = await axios.post(`${API_BASE_URL}/api/simulate/governance`, fd);
      setSimRes(res.data.simulation);
    } catch(err) { alert("Sim Error"); }
    finally { setLoading(false); }
  }

  if (!explorerData) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto w-full">
      <h2 className="text-2xl md:text-4xl font-bold text-white">Policy Simulator</h2>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-[#101725] p-6 rounded-2xl border border-slate-800 space-y-6 h-fit">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Target: {explorerData.current}</label>
          <input type="range" min="10000000" max="1000000000" step="10000000" value={budget} onChange={(e)=>setBudget(e.target.value)} className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-blue-600" />
          <div className="text-2xl font-bold text-white">₩{parseInt(budget).toLocaleString()}</div>
          <button onClick={runSim} disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 flex justify-center gap-2">
            {loading ? <RefreshCw className="animate-spin" size={16}/> : "Run"}
          </button>
        </div>
        <div className="lg:col-span-3">
          {simRes ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <GovStat label="ROI" value={simRes.roi_multiplier} icon={<TrendingUp size={16} className="text-emerald-400"/>} />
                <GovStat label="Jobs" value={simRes.job_creation} icon={<Plus size={16} className="text-blue-400"/>} />
              </div>
              <div className="bg-[#101725] p-6 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-white mb-2">AI Directive</h4>
                <div className="text-sm text-slate-300 border-l-2 border-blue-500 pl-3 mb-4">{simRes.ai_recommendation}</div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
                  <div><p className="text-[10px] text-slate-500 mb-1">Sector</p><p className="text-sm text-blue-400">{simRes.sector_boost}</p></div>
                  <div><p className="text-[10px] text-slate-500 mb-1">Risk</p><p className="text-sm text-rose-400">{simRes.vulnerability_warning}</p></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[160px] flex items-center justify-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Ready</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
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