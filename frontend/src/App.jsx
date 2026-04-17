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
import PersonalDashboard from './components/dashboard/PersonalDashboard.jsx';
import ExplorerDashboard from './components/dashboard/ExplorerDashboard.jsx';
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
 { id: 'store', role: 'store', name: '사업장 (Store)', icon: <Store size={24}/>, desc: '매출, 현황, 리뷰 등 내 사업장 데이터' },
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

function LocationSelector({ setMapCenter, setLocGu, setLocDong, setLocStreet, setLocStore }) {
 useMapEvents({
 click(e) {
 const lat = e.latlng.lat;
 const lng = e.latlng.lng;
 setMapCenter([lat, lng]);
 
 const addr = getMockAddress(lat, lng);
 setLocGu(addr.gu);
 setLocDong(addr.dong);
 setLocStreet(addr.street);
 setLocStore(addr.name);
 setIndustry(addr.industry);
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
 const [existingStores, setExistingStores] = useState([]);
 const [isNewStore, setIsNewStore] = useState(false);

 useEffect(() => {
 const fetchStores = async () => {
 if (levelId === 'store' && locGu && locDong && locStreet) {
 try {
 const pathStr = `${locGu}/${locDong}/${locStreet}`;
 const res = await axios.get(`${API_BASE_URL}/api/hierarchy/explore?path=${pathStr}`);
 if (res.data && res.data.children) {
 setExistingStores(res.data.children.map(c => c.name));
 if (!res.data.children.find(c => c.name === locStore)) {
 setLocStore('');
 }
 }
 } catch (e) {
 setExistingStores([]);
 }
 } else {
 setExistingStores([]);
 }
 };
 // Debounce slightly
 const timer = setTimeout(fetchStores, 500);
 return () => clearTimeout(timer);
 }, [locGu, locDong, locStreet, levelId]);

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
 const addr = getMockAddress(lat, lng);
 setMapCenter([addr.lat, addr.lng]); // Snap exactly to the nearest store
 setLocGu(addr.gu);
 setLocDong(addr.dong);
 setLocStreet(addr.street);
 setLocStore(addr.name);
 setIndustry(addr.industry);
 },
 () => alert("위치 정보를 가져올 수 없습니다. 브라우저 설정에서 위치 권한을 허용해주세요.")
 );
 } else {
 alert("Geolocation이 지원되지 않는 브라우저입니다.");
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!levelId) return alert('객체 단위를 선택해주세요.');
 
 const selectedLevel = LEVELS.find(l => l.id === levelId);
 let location = []; if (locGu) location.push(locGu);
 if ((levelId === 'dong' || levelId === 'street' || levelId === 'store') && locDong) location.push(locDong);
 if ((levelId === 'street' || levelId === 'store') && locStreet) location.push(locStreet);
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
 <div className="h-[100dvh] bg-[#0A0F1A] text-slate-200 flex flex-col items-center justify-start p-4 pb-24 selection:bg-blue-500/30 overflow-y-auto mx-auto w-full max-w-md relative border-x border-slate-800">
 <div className="w-full bg-[#0E1420] border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden mt-4 shrink-0">
 <div className="absolute top-0 right-0 p-8 opacity-5"><Radar size={200}/></div>
 <h1 className="text-3xl font-black text-white mb-2 relative z-10">MDGA Context Setup</h1>
 <p className="text-slate-400 mb-8 relative z-10 text-[11px] leading-relaxed break-keep">
 {levelId === 'store' ? (
   !googleUser?.isGuest ? (
     <span className="text-emerald-400 font-bold">✨ 구글 인증 사업장(Store) 모드입니다. 데이터 피딩 시 신뢰도 보너스가 적용됩니다.</span>
   ) : (
     <span className="text-orange-400 font-bold">⚠️ 게스트 모드로 진입 중입니다. 사업장(Store) 피딩 시 신뢰도 패널티가 적용됩니다.</span>
   )
 ) : levelId ? (
   <span className="text-blue-400 font-bold">🏢 {LEVELS.find(l => l.id === levelId)?.name.split(' ')[0]} 관리자/정책 담당자 모드로 진입 중입니다. 관할 구역 데이터를 조회합니다.</span>
 ) : (
   <span className="text-slate-400 font-bold">🎯 본인의 페르소나(객체 단위)를 먼저 선택해 주세요.</span>
 )}
 </p>
 
 <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
 <div className="space-y-4">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">1. Select Target Object</label>
 <div className="grid grid-cols-1 gap-4">
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
 <input required placeholder="예: 스마트팜, 제조업, IT서비스, 요식업" value={industry} onChange={e=>setIndustry(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white transition-colors" />
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
 <LocationSelector setMapCenter={setMapCenter} setLocGu={setLocGu} setLocDong={setLocDong} setLocStreet={setLocStreet} setLocStore={setLocStore} setIndustry={setIndustry} />
 <Marker position={mapCenter} icon={customMarkerIcon} />
 </MapContainer>
 <div className="absolute bottom-4 left-4 z-[400] pointer-events-none">
 <div className="bg-[#0E1420]/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/50 shadow-xl flex items-center gap-2">
 <MapPin size={14} className="text-blue-400 animate-bounce"/>
 <span className="text-[10px] font-bold text-slate-300">지도를 클릭하면 아래 텍스트가 자동 완성됩니다.</span>
 </div>
 </div>
 </div>

 {/* Dynamic Location Selection UX */}
 <div className="space-y-4 pt-4 border-t border-slate-800/60">
 {/* GU Level */}
 {(levelId === 'gu' || levelId === 'dong' || levelId === 'street' || levelId === 'store') && (
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
 <MapPin size={12} className="text-blue-500"/> 자치구 (Gu)
 </label>
 <div className="flex flex-wrap gap-2 items-center">
 <input required placeholder="직접입력" value={locGu} onChange={e=>setLocGu(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 outline-none text-white" />
 </div>
 </div>
 )}

 {/* DONG Level */}
 {(levelId === 'dong' || levelId === 'street' || levelId === 'store') && (
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
 <MapPin size={12} className="text-emerald-500"/> 행정동 (Dong)
 </label>
 <div className="flex flex-wrap gap-2 items-center">
 <input required={(levelId === 'store' || levelId === 'street' || levelId === 'dong')} placeholder="직접입력" value={locDong} onChange={e=>setLocDong(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-emerald-500 outline-none text-white" />
 </div>
 </div>
 )}

 {/* STREET Level */}
 {(levelId === 'street' || levelId === 'store') && (
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
 <MapPin size={12} className="text-rose-500"/> 거리/상권 (Street)
 </label>
 <div className="flex flex-wrap gap-2 items-center">
 <input required={levelId==='store' || levelId==='street'} placeholder="직접입력" value={locStreet} onChange={e=>setLocStreet(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-rose-500 outline-none text-white" />
 </div>
 </div>
 )}
 
 {/* STORE Level */}
 {levelId === 'store' && (
 <div className="space-y-2 pt-2 border-t border-slate-800/60">
 <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5"><Store size={12}/> 사업장 (Store)</label>
 <input required placeholder="새로운 사업장/농장 이름을 입력하세요" value={locStore} onChange={e=>setLocStore(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" />
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
 const [currentPath, setCurrentPath] = useState(userContext.role === 'store' ? userContext.location.slice(0, -1) : userContext.location);
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
 const pathStr = currentPath.join('/');
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
 addToast("내 사업장 데이터를 불러오는데 실패했습니다.", 'error');
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
 const res = await axios.get(`${API_BASE_URL}/api/dashboard/export?path=${pathStr}&industry=${encodeURIComponent(userContext.industry || '공공')}`, { responseType: 'blob' });
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
 alert("현재 데이터 통합 연동은 베타 테스트 중입니다. B2B 스마트팜, 첨단제조업 등 사전 준비된 산업체 계정으로 전환(글로벌 파트너사 목록에서 빠른 이동)하여 진행해 주십시오.");
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
 <span className="text-[10px] font-bold uppercase tracking-wider hidden ">$MDGA</span>
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
 <div className="flex-1 overflow-y-auto p-4 pb-24 scroll-smooth">
 <AnimatePresence mode="wait">
 {loading ? (
 <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full items-center justify-center">
 <RefreshCw size={28} className="text-blue-600 animate-spin" />
 </motion.div>
 ) : activeTab === 'personal' && personalData ? (
 <PersonalDashboard 
 personalData={personalData} 
 userContext={userContext} 
 handleExportCSV={handleExportCSV} 
 setShowReport={setShowReport} 
 handleDeleteEntry={handleDeleteEntry} 
 handleDemoInject={handleDemoInject} 
 />
 ) : activeTab === 'explorer' && explorerData ? (
 <ExplorerDashboard
 explorerData={explorerData}
 currentPath={currentPath}
 goBack={goBack}
 setCurrentPath={setCurrentPath}
 navigateTo={navigateTo}
 />
 ) : activeTab === 'governance' ? (
 <GovernanceSim explorerData={explorerData} />
 ) : activeTab === 'market' ? (
 <DataMarket addToast={addToast} userContext={userContext} />
 ) : activeTab === 'quest' ? (
 <QuestBoard addToast={addToast} userContext={userContext} />
 ) : activeTab === 'agora' ? (
 <AgoraFeed addToast={addToast} userContext={userContext} />
 ) : null}
 </AnimatePresence>
 </div>
 </main>

 {/* Bottom Nav (App-like for all views) */}
 <nav className="flex items-center justify-around bg-[#0E1420]/95 backdrop-blur-lg border-t border-slate-800/80 h-16 shrink-0 pb-safe z-50 absolute bottom-0 left-0 right-0 w-full">
 {userContext.role === 'store' && (
 <BottomNavLink icon={<Store size={20}/>} label="내 사업장" active={activeTab === 'personal' && !showIngest} onClick={()=>{setActiveTab('personal'); setShowIngest(false);}} />
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
 addToast={addToast}
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
 addToast={addToast}
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
 <p className="text-xl font-bold text-white tracking-tight truncate">{value}</p>
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