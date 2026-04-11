/* eslint-disable */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Radar, Map, Zap, ArrowLeft, Upload, Database, ShieldCheck, Plus, X, Layers, Lock, TrendingUp, BarChart3, PieChart, RefreshCw, Folder, BrainCircuit, Store, Users, Building2, ChevronRight, FileText, Download, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com';

const LEVELS = [
  { id: 'store', role: 'store', name: '가게 (Store)', icon: <Store size={24}/>, desc: '매출, 가게 정보, 리뷰 등 내 매장 데이터' },
  { id: 'street', role: 'leader', name: '거리 (Street)', icon: <Map size={24}/>, desc: '해당 거리 내 사업자들의 취합 데이터' },
  { id: 'dong', role: 'leader', name: '동 (Dong)', icon: <Users size={24}/>, desc: '거리 데이터들의 집합 (동 단위 트렌드)' },
  { id: 'gu', role: 'gov', name: '구 (Gu)', icon: <Building2 size={24}/>, desc: '동 데이터들의 집합 (구별 산업 특성)' }
];

function App() {
  const [googleUser, setGoogleUser] = useState(null);
  const [userContext, setUserContext] = useState(null); // { role, industry, location: [] }
  
  if (!googleUser) {
    return <GoogleLoginScreen onLogin={setGoogleUser} />;
  }

  if (!userContext) {
    return <Onboarding onComplete={setUserContext} googleUser={googleUser} />;
  }

  return <MainApp userContext={userContext} googleUser={googleUser} onLogout={() => {setUserContext(null); setGoogleUser(null);}} />;
}

function GoogleLoginScreen({ onLogin }) {
  return (
    <div className="min-h-screen bg-[#0A0F1A] text-slate-200 flex flex-col items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="max-w-md w-full bg-[#0E1420] border border-slate-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 right-0 p-8 opacity-5"><Radar size={150}/></div>
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/50">
          <Radar size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2 relative z-10 tracking-tight">MDGA</h1>
        <p className="text-slate-400 mb-8 text-xs relative z-10 uppercase tracking-widest font-bold">Universal Data Engine</p>
        
        <div className="w-full bg-[#101725] p-6 rounded-2xl border border-slate-800 mb-6 relative z-10 flex flex-col items-center">
          <p className="text-xs text-slate-500 mb-6 font-bold uppercase tracking-wider">구글 계정으로 간편 시작</p>
          <GoogleLogin
            onSuccess={credentialResponse => {
              const decoded = jwtDecode(credentialResponse.credential);
              onLogin(decoded);
            }}
            onError={() => {
              console.log('Login Failed');
            }}
            theme="filled_black"
            shape="pill"
          />
        </div>
        <p className="text-[10px] text-slate-600 relative z-10 font-medium">별도의 회원가입 없이 기존 구글 계정으로 연동됩니다.</p>
      </div>
    </div>
  );
}

function Onboarding({ onComplete, googleUser }) {
  const [levelId, setLevelId] = useState('');
  const [industry, setIndustry] = useState('');
  const [locGu, setLocGu] = useState('');
  const [locDong, setLocDong] = useState('');
  const [locStreet, setLocStreet] = useState('');
  const [locStore, setLocStore] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!levelId) return alert('객체 단위를 선택해주세요.');
    
    const selectedLevel = LEVELS.find(l => l.id === levelId);
    let location = ['대구광역시'];
    if (locGu) location.push(locGu);
    if (locDong) location.push(locDong);
    if (locStreet) location.push(locStreet);
    if (levelId === 'store' && locStore) location.push(locStore);

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/user/context`, {
        role: selectedLevel.role, industry: industry || '공공', location
      });
      onComplete({ role: selectedLevel.role, industry, location });
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
        <p className="text-slate-400 mb-8 relative z-10">원활한 맞춤형 지능형 분석을 위해 현재 당신이 해당하는 객체 단위를 설정합니다.</p>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">1. Select Target Object</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {LEVELS.map(l => (
                <div key={l.id} onClick={() => setLevelId(l.id)} className={`p-4 rounded-xl border cursor-pointer transition-all ${levelId === l.id ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                  <div className="mb-3 text-blue-400">{l.icon}</div>
                  <div className="font-bold mb-1 text-sm">{l.name}</div>
                  <div className="text-[10px] opacity-70 break-keep">{l.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {levelId && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6">
                {levelId === 'store' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Industry (산업군)</label>
                    <input required placeholder="예: 요식업, 카페, 도소매" value={industry} onChange={e=>setIndustry(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white" />
                  </div>
                )}
                
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location Definition</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="구 (예: 북구)" value={locGu} onChange={e=>setLocGu(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white" />
                    {(levelId === 'store' || levelId === 'street' || levelId === 'dong') && (
                      <input required placeholder="동 (예: 산격동)" value={locDong} onChange={e=>setLocDong(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white" />
                    )}
                    {(levelId === 'store' || levelId === 'street') && (
                      <input required={levelId==='store' || levelId==='street'} placeholder="거리/상권 (예: 경북대 북문)" value={locStreet} onChange={e=>setLocStreet(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white" />
                    )}
                    {levelId === 'store' && (
                      <input required placeholder="매장명 (예: MDGA 카페)" value={locStore} onChange={e=>setLocStore(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white" />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" disabled={!levelId || loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-[0_5px_15px_rgba(37,99,235,0.3)] hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 uppercase tracking-widest mt-8">
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
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (activeTab === 'personal' && userContext.role === 'store') {
      fetchPersonal();
    } else {
      fetchExplorer();
    }
  }, [currentPath, activeTab]);

  useEffect(() => {
    const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/ws/updates';
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        // Refetch to get the latest values when anyone updates
        if (activeTab === 'personal' && userContext.role === 'store') {
          fetchPersonal();
        } else if (activeTab === 'explorer') {
          fetchExplorer();
        }
      }
    };

    return () => ws.close();
  }, [activeTab, currentPath, userContext]);

  const fetchExplorer = React.useCallback(async () => {
    setLoading(true);
    try {
      const pathStr = ['대구광역시', ...currentPath].join('/');
      const res = await axios.get(`${API_BASE_URL}/api/hierarchy/explore?path=${pathStr}`);
      setExplorerData(res.data);
    } catch (err) { 
      setExplorerData(null);
    }
    finally { setLoading(false); }
  }, [currentPath]);

  const fetchPersonal = React.useCallback(async () => {
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
  }, [userContext.location]);

  const handleDeleteEntry = async (hash) => {
    if(!window.confirm("이 데이터를 삭제하시겠습니까? 신뢰 지수(Trust Index)가 하락할 수 있습니다.")) return;
    try {
      const pathStr = userContext.location.join('/');
      await axios.delete(`${API_BASE_URL}/api/ingest/delete?path=${pathStr}&hash_val=${hash}`);
      fetchPersonal(); // 리스트 즉시 새로고침
    } catch(err) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleDownloadEntry = (entry) => {
    const content = `[MDGA Data Entry]\nTime: ${entry.timestamp}\nScope: ${entry.scope === 'store_specific' ? 'My Store' : 'Public Data'}\nTrust Index: ${entry.trust_index || 50.0}%\n\n[Insights]\n${entry.insights}\n\n[Raw Data]\n${entry.raw_text || 'N/A'}\n${entry.drive_link ? `\n[Attached File]\n${entry.drive_link}` : ''}`;
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `MDGA_Data_${entry.hash.substring(0,8)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDemoInject = async () => {
    setLoading(true);
    try {
      const pathStr = userContext.location.join('/');
      await axios.post(`${API_BASE_URL}/api/demo/inject?path=${pathStr}`);
      fetchPersonal();
    } catch(e) { alert("데모 주입 실패"); }
    finally { setLoading(false); }
  };

  const navigateTo = React.useCallback((name) => setCurrentPath([...currentPath, name]), [currentPath]);
  const goBack = React.useCallback(() => setCurrentPath(currentPath.slice(0, -1)), [currentPath]);

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
          <div className="flex items-center gap-3">
            {googleUser?.picture && (
              <img src={googleUser.picture} alt="profile" className="w-6 h-6 rounded-full border border-slate-700" />
            )}
            <button onClick={onLogout} className="text-[10px] font-bold text-slate-400 uppercase bg-slate-800/50 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
              Logout
            </button>
          </div>
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
                  <div className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-600/20 text-blue-400 text-[9px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-blue-500/20 uppercase">
                      Trust: {personalData.store.trust_index ? personalData.store.trust_index.toFixed(1) : 50.0}%
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">My Asset Value</p>
                    <motion.p key={personalData.store.total_value} initial={{ scale: 1.1, color: '#34d399' }} animate={{ scale: 1, color: '#34d399' }} className="text-2xl font-bold text-emerald-400">
                      ₩{personalData.store.total_value.toLocaleString()}
                    </motion.p>
                    <p className="text-[10px] text-slate-500 mt-2">상권 평균: ₩{personalData.parent.avg_value.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Store Pulse</p>
                    <div className="flex items-end gap-3">
                      <motion.p key={personalData.store.pulse} initial={{ scale: 1.5, color: '#60a5fa' }} animate={{ scale: 1, color: '#3b82f6' }} className="text-2xl font-bold text-blue-400">
                        {personalData.store.pulse} BPM
                      </motion.p>
                      <Sparkline data={personalData.store.history} color="#3b82f6" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">상권 평균: {personalData.parent.pulse} BPM</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Consultings (보상)</h3>
                    <button onClick={() => setShowReport(true)} className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-colors uppercase">
                      <FileText size={12} /> 주간 리포트 발행
                    </button>
                  </div>
                  {personalData.store.entries.length === 0 ? (
                    <div className="bg-[#101725] p-8 rounded-2xl border border-slate-800 text-center flex flex-col items-center gap-4">
                      <p className="text-sm text-slate-400">아직 입력된 데이터가 없습니다. 하이퍼 피딩을 통해 매장 데이터를 업로드하고 AI 컨설팅을 받아보세요.</p>
                      <button onClick={handleDemoInject} className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-colors">
                        ✨ 데모 데이터 자동 완성 (발표용)
                      </button>
                    </div>
                  ) : (
                    personalData.store.entries.map((entry, idx) => (
                      <div key={idx} className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-md relative group">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <BrainCircuit size={16} className="text-blue-500" />
                              <span className="text-[10px] font-bold text-slate-400">{entry.timestamp}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`w-fit text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest ${entry.scope === 'store_specific' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                                {entry.scope === 'store_specific' ? 'My Store' : 'Public Data'}
                              </span>
                              <span className="text-[9px] font-bold text-slate-500 uppercase">Trust: {entry.trust_index ? entry.trust_index.toFixed(1) : 50.0}%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => handleDownloadEntry(entry)} className="text-slate-600 hover:text-blue-400 transition-colors" title="데이터 텍스트로 다운로드">
                              <Download size={16} />
                            </button>
                            <button onClick={() => handleDeleteEntry(entry.hash)} className="text-slate-600 hover:text-red-400 transition-colors" title="데이터 삭제 (신뢰도 하락 경고)">
                              <Trash2 size={16} />
                            </button>
                          </div>
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
                    <div className="grid grid-cols-1 gap-3">
                      {explorerData.children.map(child => (
                        <div key={child.name} onClick={() => navigateTo(child.name)} className="bg-[#101725] p-4 rounded-2xl border border-slate-800/80 hover:border-blue-500/50 hover:bg-[#121A2A] cursor-pointer group transition-all flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><Folder size={20} /></div>
                            <div>
                              <p className="text-base font-bold text-slate-200">{child.name}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 tracking-wider">{child.type} LEVEL</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end gap-1">
                                <p className="text-[10px] text-slate-500 font-bold">ACTIVITY</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-emerald-400 uppercase">{child.pulse} BPM</span>
                                  <Sparkline data={child.history} color="#10b981" width={40} height={15} />
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-blue-600 transition-colors">
                                <ChevronRight size={16}/>
                            </div>
                          </div>
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
        {showReport && (
          <ReportModal
            onClose={() => setShowReport(false)}
            locationPath={userContext.location.join('/')}
          />
        )}
      </AnimatePresence>      </div>
    </div>
  );
}

function IngestModal({ onClose, onSuccess, locationPath }) {
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

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
            <h3 className="text-base font-bold text-white uppercase">Data & Vision Ingest</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20}/></button>
        </div>
        <div className="p-5 space-y-4">
          {!res ? (
            <>
              <p className="text-xs text-slate-400 text-center">텍스트는 물론, 매장의 전경이나 영수증을 업로드하면 Vision AI가 분석하여 자산화합니다.</p>
              
              {preview && (
                <div className="relative w-full h-32 bg-black rounded-xl overflow-hidden border border-slate-800">
                  <img src={preview} alt="preview" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-900/30">
                    <span className="bg-[#0A0F1A]/80 text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm border border-blue-500/30">Vision AI Ready</span>
                  </div>
                </div>
              )}
              
              <textarea value={rawText} onChange={e=>setRawText(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-200" rows={preview ? 2 : 4} placeholder="여기에 텍스트 상황을 입력하세요..." />
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-500/10 file:text-blue-400 bg-[#0A0F1A] p-2 rounded-xl border border-slate-800" />
              
              <label className="flex items-start gap-2 opacity-50 cursor-not-allowed">
                <input type="checkbox" disabled checked={false} className="mt-1" />
                <span className="text-xs text-slate-400">다른 사용자의 데이터 다운로드 허용 안 함<br/><span className="text-[10px] text-red-400 font-bold">(현재 개발 중으로 필수 공개 설정됨)</span></span>
              </label>

              <button onClick={handleIngest} disabled={loading || (!rawText && !file)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
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
                <h4 className="text-xs font-bold text-white mb-4 flex items-center gap-2"><PieChart size={14} className="text-blue-400"/> Impact Analysis</h4>
                <div className="space-y-3 mb-6">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                      <span className="uppercase">{simRes.sector_boost.split(' ')[0] || 'Tech'} Sector Growth</span>
                      <span className="text-emerald-400">+85%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{width: '85%'}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                      <span className="uppercase">Local Commerce</span>
                      <span className="text-blue-400">+62%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: '62%'}}></div></div>
                  </div>
                </div>
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

const SidebarLink = React.memo(({ icon, label, active, onClick }) => {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-start text-left whitespace-nowrap overflow-hidden gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'}`}>
      <span className="shrink-0">{icon}</span>
      <span className="tracking-wide truncate">{label}</span>
    </button>
  );
});

const BottomNavLink = React.memo(({ icon, label, active, onClick, special }) => {
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
});

const GovStat = React.memo(({ label, value, icon }) => {
  return (
    <div className="bg-[#0A0F1A]/50 p-4 rounded-xl border border-slate-800/50 space-y-2">
      <div className="flex items-center gap-2 text-slate-400">
        {icon} <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-white tracking-tight truncate">{value}</p>
    </div>
  );
});

const BigStat = React.memo(({ label, value }) => {
  return (
    <div className="space-y-1 min-w-0">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight truncate">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">{value}</p>
    </div>
  );
});

const Sparkline = React.memo(({ data, color, width = 60, height = 20 }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
});

const Badge = React.memo(({ label, icon, color }) => {
  return (
    <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-default ${color}`}>
      {icon} {label}
    </div>
  );
});

function ReportModal({ onClose, locationPath }) {
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/dashboard/report?path=${locationPath}`);
        setReport(res.data.report);
      } catch (err) {
        setReport("리포트를 생성하지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [locationPath]);

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([report], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `MDGA_주간_경영_리포트_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0A0F1A]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#101725] w-full max-w-lg max-h-[80vh] rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col relative">
        <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-[#0E1420] rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white"><FileText size={18}/></div>
            <h3 className="text-base font-bold text-white uppercase">주간 경영 요약 뉴스레터</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
        </div>
        <div className="p-5 overflow-y-auto grow custom-scrollbar">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-4">
              <RefreshCw className="animate-spin text-blue-500" size={32}/>
              <p className="text-sm text-slate-400 font-medium">이번 주 데이터를 분석하여 보고서를 작성 중입니다...</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-medium flex-grow mb-6">
                {report}
              </div>
              <button 
                onClick={handleDownload}
                className="w-full py-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-colors flex justify-center items-center gap-2 mt-auto shrink-0"
              >
                <Download size={16} /> 리포트 텍스트 파일로 저장
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default App;