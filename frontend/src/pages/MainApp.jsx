import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
 Radar, Map, Zap, X, ShieldCheck, Store, Coins, ShoppingCart, Target, MessageSquare, BarChart3, RefreshCw, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReportModal from '../components/modals/ReportModal.jsx';
import WalletModal from '../components/modals/WalletModal.jsx';
import IngestModal from '../components/modals/IngestModal.jsx';
import VoiceRecordModal from '../components/modals/VoiceRecordModal.jsx';
import UpgradeModal from '../components/modals/UpgradeModal.jsx';
import GovernanceSim from '../components/dashboard/GovernanceSim.jsx';
import MDGACopilot from '../components/dashboard/MDGACopilot.jsx';
import DataMarket from '../components/dashboard/DataMarket.jsx';
import QuestBoard from '../components/dashboard/QuestBoard.jsx';
import AgoraFeed from '../components/dashboard/AgoraFeed.jsx';
import LiveTicker from '../components/dashboard/LiveTicker.jsx';
import PersonalDashboard from '../components/dashboard/PersonalDashboard.jsx';
import ExplorerDashboard from '../components/dashboard/ExplorerDashboard.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com';

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

export default function MainApp({ userContext, googleUser, onLogout }) {
 const [currentPath, setCurrentPath] = useState(userContext.role === 'store' ? userContext.location.slice(0, -1) : userContext.location);
 const [explorerData, setExplorerData] = useState(null);
 const [personalData, setPersonalData] = useState(null);
 const [loading, setLoading] = useState(true);
 
 const defaultTab = userContext.role === 'store' ? 'personal' : 'explorer';
 const [activeTab, setActiveTab] = useState(defaultTab);
 const [walletBalance, setWalletBalance] = useState(0);

 const [showIngest, setShowIngest] = useState(false); const [showReport, setShowReport] = useState(false);
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

 const wsTimeoutRef = useRef(null);

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
       addToast(`${storeName}에서 데이터 갱신 (${data.value_added > 0 ? '+' : ''}₩${data.value_added.toLocaleString()})`, 'info');

       // Thundering herd prevention (Debounce with jitter)
       if (wsTimeoutRef.current) clearTimeout(wsTimeoutRef.current);
       wsTimeoutRef.current = setTimeout(() => {
         if (activeTab === 'personal' && userContext.role === 'store') {
           fetchPersonal();
         } else if (activeTab === 'explorer') {
           fetchExplorer();
         }
       }, 1500 + Math.random() * 1000);
     }
   };

   return () => {
       ws.close();
       if (wsTimeoutRef.current) clearTimeout(wsTimeoutRef.current);
   };
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

 useEffect(() => {
   if (googleUser?.rawToken) {
     axios.interceptors.request.use((config) => {
       config.headers.Authorization = `Bearer ${googleUser.rawToken}`;
       return config;
     });
   } else {
     axios.interceptors.request.use((config) => {
       config.headers.Authorization = `Bearer mock-jwt-token`;
       return config;
     });
   }
 }, [googleUser]);

 const fetchPersonal = React.useCallback(async () => { setLoading(true);
 try {
 const pathStr = userContext.location.join('/');
 const res = await axios.get(`${API_BASE_URL}/api/dashboard/personal?path=${pathStr}`);
 setPersonalData(res.data);
 if (res.data.store?.wallet_balance !== undefined) {
 setWalletBalance(res.data.store.wallet_balance);
 }
 } catch (err) {
 setPersonalData(null);
 addToast("내 사업장 데이터를 불러오는데 실패했습니다.", 'error');
 } finally {
 setLoading(false);
 }
 }, [userContext.location, addToast]);

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

 const handleDeleteStore = async () => {
 if(!window.confirm("이 사업장(객체)을 완전히 삭제하시겠습니까? 모든 데이터와 구글 드라이브 증빙 자료가 영구 삭제되며 복구할 수 없습니다.")) return;
 try {
 const pathStr = userContext.location.join('/');
 await axios.delete(`${API_BASE_URL}/api/ingest/store?path=${pathStr}`);
 addToast("사업장이 성공적으로 삭제되었습니다.", "info");
 setTimeout(() => onLogout(), 1500);
 } catch(err) {
 addToast("사업장 삭제 중 오류가 발생했습니다.", "error");
 }
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

 const currentEntries = activeTab === 'personal' ? personalData?.store?.entries : explorerData?.entries;

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
 <span className="text-[10px] font-bold uppercase tracking-wider">{walletBalance.toLocaleString()} $MDGA</span>
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
 handleDeleteStore={handleDeleteStore}
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
 <DataMarket addToast={addToast} userContext={userContext} setWalletBalance={setWalletBalance} />
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
 locationPath={activeTab === 'explorer' && currentPath.length > 0 ? currentPath.join('/') : userContext.location.join('/')}
 childOptions={activeTab === 'explorer' && explorerData ? explorerData.children : []}
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
 <MDGACopilot 
   locationPath={userContext.location.join('/')} 
   industry={userContext.industry} 
   entries={currentEntries || []}
   onActionComplete={() => {
     if (activeTab === 'personal') fetchPersonal();
     else fetchExplorer();
   }}
 />

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
