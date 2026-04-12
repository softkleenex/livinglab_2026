/* eslint-disable */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Radar, Map, Zap, ArrowLeft, Upload, Database, ShieldCheck, Plus, X, Layers, Lock, TrendingUp, BarChart3, PieChart, RefreshCw, Folder, BrainCircuit, Store, Users, Building2, ChevronRight, FileText, Download, Trash2, MapPin, Info, Coins, Mic, ShoppingCart, Target, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReportModal from './components/modals/ReportModal.jsx';
import WalletModal from './components/modals/WalletModal.jsx';
import IngestModal from './components/modals/IngestModal.jsx';
import VoiceRecordModal from './components/modals/VoiceRecordModal.jsx';
import UpgradeModal from './components/modals/UpgradeModal.jsx';
import GovernanceSim from './components/dashboard/GovernanceSim.jsx';
import DigitalTwinMap from './components/dashboard/DigitalTwinMap.jsx';
import PulseChart from './components/dashboard/PulseChart.jsx';
import IoTSensors from './components/dashboard/IoTSensors.jsx';
import MDGACopilot from './components/dashboard/MDGACopilot.jsx';
import DataMarket from './components/dashboard/DataMarket.jsx';
import QuestBoard from './components/dashboard/QuestBoard.jsx';
import AgoraFeed from './components/dashboard/AgoraFeed.jsx';
import LiveTicker from './components/dashboard/LiveTicker.jsx';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
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

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

function LocationSelector({ setMapCenter, setLocGu, setLocDong, setLocStreet }) {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setMapCenter([lat, lng]);
      
      if (lat > 35.86 && lng < 128.61) {
        setLocGu('북구'); setLocDong('산격동'); setLocStreet('연암로 스마트팜 밸리');
      } else if (lat < 35.86 && lng > 128.61) {
        setLocGu('수성구'); setLocDong('두산동'); setLocStreet('수성못 수변상권');
      } else if (lat < 35.85 && lng < 128.55) {
        setLocGu('달서구'); setLocDong('성서동'); setLocStreet('성서산업단지');
      } else {
        setLocGu('중구'); setLocDong('삼덕동'); setLocStreet('동성로');
      }
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

  useEffect(() => {
    if (locDong.includes('산격')) setMapCenter([35.8821, 128.6083]);
    else if (locDong.includes('삼덕') || locStreet.includes('동성')) setMapCenter([35.8655, 128.6015]);
    else if (locDong.includes('두산') || locStreet.includes('수성')) setMapCenter([35.8258, 128.6212]);
    else if (locDong.includes('범어')) setMapCenter([35.8593, 128.6250]);
    else if (locDong.includes('성서')) setMapCenter([35.8451, 128.5085]);
  }, [locDong, locStreet]);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapCenter([lat, lng]);
          // Mock reverse geocoding for presentation based on current location
          setLocGu('수성구');
          setLocDong('범어동');
          setLocStreet('범어네거리');
        },
        () => alert("위치 정보를 가져올 수 없습니다. 브라우저 권한을 확인하세요.")
      );
    }
  };

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
    <div className="min-h-screen bg-[#0A0F1A] text-slate-200 flex items-center justify-center p-4 pb-24 sm:pb-4 selection:bg-blue-500/30 overflow-y-auto">
      <div className="max-w-3xl w-full bg-[#0E1420] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden mt-8 sm:mt-0">
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
                <div key={l.id} onClick={() => setLevelId(l.id)} className={`p-4 rounded-xl border cursor-pointer transition-all ${levelId === l.id ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
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
                    <input required placeholder="예: 요식업, 카페, 도소매, 스마트팜" value={industry} onChange={e=>setIndustry(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white transition-colors" />
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">2. Location Definition</label>
                    <button type="button" onClick={handleLocateMe} className="text-[10px] font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
                      <MapPin size={12}/> 내 위치로 설정
                    </button>
                  </div>
                  
                  <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-700 relative z-0 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', background: '#0A0F1A' }} zoomControl={false}>
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <MapController center={mapCenter} />
                      <LocationSelector setMapCenter={setMapCenter} setLocGu={setLocGu} setLocDong={setLocDong} setLocStreet={setLocStreet} />
                      <Marker position={mapCenter} icon={customMarkerIcon} />
                    </MapContainer>
                    <div className="absolute bottom-4 left-4 z-[400] pointer-events-none">
                       <div className="bg-[#0E1420]/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/50 shadow-xl flex items-center gap-2">
                         <MapPin size={14} className="text-blue-400 animate-bounce"/>
                         <span className="text-[10px] font-bold text-slate-300">지도를 클릭하면 아래 텍스트가 자동 완성됩니다.</span>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <input required placeholder="구 (예: 북구)" value={locGu} onChange={e=>setLocGu(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white transition-colors" />
                    </div>
                    {(levelId === 'store' || levelId === 'street' || levelId === 'dong') && (
                      <div className="relative group">
                        <input required placeholder="동 (예: 산격동)" value={locDong} onChange={e=>setLocDong(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white transition-colors" />
                      </div>
                    )}
                    {(levelId === 'store' || levelId === 'street') && (
                      <div className="relative group col-span-2 sm:col-span-1">
                        <input required={levelId==='store' || levelId==='street'} placeholder="거리/상권 (예: 연암로 스마트팜 밸리)" value={locStreet} onChange={e=>setLocStreet(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white transition-colors" />
                      </div>
                    )}
                    {levelId === 'store' && (
                      <div className="relative group col-span-2 sm:col-span-1">
                        <input required placeholder="매장명 (예: 지니스팜 제1농장)" value={locStore} onChange={e=>setLocStore(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" disabled={!levelId || loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-sm shadow-[0_5px_15px_rgba(37,99,235,0.3)] hover:scale-[1.01] hover:shadow-[0_5px_20px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex justify-center items-center gap-2 uppercase tracking-widest mt-8">
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
  const [showVoice, setShowVoice] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
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

  const handleExportCSV = async () => {
    addToast("CSV 데이터 다운로드를 시작합니다...", "info");
    try {
      const pathStr = userContext.location.join('/');
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/export?path=${pathStr}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MDGA_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast("성공적으로 다운로드되었습니다.", "success");
    } catch(err) {
      addToast("CSV 다운로드 중 오류가 발생했습니다.", "error");
    }
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
            <span className="text-sm font-black text-white tracking-wider flex items-center gap-2">
              MDGA
              {!googleUser?.isGuest && (
                <button onClick={() => setShowUpgrade(true)} className="text-[9px] bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2 py-0.5 rounded text-white font-bold uppercase tracking-widest shadow-md shadow-violet-500/30 hover:scale-105 transition-transform">
                  Upgrade
                </button>
              )}
            </span>
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

        {/* Live Network Ticker */}
        <LiveTicker />

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
                          <div className="absolute inset-x-0 bottom-0"><PulseChart data={personalData.store.history.map(v => v * 1.2)} color="#10b981" title="AI Forecast" subtitle="Growth trajectory" /></div>
                        </div>
                        <p className="text-[10px] text-emerald-500 mt-2 font-bold flex items-center gap-1">업계 트렌드 및 기상/환경 분석 완료</p>
                      </div>
                    </div>
                    
                    <IoTSensors industry={userContext.industry} />
                    
                    <div className="bg-[#101725] p-6 rounded-2xl border border-slate-800 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Layers size={14} className="text-blue-500" /> 데이터 통합 연동 (Data Hub)
                        </h3>
                        <Badge label="BETA" color="bg-orange-500/10 text-orange-400 border-orange-500/20" />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-xl transition-all cursor-pointer">
                          <FileText size={24} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-300">현장/수기 일지 연동</span>
                          <span className="text-[9px] text-slate-500">사진/텍스트 추출</span>
                        </button>
                        <button onClick={() => setShowVoice(true)} className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-900/10 hover:bg-blue-900/20 border border-blue-900/30 hover:border-blue-500/50 rounded-xl transition-all cursor-pointer group relative overflow-hidden">
                          <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 animate-pulse"></div>
                          <Mic size={24} className="text-blue-400 relative z-10" />
                          <span className="text-xs font-bold text-blue-300 relative z-10">AI 음성 기록 (STT)</span>
                          <span className="text-[9px] text-blue-500/70 relative z-10">말로 하는 현장 기록</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-xl transition-all cursor-pointer">
                          <Users size={24} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-300">주문/플랫폼 연동</span>
                          <span className="text-[9px] text-slate-500">일별 주문/예약 연동</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-xl transition-all cursor-pointer">
                          <Upload size={24} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-300">외부 API 연동</span>
                          <span className="text-[9px] text-slate-500">물류/택배 상태 수집</span>
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
                        <div className="w-full mt-4"><PulseChart data={personalData.store.history} color="#3b82f6" title="Store Pulse" subtitle="BPM tracking" /></div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">상권 평균: {personalData.parent.pulse} BPM</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Consultings (보상)</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={handleExportCSV} className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors uppercase">
                        <Download size={12} /> CSV 다운로드
                      </button>
                      <button onClick={() => setShowReport(true)} className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-colors uppercase">
                        <FileText size={12} /> 주간 리포트 발행
                      </button>
                    </div>
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
                      <button onClick={goBack} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors text-slate-300 shadow-md"><ArrowLeft size={20} /></button>
                    )}
                    <div className="flex flex-col">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-400 mb-1">
                        <button onClick={() => setCurrentPath([])} className="hover:text-blue-400 transition-colors flex items-center gap-1"><MapPin size={10}/> 대구광역시</button>
                        {currentPath.map((p, idx) => (
                          <React.Fragment key={idx}>
                            <ChevronRight size={12} className="text-slate-600" />
                            <button onClick={() => setCurrentPath(currentPath.slice(0, idx + 1))} className="hover:text-blue-400 transition-colors">{p}</button>
                          </React.Fragment>
                        ))}
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-white uppercase break-keep leading-tight">{explorerData.current}</h2>
                    </div>
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
                    <DigitalTwinMap childrenData={explorerData.children} onMarkerClick={navigateTo} />

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
                            <div className="hidden sm:flex flex-col items-end gap-1 mt-2 mr-4 border-r border-slate-800 pr-4">
                                <p className="text-[10px] text-slate-500 font-bold">ASSET VALUE</p>
                                <p className="text-xs font-bold text-yellow-400 font-mono tracking-widest">₩{(child.value || 0).toLocaleString()}</p>
                            </div>
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
            ) : activeTab === 'market' ? (
              <DataMarket addToast={addToast} />
            ) : activeTab === 'quest' ? (
              <QuestBoard addToast={addToast} />
            ) : activeTab === 'agora' ? (
              <AgoraFeed addToast={addToast} />
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
        <BottomNavLink icon={<ShoppingCart size={20}/>} label="마켓" active={activeTab === 'market' && !showIngest} onClick={()=>{setActiveTab('market'); setShowIngest(false);}} />
        <BottomNavLink icon={<MessageSquare size={20}/>} label="아고라" active={activeTab === 'agora' && !showIngest} onClick={()=>{setActiveTab('agora'); setShowIngest(false);}} />
        {userContext.role === 'store' && (
          <BottomNavLink icon={<Target size={20}/>} label="퀘스트" active={activeTab === 'quest' && !showIngest} onClick={()=>{setActiveTab('quest'); setShowIngest(false);}} />
        )}
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
        {showVoice && (
          <VoiceRecordModal
            isGuest={googleUser?.isGuest}
            onClose={() => setShowVoice(false)}
            onSuccess={() => {
              setShowVoice(false);
              addToast("성공적으로 음성이 텍스트로 기록 및 자산화되었습니다.", "success");
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
            addToast={addToast}
          />
        )}
        {showUpgrade && (
          <UpgradeModal
            onClose={() => setShowUpgrade(false)}
            addToast={addToast}
          />
        )}
      </AnimatePresence>

      {/* Floating AI Copilot */}
      <MDGACopilot locationPath={userContext.location.join('/')} industry={userContext.industry} />

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



export default App;