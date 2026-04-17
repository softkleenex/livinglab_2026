import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Radar, Map, Store, Users, Building2, ShieldCheck, Plus, RefreshCw, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com';

const LEVELS = [
 { id: 'store', role: 'store', name: '사업장 (Store)', icon: <Store size={24}/>, desc: '매출, 현황, 리뷰 등 내 사업장 데이터' },
 { id: 'street', role: 'leader', name: '거리 (Street)', icon: <Map size={24}/>, desc: '해당 거리 내 사업자들의 취합 데이터' },
 { id: 'dong', role: 'leader', name: '동 (Dong)', icon: <Users size={24}/>, desc: '거리 데이터들의 집합 (동 단위 트렌드)' },
 { id: 'gu', role: 'gov', name: '구 (Gu)', icon: <Building2 size={24}/>, desc: '동 데이터들의 집합 (구별 산업 특성)' }
];

const customMarkerIcon = new L.DivIcon({
 className: 'custom-leaflet-icon',
 html: `<div style="color: #3b82f6; filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#0A0F1A" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="#3b82f6"/></svg></div>`,
 iconSize: [36, 36],
 iconAnchor: [18, 36],
});

const reverseGeocode = async (lat, lng) => {
  try {
    const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const addr = res.data.address;
    if(!addr) throw new Error();
    return {
      gu: addr.city || addr.county || addr.town || '알수없는 구',
      dong: addr.suburb || addr.neighbourhood || addr.village || '알수없는 동',
      street: addr.road || '알수없는 거리',
      name: addr.building || addr.shop || addr.amenity || '새로운 사업장',
      industry: 'IT/서비스'
    };
  } catch(e) {
    return { gu: '미분류 구', dong: '미분류 동', street: '미분류 거리', name: '신규 사업장', industry: '기타' };
  }
};

function MapController({ center }) {
 const map = useMap();
 useEffect(() => {
 map.flyTo(center, 14, { animate: true, duration: 1.5 });
 }, [center, map]);
 return null;
}

function LocationSelector({ setMapCenter, setLocGu, setLocDong, setLocStreet, setLocStore, setIndustry }) {
  const map = useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setMapCenter([lat, lng]);
      
      const addr = await reverseGeocode(lat, lng);
      setLocGu(addr.gu);
      setLocDong(addr.dong);
      setLocStreet(addr.street);
      setLocStore(addr.name);
      setIndustry(addr.industry);
    }
  });
  return null;
}

export default function Onboarding({ onComplete, googleUser }) {
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
 const [showAllStores, setShowAllStores] = useState(false);
 const [allStoresList, setAllStoresList] = useState([]);
 const [loadingAllStores, setLoadingAllStores] = useState(false);

 useEffect(() => {
   const loadAllStores = async () => {
     try {
       const res = await axios.get(`${API_BASE_URL}/api/stores/all`);
       setAllStoresList(res.data.stores || []);
     } catch (e) {
       console.error("Failed to fetch all stores for combobox", e);
     }
   };
   loadAllStores();
 }, []);

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
 }, [locGu, locDong, locStreet, levelId, locStore]);

 useEffect(() => {
 if (locDong.includes('산격')) setMapCenter([35.8821, 128.6083]);
 else if (locDong.includes('삼덕') || locStreet.includes('동성')) setMapCenter([35.8655, 128.6015]);
 else if (locDong.includes('두산') || locStreet.includes('수성')) setMapCenter([35.8258, 128.6212]);
 else if (locDong.includes('범어')) setMapCenter([35.8593, 128.6250]);
 else if (locDong.includes('성서')) setMapCenter([35.8451, 128.5085]);
 }, [locDong, locStreet]);

 const handleFetchAllStores = async () => {
   if (showAllStores) { setShowAllStores(false); return; }
   setShowAllStores(true);
   setLoadingAllStores(true);
   try {
     const res = await axios.get(`${API_BASE_URL}/api/stores/all`);
     setAllStoresList(res.data.stores || []);
   } catch(e) {
     alert("데이터를 불러오지 못했습니다: " + e.message);
   } finally {
     setLoadingAllStores(false);
   }
 };

 const handleLocateMe = () => {
 if (navigator.geolocation) {
 navigator.geolocation.getCurrentPosition(
 async (position) => {
 const lat = position.coords.latitude;
 const lng = position.coords.longitude;
 setMapCenter([lat, lng]); 
 const addr = await reverseGeocode(lat, lng);
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
 alert('서버 연결 실패: ' + (err.response?.data?.detail || err.message));
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
 <input required list="gu-list" placeholder="직접입력 (또는 아래 목록 선택)" value={locGu} onChange={e=>setLocGu(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 outline-none text-white" />
 <datalist id="gu-list">
  {[...new Set(allStoresList.map(s => s.gu).filter(Boolean))].map(g => <option key={g} value={g} />)}
 </datalist>
  <datalist id="gu-list">
    {[...new Set(allStoresList.map(s => s.gu).filter(Boolean))].map(g => <option key={g} value={g} />)}
  </datalist>
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
 <input required={(levelId === 'store' || levelId === 'street' || levelId === 'dong')} list="dong-list" placeholder="직접입력 (또는 아래 목록 선택)" value={locDong} onChange={e=>setLocDong(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-emerald-500 outline-none text-white" />
 <datalist id="dong-list">
  {[...new Set(allStoresList.filter(s => !locGu || s.gu === locGu).map(s => s.dong).filter(Boolean))].map(d => <option key={d} value={d} />)}
 </datalist>
  <datalist id="dong-list">
    {[...new Set(allStoresList.filter(s => !locGu || s.gu === locGu).map(s => s.dong).filter(Boolean))].map(d => <option key={d} value={d} />)}
  </datalist>
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
 <input required={levelId==='store' || levelId==='street'} list="street-list" placeholder="직접입력 (또는 아래 목록 선택)" value={locStreet} onChange={e=>setLocStreet(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-rose-500 outline-none text-white" />
 <datalist id="street-list">
  {[...new Set(allStoresList.filter(s => (!locGu || s.gu === locGu) && (!locDong || s.dong === locDong)).map(s => s.street).filter(Boolean))].map(str => <option key={str} value={str} />)}
 </datalist>
  <datalist id="street-list">
    {[...new Set(allStoresList.filter(s => (!locGu || s.gu === locGu) && (!locDong || s.dong === locDong)).map(s => s.street).filter(Boolean))].map(str => <option key={str} value={str} />)}
  </datalist>
 </div>
 </div>
 )}
 
 {/* STORE Level */}
 {levelId === 'store' && (
 <div className="col-span-2 space-y-3 pt-2 border-t border-slate-800/60">
 <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5"><Store size={12}/> 사업장 선택 및 신규 등록</label>
 
 {existingStores.length > 0 && (
 <div className="flex flex-wrap gap-2">
 {existingStores.map(store => (
 <button 
 key={store} 
 type="button"
 onClick={() => { setLocStore(store); setIsNewStore(false); }}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${locStore === store && !isNewStore ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'}`}
 >
 {store}
 </button>
 ))}
 <button 
 type="button"
 onClick={() => { setLocStore(''); setIsNewStore(true); }}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold border border-dashed transition-all ${isNewStore ? 'bg-blue-600/20 text-blue-400 border-blue-500' : 'border-slate-600 text-slate-500 hover:text-slate-300'}`}
 >
 <Plus size={12} className="inline mr-1"/> 신규 등록
 </button>
 </div>
 )}
 
 {(existingStores.length === 0 || isNewStore) && (
 <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="relative group">
 <input required list="store-list" placeholder="기존 사업장 검색 또는 새로운 이름 입력" value={locStore} onChange={e=>{setLocStore(e.target.value); setIsNewStore(true);}} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" />
 <datalist id="store-list">
  {allStoresList.filter(s => (!locStreet || s.street === locStreet)).map(s => <option key={s.name} value={s.name} />)}
 </datalist>
  <datalist id="store-list">
    {allStoresList.filter(s => (!locStreet || s.street === locStreet)).map(s => <option key={s.name} value={s.name} />)}
  </datalist>
 </motion.div>
 )}
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

 <div className="mt-4 pt-4 border-t border-slate-800/60">
    <button type="button" onClick={handleFetchAllStores} className="w-full py-3 bg-slate-800/50 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors flex justify-center items-center gap-2">
       {showAllStores ? "목록 닫기" : "기존에 등록된 모든 객체(사업장) 찾아보기"}
    </button>

    <AnimatePresence>
      {showAllStores && (
        <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
           {loadingAllStores ? (
              <div className="p-4 text-center text-xs text-slate-500 flex justify-center items-center gap-2">
                 <RefreshCw size={14} className="animate-spin" /> 데이터를 불러오는 중...
              </div>
           ) : allStoresList.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">등록된 객체가 없습니다.</div>
           ) : (
              allStoresList.map((s, idx) => (
                 <div key={idx} onClick={() => {
                    setLevelId('store');
                    setLocGu(s.gu); setLocDong(s.dong); setLocStreet(s.street); setLocStore(s.name); setIndustry(s.industry);
                    setShowAllStores(false);
                 }} className="p-3 bg-[#101725] border border-slate-800 hover:border-blue-500/50 rounded-xl cursor-pointer transition-colors group">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{s.name}</span>
                       <span className="text-[9px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md">{s.industry}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{s.gu} &gt; {s.dong} &gt; {s.street}</div>
                 </div>
              ))
           )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  </form> </div>
 </div>
 );
}
