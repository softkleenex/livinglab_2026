import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Radar, Tractor, Users, MapPin, RefreshCw, Plus, Building2, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

const INDUSTRIES = [
  { id: 'pig', name: '양돈 농가', icon: <Tractor size={20}/>, desc: '방역 및 질병 골든타임 알림', value: '축산 (양돈)' },
  { id: 'crop', name: '스마트팜', icon: <Leaf size={20}/>, desc: '매출 분석 및 AI 재배량 추천', value: '스마트팜' },
  { id: 'b2b', name: 'B2B 구매자', icon: <Building2 size={20}/>, desc: '오픈소스 합성 데이터 및 농산물 구매', value: '기업 (데이터 구매자)' }
];

export default function Onboarding({ onComplete, googleUser }) {
  const [industryId, setIndustryId] = useState('');
  const [locationText, setLocationText] = useState('');
  const [farmName, setFarmName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAllFarms, setShowAllFarms] = useState(false);
  const [allFarmsList, setAllFarmsList] = useState([]);
  const [loadingAllFarms, setLoadingAllFarms] = useState(false);

  useEffect(() => {
    const loadAllFarms = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/hierarchy/farms/all`);
        setAllFarmsList(res.data.farms || []);
      } catch (e) {
        console.error("Failed to fetch all farms", e);
      }
    };
    loadAllFarms();
  }, []);

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

  const handleSelectExisting = (farm) => {
    const parts = farm.path.split('/');
    setFarmName(parts.pop());
    setLocationText(parts.join(' '));
    
    const farmInd = farm.industry || '';
    if (farmInd.includes('축산') || farmInd.includes('양돈')) {
      setIndustryId('pig');
    } else if (farmInd.includes('스마트팜') || farmInd.includes('농업')) {
      setIndustryId('crop');
    } else {
      // 연구기관, 공공/지자체, IT/로보틱스 등 나머지는 모두 B2B(데이터 구매자)로 맵핑
      setIndustryId('b2b');
    }
    
    setShowAllFarms(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!industryId) return alert('산업군을 선택해주세요.');
    if (!locationText || !farmName) return alert('지역과 농장/기업명을 입력해주세요.');
    
    const selectedInd = INDUSTRIES.find(i => i.id === industryId);
    // Convert '경상북도 의성군 다인면' -> ['경상북도', '의성군', '다인면', 'farmName']
    const locationArray = [...locationText.trim().split(/\s+/), farmName];

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/v1/hierarchy/user/context`, { 
        role: 'farm', 
        industry: selectedInd.value, 
        location: locationArray
      });
      onComplete({ 
        role: 'farm', 
        industry: selectedInd.value, 
        location: locationArray, 
        isGuest: googleUser?.isGuest || false 
      });
    } catch (err) {
      alert('서버 연결 실패: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-[100dvh] bg-[#0A0F1A] text-slate-200 flex flex-col items-center justify-start p-4 pb-24 selection:bg-emerald-500/30 overflow-y-auto mx-auto w-full max-w-md relative border-x border-slate-800">
      <div className="w-full bg-[#0E1420] border border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden mt-4 shrink-0"> 
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Radar size={200}/></div>
        <h1 className="text-3xl font-black text-white mb-2 relative z-10 tracking-tight">Agricultural AX</h1>
        <p className="text-slate-400 mb-8 relative z-10 text-xs leading-relaxed break-keep">
          복잡한 절차 없이 간편하게 워크스페이스를 설정하세요.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">1. 산업군 페르소나 선택</label>
            <div className="grid grid-cols-1 gap-3">
              {INDUSTRIES.map(ind => (
                <button 
                  key={ind.id} 
                  type="button"
                  onClick={() => setIndustryId(ind.id)} 
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${industryId === ind.id ? 'bg-emerald-600/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}`}
                >
                  <div className={`p-2 rounded-lg ${industryId === ind.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    {ind.icon}
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${industryId === ind.id ? 'text-white' : 'text-slate-300'}`}>{ind.name}</div>
                    <div className="text-[10px] text-slate-500">{ind.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800/60">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
              2. 지역 및 소속 입력
            </label>
            <div className="space-y-3">
              <div>
                <input required type="text" placeholder="지역 입력 (예: 경상북도 의성군)" value={locationText} onChange={e=>setLocationText(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" />
              </div>
              <div>
                <input required type="text" placeholder="농장 또는 기업명 (예: 지니스팜)" value={farmName} onChange={e=>setFarmName(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={!industryId || loading} className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-black text-sm shadow-[0_5px_15px_rgba(16,185,129,0.3)] hover:scale-[1.01] hover:shadow-[0_5px_20px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex justify-center items-center gap-2 uppercase tracking-widest mt-6">
            {loading ? <RefreshCw className="animate-spin" size={18}/> : "워크스페이스 입장"}
          </button>

          <div className="mt-4 pt-4 border-t border-slate-800/60">
            <button type="button" onClick={handleFetchAllFarms} className="w-full py-3 bg-slate-800/50 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors flex justify-center items-center gap-2">
              {showAllFarms ? "목록 닫기" : "기존에 등록된 생태계 목록에서 선택"}
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
                      <div key={idx} onClick={() => handleSelectExisting(s)} className="p-3 bg-[#101725] border border-slate-800 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-colors group">
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
        </form> 
      </div>
    </main>
  );
}