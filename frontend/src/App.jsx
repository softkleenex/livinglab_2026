/* eslint-disable */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Radar, Map, Zap, ArrowLeft, Upload, Database, ShieldCheck, Plus, X, Layers, Lock, TrendingUp, BarChart3, PieChart, RefreshCw, Folder, BrainCircuit, Store, Users, Building2, ChevronRight, FileText, Download, Trash2, MapPin, Info, Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const customMarkerIcon = new L.DivIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="color: #3b82f6; filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#0A0F1A" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="#3b82f6"/></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

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
          <div className="w-full flex flex-col items-center gap-3">
            <GoogleLogin
              onSuccess={credentialResponse => {
                const decoded = jwtDecode(credentialResponse.credential);
                onLogin({ ...decoded, isGuest: false });
              }}
              onError={() => {
                console.log('Login Failed');
              }}
              theme="filled_black"
              shape="pill"
            />
            <div className="w-full border-t border-slate-800 my-2 relative">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#101725] px-2 text-[10px] text-slate-500 font-bold uppercase">or</span>
            </div>
            <button onClick={() => onLogin({ name: 'Guest User', isGuest: true })} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full font-bold text-xs transition-colors border border-slate-700">
              구글 계정 없이 게스트로 둘러보기
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-600 relative z-10 font-medium">별도의 회원가입 없이 기존 구글 계정으로 연동됩니다.<br/>(게스트 모드 시 데이터 신뢰도 가중치 하락)</p>
      </div>
    </div>
  );
}

function LocationSelector({ setMapCenter, setLocGu, setLocDong, setLocStreet }) {
  useMapEvents({
    click(e) {
      // Mock reverse geocoding for presentation
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setMapCenter([lat, lng]);
      setLocGu(lat > 35.87 ? '북구' : '중구');
      setLocDong(lng > 128.6 ? '산격동' : '삼덕동');
      setLocStreet(lat > 35.87 ? '경북대 북문' : '동성로');
    }
  });
  return null;
}

function Onboarding({ onComplete, googleUser }) {
  const [levelId, setLevelId] = useState(googleUser?.isGuest ? '' : 'store');
  const [industry, setIndustry] = useState('');
  const [locGu, setLocGu] = useState('');
  const [locDong, setLocDong] = useState('');
  const [locStreet, setLocStreet] = useState('');
  const [locStore, setLocStore] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([35.8714, 128.6014]); // Daegu center

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
      onComplete({ role: selectedLevel.role, industry, location, isGuest: googleUser?.isGuest || false });
    } catch (err) {
      alert('초기화 실패. 서버 연결을 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-slate-200 flex items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="max-w-3xl w-full bg-[#0E1420] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5"><Radar size={200}/></div>
        <h1 className="text-3xl font-black text-white mb-2 relative z-10">MDGA Context Setup</h1>
        <p className="text-slate-400 mb-8 relative z-10">
          {!googleUser?.isGuest ? (
            <span className="text-emerald-400 font-bold">✨ 구글 공식 인증된 사업자(Store) 모드로 자동 설정됩니다. 다른 단위도 선택 가능합니다.</span>
          ) : (
            <span className="text-orange-400 font-bold">⚠️ 게스트 모드로 진입 중입니다. 매장(Store) 데이터 업로드 시 신뢰도 패널티가 적용됩니다.</span>
          )}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">1. Select Target Object</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {LEVELS.map(l => (
                <div key={l.id} onClick={() => setLevelId(l.id)} className={`p-4 rounded-xl border cursor-pointer transition-all ${levelId === l.id ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                  <div className="mb-3 text-blue-400">{l.icon}</div>
                  <div className="font-bold mb-1 text-sm flex items-center gap-1">
                    {l.name} {l.id === 'store' && !googleUser?.isGuest && <ShieldCheck size={12} className="text-emerald-400" title="공식 인증" />}
                  </div>
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
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">2. Location Definition</label>
                  
                  <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-800 relative z-0 shadow-inner">
                    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', background: '#0A0F1A' }} zoomControl={false}>
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                      />
                      <LocationSelector setMapCenter={setMapCenter} setLocGu={setLocGu} setLocDong={setLocDong} setLocStreet={setLocStreet} />
                      <Marker position={mapCenter} icon={customMarkerIcon} />
                    </MapContainer>
                    <div className="absolute bottom-4 left-4 z-[400] pointer-events-none">
                       <div className="bg-[#0E1420]/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/50 shadow-xl flex items-center gap-2">
                         <MapPin size={14} className="text-blue-400"/>
                         <span className="text-[10px] font-bold text-slate-300">지도를 클릭하여 위치를 설정하세요</span>
                       </div>
                    </div>
                  </div>

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

function MainApp({ userContext, googleUser, onLogout }) {
  const [currentPath, setCurrentPath] = useState(userContext.role === 'gov' ? [] : userContext.location.slice(1));
  const [explorerData, setExplorerData] = useState(null);
  const [personalData, setPersonalData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const defaultTab = userContext.role === 'store' ? 'personal' : 'explorer';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const [showIngest, setShowIngest] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const addToast = (message, type = 'info') => {
    const newNotif = { id: Date.now(), message, type };
    setNotifications(prev => [newNotif, ...prev].slice(0, 3));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 4000);
  };

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
        const storeName = data.path[data.path.length - 1];
        addToast(`${storeName}에서 새로운 데이터 피딩! (자산 +₩${data.value_added.toLocaleString()})`, 'success');

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
      addToast("상권/지역 데이터를 불러오는데 실패했습니다.", 'error');
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
      addToast("내 매장 데이터를 불러오는데 실패했습니다.", 'error');
    } finally {
      setLoading(false);
    }
  }, [userContext.location]);

  const handleDeleteEntry = async (hash) => {
    if(!window.confirm("이 데이터를 삭제하시겠습니까? 신뢰 지수(Trust Index)가 하락할 수 있습니다.")) return;
    try {
      const pathStr = userContext.location.join('/');
      await axios.delete(`${API_BASE_URL}/api/ingest/delete?path=${pathStr}&hash_val=${hash}`);
      addToast("성공적으로 데이터를 삭제했습니다.", "info");
      fetchPersonal(); // 리스트 즉시 새로고침
    } catch(err) {
      addToast("삭제 중 오류가 발생했습니다.", "error");
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
    addToast("데모 데이터를 생성 중입니다...", 'info');
    try {
      const pathStr = userContext.location.join('/');
      await axios.post(`${API_BASE_URL}/api/demo/inject?path=${pathStr}`);
      addToast("데모 데이터 주입이 완료되었습니다.", 'success');
      fetchPersonal();
    } catch(e) { 
      addToast("데모 데이터 주입에 실패했습니다.", 'error'); 
    }
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
            <button onClick={() => setShowWallet(true)} className="flex items-center gap-1.5 px-2 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg border border-yellow-500/30 transition-colors">
              <Coins size={14}/>
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">$MDGA</span>
            </button>
            {googleUser?.isGuest ? (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30 text-[10px] font-bold">
                <span>Guest</span>
              </div>
            ) : googleUser?.picture ? (
              <img src={googleUser.picture} alt="profile" className="w-6 h-6 rounded-full border border-emerald-500/50 shadow-sm shadow-emerald-500/20" />
            ) : null}
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
                    <p className="text-slate-400 text-sm">
                      {(userContext.industry && userContext.industry !== '공공') 
                        ? `[${userContext.industry}] 전용 비즈니스 통합 관리 대시보드` 
                        : '내 매장 현황 및 데이터 자산화 보상 분석'}
                    </p>
                  </div>
                </div>

                {/* B2B / General Industry Specific Dashboard */}
                {(userContext.industry && userContext.industry !== '공공') ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-blue-600/20 text-blue-400 text-[9px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-blue-500/20 uppercase">
                          Trust: {personalData.store.trust_index ? personalData.store.trust_index.toFixed(1) : 50.0}%
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp size={12}/> 일간 주요 실적 (매출/생산)</p>
                        <motion.p key={personalData.store.total_value} initial={{ scale: 1.1, color: '#34d399' }} animate={{ scale: 1, color: '#34d399' }} className="text-2xl font-bold text-emerald-400">
                          ₩{(personalData.store.total_value * 2.5).toLocaleString()}
                        </motion.p>
                        <p className="text-[10px] text-slate-500 mt-2">상권/산업 평균: ₩{personalData.parent.avg_value.toLocaleString()}</p>
                      </div>
                      <div className="bg-[#101725] p-5 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative">
                        <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-emerald-500/20 uppercase">
                          AI Predicted
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Database size={12}/> 익월 AI 추천/예측 지표</p>
                        <div className="flex items-end gap-3">
                          <motion.p key={personalData.store.pulse} initial={{ scale: 1.5, color: '#10b981' }} animate={{ scale: 1, color: '#10b981' }} className="text-2xl font-bold text-white">
                            +{(personalData.store.pulse * 1.5).toFixed(0)}% 성장
                          </motion.p>
                          <Sparkline data={personalData.store.history.map(v => v * 1.2)} color="#10b981" />
                        </div>
                        <p className="text-[10px] text-emerald-500 mt-2 font-bold flex items-center gap-1">업계 트렌드 및 기상/환경 분석 완료</p>
                      </div>
                    </div>
                    
                    <div className="bg-[#101725] p-6 rounded-2xl border border-slate-800 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Layers size={14} className="text-blue-500" /> 데이터 통합 연동 (Data Hub)
                        </h3>
                        <Badge label="BETA" color="bg-orange-500/10 text-orange-400 border-orange-500/20" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-xl transition-all cursor-pointer">
                          <FileText size={24} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-300">현장/수기 일지 연동</span>
                          <span className="text-[9px] text-slate-500">스마트폰 사진/텍스트 추출</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-900/10 hover:bg-blue-900/20 border border-blue-900/30 hover:border-blue-500/50 rounded-xl transition-all cursor-pointer">
                          <Users size={24} className="text-blue-400" />
                          <span className="text-xs font-bold text-blue-300">주문/플랫폼 연동</span>
                          <span className="text-[9px] text-blue-500/70">일별 주문/예약 데이터</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-xl transition-all cursor-pointer">
                          <Upload size={24} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-300">외부 API / 출고 연동</span>
                          <span className="text-[9px] text-slate-500">물류/택배사 상태 크롤링</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Dashboard */
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
                )}

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
                    {currentPath.length > 0 && (
                      <button onClick={goBack} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors text-slate-300"><ArrowLeft size={20} /></button>
                    )}
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase break-keep leading-tight">{explorerData.current}</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <BigStat label="Aggregated Value" value={`₩${(explorerData.total_value || explorerData.metadata.total_value || 0).toLocaleString()}`} />
                    <BigStat label="Node Density" value={explorerData.metadata.nodes} />
                    <BigStat label="Integrity" value={`${explorerData.trust_index || explorerData.metadata.trust_index || 50.0}%`} />
                  </div>
                </div>

                {explorerData.children && explorerData.children.length > 0 && (
                  <div className="space-y-4">
                    {/* Digital Twin Map for Gov/Explorer */}
                    <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-800 relative z-0 shadow-inner mb-6">
                      <MapContainer center={[35.8714, 128.6014]} zoom={12} style={{ height: '100%', width: '100%', background: '#0A0F1A' }} zoomControl={false}>
                        <TileLayer
                          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        {explorerData.children.map((child, idx) => {
                          const latLng = child.location || [35.8714, 128.6014];
                          return (
                            <Marker key={child.name} position={latLng} icon={customMarkerIcon} />
                          );
                        })}
                      </MapContainer>
                      <div className="absolute top-4 left-4 z-[400] pointer-events-none">
                         <div className="bg-[#0E1420]/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/50 shadow-xl flex items-center gap-2">
                           <Map size={14} className="text-emerald-400"/>
                           <span className="text-[10px] font-bold text-slate-300">디지털 트윈 모니터링 (가상 위치)</span>
                         </div>
                      </div>
                    </div>

                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Layers size={14} className="text-blue-500"/> Sub Nodes Leaderboard</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {[...explorerData.children].sort((a, b) => b.pulse - a.pulse).map((child, idx) => (
                        <div key={child.name} onClick={() => navigateTo(child.name)} className="bg-[#101725] p-4 rounded-2xl border border-slate-800/80 hover:border-blue-500/50 hover:bg-[#121A2A] cursor-pointer group transition-all flex items-center justify-between relative overflow-hidden">
                          {idx === 0 && (
                            <div className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-lg shadow-rose-500/20">
                              Top Activity 🔥
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><Folder size={20} /></div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-base font-bold text-slate-200">{child.name}</p>
                              </div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 tracking-wider">{child.type} LEVEL</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end gap-1 mt-2">
                                <p className="text-[10px] text-slate-500 font-bold">ACTIVITY</p>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold uppercase ${idx === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{child.pulse} BPM</span>
                                  <Sparkline data={child.history} color={idx === 0 ? "#fb7185" : "#10b981"} width={40} height={15} />
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
            isGuest={googleUser?.isGuest}
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
            userContext={userContext}
          />
        )}
        {showWallet && (
          <WalletModal
            onClose={() => setShowWallet(false)}
            personalData={personalData}
          />
        )}
      </AnimatePresence>

      {/* Global Notifications (Toasts) */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50 pointer-events-none flex flex-col gap-2">
        <AnimatePresence>
          {notifications.map(notif => {
            let bgColor = "bg-blue-600/90 shadow-blue-900/30 border-blue-500/50";
            let Icon = Zap;
            
            if (notif.type === 'success') {
              bgColor = "bg-emerald-600/90 shadow-emerald-900/30 border-emerald-500/50";
              Icon = ShieldCheck;
            } else if (notif.type === 'error') {
              bgColor = "bg-rose-600/90 shadow-rose-900/30 border-rose-500/50";
              Icon = X;
            } else if (notif.type === 'info') {
              bgColor = "bg-slate-800/90 shadow-slate-900/30 border-slate-700/50";
              Icon = Info;
            }

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`${bgColor} border backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3`}
              >
                <Icon size={18} className="shrink-0" />
                <p className="text-[11px] font-bold tracking-wide break-keep">{notif.message}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      </div>
    </div>
  );
}

function IngestModal({ isGuest, onClose, onSuccess, locationPath }) {
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
    if (isGuest) formData.append('is_guest', 'true');
    
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
              {isGuest ? (
                <p className="text-xs text-orange-400 text-center font-bold">⚠️ 게스트 모드: 업로드되는 데이터는 신뢰도 가중치에서 패널티를 받습니다.</p>
              ) : (
                <p className="text-xs text-emerald-400 text-center font-bold">✨ 구글 공식 인증 계정: 업로드 데이터에 높은 신뢰도 가중치가 부여됩니다.</p>
              )}
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
  const [errorMsg, setErrorMsg] = useState(null);

  const runSim = async () => {
    if(!explorerData) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const fd = new FormData();
      fd.append('budget', budget);
      fd.append('region', explorerData.current);
      const res = await axios.post(`${API_BASE_URL}/api/simulate/governance`, fd);
      setSimRes(res.data.simulation);
    } catch(err) { 
      setErrorMsg("시뮬레이션 서버 연결에 실패했습니다.");
    } finally { 
      setLoading(false); 
    }
  }

  if (!explorerData) return null;

  // Mock chart data generation for the result
  const chartData = [
    { label: "서비스업", value: Math.floor(Math.random() * 40 + 20), color: "#3b82f6" },
    { label: "제조/농업", value: Math.floor(Math.random() * 30 + 15), color: "#10b981" },
    { label: "도소매업", value: Math.floor(Math.random() * 25 + 10), color: "#f59e0b" },
    { label: "관광/기타", value: Math.floor(Math.random() * 20 + 5), color: "#8b5cf6" },
  ].sort((a,b) => b.value - a.value);

  const maxVal = Math.max(...chartData.map(d => d.value));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto w-full pb-8 px-2 sm:px-0">
      <div className="flex flex-col gap-2">
        <Badge label="GOV LEVEL" color="bg-rose-500/10 text-rose-400 border-rose-500/20" />
        <h2 className="text-2xl md:text-4xl font-black text-white">Policy Simulator</h2>
        <p className="text-slate-400 text-[10px] sm:text-xs mt-1">AI 기반 예산 투입 효과 시뮬레이션 시스템</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-[#101725] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-lg space-y-6 h-fit relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-5"><PieChart size={150} /></div>
          
          <div className="space-y-2 relative z-10">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin size={12}/> Target Node
            </label>
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-sm font-bold text-blue-400">{explorerData.current}</div>
          </div>

          <div className="space-y-2 relative z-10">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest break-keep">투입 예산 (Budget)</label>
              <span className="text-xs font-bold text-emerald-400">₩{parseInt(budget).toLocaleString()}</span>
            </div>
            <input type="range" min="10000000" max="1000000000" step="10000000" value={budget} onChange={(e)=>setBudget(e.target.value)} className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-blue-600" />
          </div>
          
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-bold flex items-center gap-2">
              <X size={14} className="shrink-0"/> {errorMsg}
            </div>
          )}

          <button onClick={runSim} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-[0_5px_15px_rgba(37,99,235,0.3)] hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all uppercase tracking-widest relative z-10">
            {loading ? <><RefreshCw className="animate-spin" size={16}/> 시뮬레이션 중...</> : "Run Simulation"}
          </button>
        </div>
        
        <div className="lg:col-span-3">
          {simRes ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#101725] p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md">
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5 break-keep"><TrendingUp size={12}/> 예상 ROI 배수</p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400">{simRes.roi_multiplier}</p>
                </div>
                <div className="bg-[#101725] p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md">
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5 break-keep"><Users size={12}/> 일자리 창출</p>
                  <p className="text-2xl sm:text-3xl font-black text-blue-400">{simRes.job_creation}</p>
                </div>
              </div>
              
              <div className="bg-[#101725] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-lg">
                <h4 className="text-xs font-bold text-slate-300 mb-6 flex items-center gap-2 tracking-widest uppercase"><BarChart3 size={16} className="text-blue-400"/> 산업별 파급 효과 (Impact Index)</h4>
                <div className="space-y-4">
                  {chartData.map((d, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-400">{d.label}</span>
                        <span style={{color: d.color}}>{d.value} pts</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${(d.value / maxVal) * 100}%` }} 
                          transition={{ duration: 1, delay: i * 0.1, type: 'spring' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: d.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-900/10 p-4 sm:p-5 rounded-2xl border border-blue-500/20 shadow-inner">
                <h4 className="text-[10px] font-bold text-blue-400 mb-2 flex items-center gap-1.5 uppercase tracking-widest"><BrainCircuit size={14}/> AI Policy Recommendation</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{simRes.ai_recommendation}</p>
                <div className="mt-4 pt-4 border-t border-blue-500/20 grid grid-cols-2 gap-3 text-[10px]">
                  <div>
                    <span className="text-blue-400 font-bold block mb-0.5">Boost Sector</span> 
                    <span className="text-slate-300">{simRes.sector_boost}</span>
                  </div>
                  <div>
                    <span className="text-rose-400 font-bold block mb-0.5 flex items-center gap-1"><X size={10}/> Warning</span> 
                    <span className="text-slate-300 break-keep">{simRes.vulnerability_warning}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-slate-500 gap-3 p-4 text-center">
              <Layers size={40} className="opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">No Simulation Data</p>
              <p className="text-[10px] break-keep">타겟과 예산을 설정하고 Run을 클릭하세요.</p>
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

function ReportModal({ onClose, locationPath, userContext }) {
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(true);

  const isB2B = userContext?.industry && userContext?.industry !== '공공';
  const industryName = userContext?.industry || '비즈니스';

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/dashboard/report?path=${locationPath}&industry=${userContext?.industry || '공공'}`);
        setReport(res.data.report);
      } catch (err) {
        setReport("리포트를 생성하지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [locationPath, isB2B, userContext?.industry]);

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([report], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = isB2B ? `${industryName}_AI_Report_${new Date().toISOString().split('T')[0]}.txt` : `MDGA_주간_경영_리포트_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0A0F1A]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#101725] w-full max-w-lg max-h-[80vh] rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col relative">
        <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-[#0E1420] rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg text-white ${isB2B ? 'bg-emerald-600' : 'bg-blue-600'}`}><FileText size={18}/></div>
            <h3 className="text-base font-bold text-white uppercase">{isB2B ? `AI ${industryName} 데이터 분석 리포트` : '주간 경영 요약 뉴스레터'}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
        </div>
        <div className="p-5 overflow-y-auto grow custom-scrollbar">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-4">
              <RefreshCw className={`animate-spin ${isB2B ? 'text-emerald-500' : 'text-blue-500'}`} size={32}/>
              <p className="text-sm text-slate-400 font-medium">이번 주 데이터를 분석하여 보고서를 작성 중입니다...</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-medium flex-grow mb-6">
                {report}
              </div>
              <button 
                onClick={handleDownload}
                className={`w-full py-3 border rounded-xl font-bold text-sm transition-colors flex justify-center items-center gap-2 mt-auto shrink-0 ${isB2B ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600 hover:text-white' : 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600 hover:text-white'}`}
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

function WalletModal({ onClose, personalData }) {
  const balance = personalData ? personalData.store.total_value : 0;
  const history = personalData ? personalData.store.entries : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0A0F1A]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#101725] w-full max-w-sm rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none"><Coins size={200} /></div>
        
        <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-[#0E1420] relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg border border-yellow-500/30 shadow-inner"><Coins size={18}/></div>
            <h3 className="text-base font-black text-white tracking-widest">MDGA WALLET</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
        </div>

        <div className="p-6 relative z-10 bg-gradient-to-b from-[#101725] to-[#0A0F1A]">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-center">Total Balance</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">
              {balance.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-yellow-500/50 mt-2">$MDGA</span>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Transaction History</h4>
            {history.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-4">아직 보상 내역이 없습니다.<br/>데이터를 피딩하고 보상을 받으세요!</p>
            ) : (
              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {[...history].reverse().map((e, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#0E1420] p-3 rounded-xl border border-slate-800/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold">{e.timestamp.split(' ')[0]}</span>
                      <span className="text-xs text-slate-300 font-medium">데이터 피딩 보상</span>
                    </div>
                    <div className="text-sm font-black text-emerald-400">
                      +{e.effective_value ? e.effective_value.toLocaleString() : '1,000'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default App;