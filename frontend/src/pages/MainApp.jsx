import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Map, Zap, Store, FileJson, Camera, CloudRain, ShoppingCart, MessageSquare, Info, ShieldCheck, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Modals
import ReportModal from '../components/modals/ReportModal.jsx';
import IngestModal from '../components/modals/IngestModal.jsx';
import VoiceRecordModal from '../components/modals/VoiceRecordModal.jsx';

// Dashboards (4 Core Features)
import TwinMapSharing from '../components/dashboard/TwinMapSharing.jsx';
import DataConverter from '../components/dashboard/DataConverter.jsx';
import B2BMarket from '../components/dashboard/B2BMarket.jsx';
import SynthesisInsight from '../components/dashboard/SynthesisInsight.jsx';

import MDGACopilot from '../components/dashboard/MDGACopilot.jsx';
import LiveTicker from '../components/dashboard/LiveTicker.jsx';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

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

export default function MainApp({ userContext, googleUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('converter');
  const [showIngest, setShowIngest] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const addToast = (message, type = 'info') => {
    const newNotif = { id: Date.now(), message, type };
    setNotifications(prev => [newNotif, ...prev].slice(0, 3));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 4000);
  };

  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use((config) => {
      if (googleUser?.rawToken) {
        config.headers.Authorization = `Bearer ${googleUser.rawToken}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    });
    return () => axios.interceptors.request.eject(reqInterceptor);
  }, [googleUser]);

  return (
    <div className="flex h-[100dvh] w-full bg-[#05080F] text-slate-200 overflow-hidden font-sans antialiased justify-center selection:bg-blue-500/30">
      <div className="w-full max-w-[480px] bg-[#0A0F1A] h-full flex flex-col relative border-x border-slate-800/60 shadow-2xl">
        {/* Header */}
        <header className="h-14 shrink-0 border-b border-slate-800/80 bg-[#0A0F1A]/95 backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg shadow-md"><Zap size={16} className="text-white"/></div>
            <span className="text-sm font-black text-white tracking-wider flex items-center gap-2">
              농업 AX Platform
            </span>
          </div>
          <div className="flex items-center gap-3">
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

        <LiveTicker />

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 pb-24 scroll-smooth">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full items-center justify-center">
                <RefreshCw size={28} className="text-blue-600 animate-spin" />
              </motion.div>
            ) : activeTab === 'converter' ? (
              <DataConverter userContext={userContext} addToast={addToast} openIngest={() => setShowIngest(true)} openVoice={() => setShowVoice(true)} />
            ) : activeTab === 'map' ? (
              <TwinMapSharing userContext={userContext} addToast={addToast} />
            ) : activeTab === 'b2b' ? (
              <B2BMarket userContext={userContext} addToast={addToast} />
            ) : activeTab === 'insight' ? (
              <SynthesisInsight userContext={userContext} addToast={addToast} />
            ) : null}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <nav className="flex items-center justify-around bg-[#0E1420]/95 backdrop-blur-lg border-t border-slate-800/80 h-16 shrink-0 pb-safe z-50 absolute bottom-0 left-0 right-0 w-full">
          <BottomNavLink icon={<FileJson size={20}/>} label="데이터변환" active={activeTab === 'converter'} onClick={() => setActiveTab('converter')} />
          <BottomNavLink icon={<Map size={20}/>} label="트윈 맵" active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
          
          <BottomNavLink icon={<Camera size={20}/>} label="기록" special active={showIngest} onClick={() => setShowIngest(true)} />
          
          <BottomNavLink icon={<ShoppingCart size={20}/>} label="합성데이터 마켓" active={activeTab === 'b2b'} onClick={() => setActiveTab('b2b')} />
          <BottomNavLink icon={<CloudRain size={20}/>} label="농업AX" active={activeTab === 'insight'} onClick={() => setActiveTab('insight')} />
        </nav>

        {/* Modals */}
        <AnimatePresence>
          {showIngest && (
            <IngestModal
              isGuest={googleUser?.isGuest}
              onClose={() => setShowIngest(false)}
              onSuccess={() => {
                setShowIngest(false);
                addToast("성공적으로 데이터가 기록되었습니다.", "success");
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
              }}
              locationPath={userContext.location.join('/')}
              addToast={addToast}
            />
          )}
        </AnimatePresence>

        {/* AI Copilot */}
        <MDGACopilot 
          locationPath={userContext.location.join('/')} 
          industry={userContext.industry} 
          entries={[]}
        />

        {/* Toasts */}
        <div className="fixed top-16 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50 pointer-events-none flex flex-col gap-2">
          <AnimatePresence>
            {notifications.map(notif => {
              let bgColor = "bg-blue-600/90 shadow-blue-900/30 border-blue-500/50";
              let Icon = Zap;
              if (notif.type === 'success') { bgColor = "bg-emerald-600/90 shadow-emerald-900/30 border-emerald-500/50"; Icon = ShieldCheck; } 
              else if (notif.type === 'error') { bgColor = "bg-rose-600/90 shadow-rose-900/30 border-rose-500/50"; Icon = X; } 
              else if (notif.type === 'info') { bgColor = "bg-slate-800/90 shadow-slate-900/30 border-slate-700/50"; Icon = Info; }
              return (
                <motion.div key={notif.id} initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={`${bgColor} border backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3`}>
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
