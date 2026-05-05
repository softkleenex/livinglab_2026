import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Radar, Map, Tractor, Users, Building2, ShieldCheck, Plus, RefreshCw, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

const LEVELS = [
 { id: 'farm', role: 'farm', name: '농장/필지 (Farm/Field)', icon: <Tractor size={24}/>, desc: '센서 로그, 생육 현황, 수확량, 영농 일지' }, 
 { id: 'street', role: 'leader', name: '마을/재배지 (Village/Zone)', icon: <Map size={24}/>, desc: '해당 마을 내 농가들의 취합 데이터' },
 { id: 'dong', role: 'leader', name: '읍/면/동 (Eup/Myeon/Dong)', icon: <Users size={24}/>, desc: '마을 데이터들의 집합 (읍/면 단위 트렌드)' },
 { id: 'gu', role: 'gov', name: '시/군/구 (City/Gun/Gu)', icon: <Building2 size={24}/>, desc: '지역 데이터들의 집합 (군 단위 기후 및 생산량)' }
];

const customMarkerIcon = new L.DivIcon({
 className: 'custom-leaflet-icon',
 html: `<div style="color: #10b981; filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.8));"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#0A0F1A" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="#10b981"/></svg></div>`,
 iconSize: [36, 36],
 iconAnchor: [18, 36],
});

const reverseGeocode = async (lat, lng) => {
  try {
    const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const addr = res.data.address;
    if(!addr) throw new Error();
    return {
      gu: addr.city || addr.county || addr.town || '미분류 시군구',
      dong: addr.suburb || addr.neighbourhood || addr.village || '미분류 읍면동',
      street: addr.road || '미분류 마을',
      name: addr.building || addr.amenity || '신규 농장',
      industry: '생산자 (농가/스마트팜)'
    };
  } catch(e) {
    console.error(e);
    return { gu: '미분류 시군구', dong: '미분류 읍면동', street: '미분류 마을', name: '신규 농장', industry: '기타' };
  }
};

function MapController({ center }) {
 const map = useMap();
 useEffect(() => {
 map.flyTo(center, 13, { animate: true, duration: 1.5 });
 }, [center, map]);
 return null;
}

function LocationSelector({ setMapCenter, setLocGu, setLocDong, setLocStreet, setLocFarm, setIndustry }) {
  const map = useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setMapCenter([lat, lng]);
      
      const addr = await reverseGeocode(lat, lng);
      setLocGu(addr.gu);
      setLocDong(addr.dong);
      setLocStreet(addr.street);
      setLocFarm(addr.name);
      setIndustry(addr.industry);
    }
  });
  return null;
}

export default function Onboarding({ onComplete, googleUser }) {
 const [levelId, setLevelId] = useState(googleUser?.isGuest ? '' : 'farm');
 const [industry, setIndustry] = useState('');
 const [locCity, setLocGu] = useState('');
 const [locDistrict, setLocDong] = useState('');
 const [locVillage, setLocStreet] = useState('');
 const [locFarm, setLocFarm] = useState('');
 const [loading, setLoading] = useState(false);
 const [mapCenter, setMapCenter] = useState([36.2388, 128.5728]); // Default to Gunwi-gun (Agricultural Hub of Daegu)
 const [existingFarms, setExistingFarms] = useState([]);
 const [isNewFarm, setIsNewFarm] = useState(false);
 const [showAllFarms, setShowAllFarms] = useState(false);
 const [allFarmsList, setAllFarmsList] = useState([]);
 const [loadingAllFarms, setLoadingAllFarms] = useState(false);

 useEffect(() => {
   const loadAllFarms = async () => {
     try {
       const res = await axios.get(`${API_BASE_URL}/api/v1/hierarchy/farms/all`);
       setAllFarmsList(res.data.farms || []);
     } catch (e) {
       console.error("Failed to fetch all farms for combobox", e);
     }
   };
   loadAllFarms();
 }, []);

 useEffect(() => {
 const fetchFarms = async () => {
 if (levelId === 'farm' && locCity && locDistrict && locVillage) {
 try {
 const pathStr = [locCity, locDistrict, ...locVillage.split('/')].filter(Boolean).join('/');
 const res = await axios.get(`${API_BASE_URL}/api/v1/hierarchy/explore?path=${encodeURIComponent(pathStr)}`);
 if (res.data && res.data.children) {
 setExistingFarms(res.data.children.map(c => c.name));
 }
 } catch (e) {
 setExistingFarms([]);
 console.error(e);
 }
 } else {
 setExistingFarms([]);
 }
 };
 // Debounce slightly
 const timer = setTimeout(fetchFarms, 500);
 return () => clearTimeout(timer);
 }, [locCity, locDistrict, locVillage, levelId]);
 useEffect(() => {
  if (locDistrict.includes('효령') || locDistrict.includes('부계')) setMapCenter([36.1963, 128.6186]); 
  else if (locDistrict.includes('유가') || locDistrict.includes('구지')) setMapCenter([35.6358, 128.4111]); 
  else if (locDistrict.includes('하빈')) setMapCenter([35.6033, 128.4372]); 
  else if (locDistrict.includes('공산') || locDistrict.includes('백안')) setMapCenter([35.9863, 128.6436]); 
  else if (locCity.includes('군위')) setMapCenter([36.2388, 128.5728]);
  else if (locCity.includes('달성')) setMapCenter([35.7746, 128.4312]);
 }, [locDistrict, locCity]);

 const handleFetchAllFarms = async () => {
   if (showAllFarms) { setShowAllFarms(false); return; }
   setShowAllFarms(true);
   setLoadingAllFarms(true);
   try {
     const res = await axios.get(`${API_BASE_URL}/api/v1/hierarchy/farms/all`);     
     setAllFarmsList(res.data.farms || []);
   } catch(e) {
     alert("데이터를 불러오지 못했습니다: " + e.message);
   } finally {
     setLoadingAllFarms(false);
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
 setLocFarm(addr.name);
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
 let location = [];
 if (window.selectedFarmFullPath && levelId === 'farm' && locFarm === window.selectedFarmFullPath[window.selectedFarmFullPath.length - 1]) {
     location = window.selectedFarmFullPath;
 } else {
     if (locCity) location.push(locCity);
     if ((levelId === 'dong' || levelId === 'street' || levelId === 'farm') && locDistrict) location.push(locDistrict);
     if ((levelId === 'street' || levelId === 'farm') && locVillage) location.push(...locVillage.split('/'));
     if (levelId === 'farm' && locFarm) location.push(locFarm);
 }
 setLoading(true);
 try {
 await axios.post(`${API_BASE_URL}/api/v1/hierarchy/user/context`, { role: selectedLevel.role, industry: industry || '생산자 (농가/스마트팜)', location
 });
 onComplete({ role: selectedLevel.role, industry: industry || '생산자 (농가/스마트팜)', location, isGuest: googleUser?.isGuest || false });
 } catch (err) {
 alert('서버 연결 실패: ' + (err.response?.data?.detail || err.message));
 } finally {
 setLoading(false);
 }
 };

 return (
 <main className="h-[100dvh] bg-[#0A0F1A] text-slate-200 flex flex-col items-center justify-start p-4 pb-24 selection:bg-emerald-500/30 overflow-y-auto mx-auto w-full max-w-md relative border-x border-slate-800">
 <div className="w-full bg-[#0E1420] border border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden mt-4 shrink-0"> <div className="absolute top-0 right-0 p-8 opacity-5"><Radar size={200}/></div>
 <h1 className="text-3xl font-black text-white mb-2 relative z-10">Agri-Data Hub Setup</h1>
 <p className="text-slate-400 mb-8 relative z-10 text-[11px] leading-relaxed break-keep">
 {levelId === 'farm' ? (
   !googleUser?.isGuest ? (
     <span className="text-emerald-400 font-bold">✨ 구글 인증 농장/필지(Farm) 모드입니다. 데이터 피딩 시 신뢰도 보너스가 적용됩니다.</span>
   ) : (
     <span className="text-orange-400 font-bold">⚠️ 게스트 모드로 진입 중입니다. 농장(Farm) 피딩 시 신뢰도 패널티가 적용됩니다.</span>
   )
 ) : levelId ? (
   <span className="text-emerald-400 font-bold">🌾 {LEVELS.find(l => l.id === levelId)?.name.split(' ')[0]} 관리자/지자체 모드로 진입 중입니다. 관할 농업 데이터를 조회합니다.</span>
 ) : (
   <span className="text-slate-400 font-bold">🎯 본인의 페르소나(객체 단위)를 먼저 선택해 주세요.</span>
 )}
 </p>
 
 <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
 <div className="space-y-4">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">1. Select Target Object</label>
 <div className="grid grid-cols-1 gap-4">
 {LEVELS.map(l => (
 <div key={l.id} onClick={() => setLevelId(l.id)} className={`p-4 rounded-xl border cursor-pointer transition-all ${levelId === l.id ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
 <div className="mb-3 text-emerald-400">{l.icon}</div>
 <div className="font-bold mb-1 text-sm flex items-center gap-1">
 {l.name} {l.id === 'farm' && !googleUser?.isGuest && <ShieldCheck size={12} className="text-emerald-400" title="공식 인증" />}
 </div>
 <div className="text-[10px] opacity-70 break-keep">{l.desc}</div>
 </div>
 ))}
 </div>
 </div>

 <AnimatePresence>
 {levelId && (
 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6">
 {levelId === 'farm' && (
 <div className="space-y-3">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Industry & Persona (산업군 및 페르소나)</label>
 <div className="grid grid-cols-2 gap-3">
   <button type="button" onClick={() => setIndustry('생산자 (농가/스마트팜)')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${industry === '생산자 (농가/스마트팜)' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
     <span className="text-2xl">🚜</span>
     <span className="text-xs font-bold">생산자 (농가)</span>
   </button>
   <button type="button" onClick={() => setIndustry('연구기관 (AI 데이터 허브)')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${industry === '연구기관 (AI 데이터 허브)' ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
     <span className="text-2xl">🧠</span>
     <span className="text-xs font-bold">연구기관 (AI 데이터 허브)</span>
   </button>
   <button type="button" onClick={() => setIndustry('기업 (농기계/스마트팜)')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${industry === '기업 (농기계/스마트팜)' ? 'bg-orange-600/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
     <span className="text-2xl">⚙️</span>
     <span className="text-xs font-bold">기업 (농기계/스마트팜)</span>   </button>
   <button type="button" onClick={() => setIndustry('지자체/관공서')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${industry === '지자체/관공서' ? 'bg-slate-700/50 border-slate-500 text-white shadow-[0_0_15px_rgba(100,116,139,0.2)]' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
     <span className="text-2xl">🏛️</span>
     <span className="text-xs font-bold">지자체/관공서</span>
   </button>
 </div> </div>
 )}
 
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">2. Location Definition</label>
 <button type="button" onClick={handleLocateMe} className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
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
 <LocationSelector setMapCenter={setMapCenter} setLocGu={setLocGu} setLocDong={setLocDong} setLocStreet={setLocStreet} setLocFarm={setLocFarm} setIndustry={setIndustry} />
 <Marker position={mapCenter} icon={customMarkerIcon} />
 </MapContainer>
 <div className="absolute bottom-4 left-4 z-[400] pointer-events-none">
 <div className="bg-[#0E1420]/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/50 shadow-xl flex items-center gap-2">
 <MapPin size={14} className="text-emerald-400 animate-bounce"/>
 <span className="text-[10px] font-bold text-slate-300">지도를 클릭하면 아래 텍스트가 자동 완성됩니다.</span>
 </div>
 </div>
 </div>

 {/* Dynamic Location Selection UX */}
 <div className="space-y-4 pt-4 border-t border-slate-800/60">
 {/* GU Level */}
 {(levelId === 'gu' || levelId === 'dong' || levelId === 'street' || levelId === 'farm') && (
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
 <MapPin size={12} className="text-emerald-500"/> 시/군/구 (City/Gun/Gu)
 </label>
 <div className="flex flex-wrap gap-2 items-center">
 <input required list="gu-list" placeholder="직접입력 (또는 아래 목록 선택)" value={locCity} onChange={e=>setLocGu(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-emerald-500 outline-none text-white" />
 <datalist id="gu-list">
  {[...new Set(allFarmsList.map(s => s.gu).filter(Boolean))].map(g => <option key={g} value={g} />)}
 </datalist>
 </div> </div>
 )}

 {/* DONG Level */}
 {(levelId === 'dong' || levelId === 'street' || levelId === 'farm') && (
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
 <MapPin size={12} className="text-blue-400"/> 읍/면/동 (Eup/Myeon/Dong)
 </label>
 <div className="flex flex-wrap gap-2 items-center">
 <input required={(levelId === 'farm' || levelId === 'street' || levelId === 'dong')} list="dong-list" placeholder="직접입력 (또는 아래 목록 선택)" value={locDistrict} onChange={e=>setLocDong(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-blue-400 outline-none text-white" />
 <datalist id="dong-list">
  {[...new Set(allFarmsList.filter(s => !locCity || s.gu === locCity).map(s => s.dong).filter(Boolean))].map(d => <option key={d} value={d} />)}
 </datalist>
 </div>
 </div>
 )}

 {/* STREET Level */}
 {(levelId === 'street' || levelId === 'farm') && (
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
 <MapPin size={12} className="text-orange-400"/> 마을/재배지 (Village/Zone)
 </label>
 <div className="flex flex-wrap gap-2 items-center">
 <input required={levelId==='farm' || levelId==='street'} list="street-list" placeholder="직접입력 (또는 아래 목록 선택)" value={locVillage} onChange={e=>setLocStreet(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-orange-400 outline-none text-white" />
 <datalist id="street-list">
  {[...new Set(allFarmsList.filter(s => (!locCity || s.gu === locCity) && (!locDistrict || s.dong === locDistrict)).map(s => s.street).filter(Boolean))].map(str => <option key={str} value={str} />)}
 </datalist>
 </div>
 </div>
 )}
 
 {/* FARM Level */}
 {levelId === 'farm' && (
 <div className="col-span-2 space-y-3 pt-2 border-t border-slate-800/60">
 <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5"><Tractor size={12}/> 농장/필지 선택 및 신규 등록</label>
 
 {existingFarms.length > 0 && (
 <div className="flex flex-wrap gap-2">
 {existingFarms.map(farm => (
 <button 
 key={farm} 
 type="button"
 onClick={() => { setLocFarm(farm); setIsNewFarm(false); }}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${locFarm === farm && !isNewFarm ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'}`}
 >
 {farm}
 </button>
 ))}
 <button 
 type="button"
 onClick={() => { setLocFarm(''); setIsNewFarm(true); }}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold border border-dashed transition-all ${isNewFarm ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500' : 'border-slate-600 text-slate-500 hover:text-slate-300'}`}
 >
 <Plus size={12} className="inline mr-1"/> 신규 등록
 </button>
 </div>
 )}
 
 {(existingFarms.length === 0 || isNewFarm) && (
 <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="relative group">
 <input required list="farm-list" placeholder="기존 농장 검색 또는 새로운 농장 이름 입력" value={locFarm} onChange={e=>{setLocFarm(e.target.value); setIsNewFarm(true);}} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" />
 <datalist id="farm-list">
  {allFarmsList.filter(s => (!locVillage || s.street === locVillage)).map(s => <option key={s.name} value={s.name} />)}
 </datalist>
 </motion.div> )}
 </div>
 )}
 
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 <button type="submit" disabled={!levelId || loading} className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-black text-sm shadow-[0_5px_15px_rgba(16,185,129,0.3)] hover:scale-[1.01] hover:shadow-[0_5px_20px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex justify-center items-center gap-2 uppercase tracking-widest mt-8">
 {loading ? <RefreshCw className="animate-spin" size={18}/> : "Enter Workspace"}
 </button>

 <div className="mt-4 pt-4 border-t border-slate-800/60">
    <button type="button" onClick={handleFetchAllFarms} className="w-full py-3 bg-slate-800/50 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors flex justify-center items-center gap-2">
       {showAllFarms ? "목록 닫기" : "기존에 등록된 모든 농장/필지 찾아보기"}
    </button>

    <AnimatePresence>
      {showAllFarms && (
        <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
           {loadingAllFarms ? (
              <div className="p-4 text-center text-xs text-slate-500 flex justify-center items-center gap-2">
                 <RefreshCw size={14} className="animate-spin" /> 데이터를 불러오는 중...
              </div>
           ) : allFarmsList.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">등록된 객체가 없습니다.</div>
           ) : (
              allFarmsList.map((s, idx) => (
                 <div key={idx} onClick={() => {
                    setLevelId('farm');
                    window.selectedFarmFullPath = s.path.split("/");
                    setLocGu(s.gu); setLocDong(s.dong); setLocStreet(s.street); setLocFarm(s.name); setIndustry(s.industry);
                    setShowAllFarms(false);
                 }} className="p-3 bg-[#101725] border border-slate-800 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-colors group">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{s.name}</span>
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
 </main>
 );
 }