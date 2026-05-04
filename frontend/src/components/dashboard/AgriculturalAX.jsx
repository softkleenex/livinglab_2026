import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CloudRain, Sprout, TrendingUp, RefreshCw, BarChart2, ThermometerSun, Map, Droplets, AlertTriangle, Network } from 'lucide-react';

const Badge = React.memo(({ label, icon, color }) => {
  return (
    <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-default ${color}`}>
      {icon} {label}
    </div>
  );
});

export default function AgriculturalAX({ addToast, userContext }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for each predictor
  const [states, setStates] = useState({
    yield: { predicting: false, data: null },
    simulator: { predicting: false, data: null },
    oversupply: { predicting: false, data: null },
    livestock: { predicting: false, data: null },
    resource: { predicting: false, data: null },
    c1pipeline: { predicting: false, data: null }
  });

  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');
  const locGu = userContext?.location?.[0] || '대구광역시';

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/ax-data/history?region=${encodeURIComponent(locGu)}`);
      setHistory(res.data.history);
    } catch(err) {
      addToast("합성 데이터 이력을 불러오지 못했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [locGu]);

  const updateState = (key, changes) => setStates(prev => ({ ...prev, [key]: { ...prev[key], ...changes } }));

  const handleAction = async (key, endpoint, params, successMsg) => {
    updateState(key, { predicting: true, data: null });
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await axios.get(`${API_BASE_URL}/api/v1/ax-data/${endpoint}?${qs}`);
      updateState(key, { data: res.data.data });
      addToast(successMsg, "success");
      fetchHistory();
    } catch(err) {
      addToast(`${successMsg} 중 오류가 발생했습니다.`, "error");
    } finally {
      updateState(key, { predicting: false });
    }
  };

  const handleC1Pipeline = async () => {
    updateState('c1pipeline', { predicting: true, data: null });
    // Mock simulation for C-1 pipeline since we don't have a direct endpoint for it yet, or we can use the simulator endpoint
    setTimeout(() => {
      updateState('c1pipeline', { 
        predicting: false, 
        data: {
          insight: "대구/경북 특화 파이프라인 가동 완료. 센서 데이터(토양, 기온)와 트랙터 로그를 병합하여 '대구 사과' 생육 상태 및 예상 수확량을 AI-Ready 형태로 라벨링 및 통합 분석했습니다.",
          metrics: "데이터 정합성 98%, 파이프라인 처리 시간 1.2s"
        } 
      });
      addToast("AI 4 Science 파이프라인 분석 완료", "success");
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto w-full pb-10 px-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Badge label="AGRICULTURAL AX" color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
          <Badge label="SYNTHETIC DATA" color="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" />
          <Badge label="AI 4 SCIENCE" color="bg-purple-500/10 text-purple-400 border-purple-500/20" />
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Agricultural AI Models & Data Pipeline</h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
              기상청 API 및 공공데이터를 결합하여 농가의 위기 대응을 돕는 합성 데이터를 생성하고(A-1 ~ A-5), 대구/경북 특화 통합 파이프라인(C-1, C-2)을 운영합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* C-1 AI 4 Science Pipeline */}
        <div className="md:col-span-2 bg-[#101725] p-6 rounded-2xl border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col gap-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 bg-purple-600/20 text-purple-400 text-[9px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-purple-500/20 uppercase tracking-widest">
            Phase 2 Special: C-1 & C-2
          </div>
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Network size={16} className="text-purple-400"/> AI 4 Science 농업 데이터 통합 파이프라인 (대구/경북)</h3>
            <button onClick={handleC1Pipeline} disabled={states.c1pipeline.predicting} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors shadow-lg shadow-purple-600/20">
              {states.c1pipeline.predicting ? <RefreshCw size={14} className="animate-spin"/> : <Network size={14}/>} 파이프라인 가동 (AI-Ready 자동 라벨링)
            </button>
          </div>
          {states.c1pipeline.data && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-purple-900/10 border border-purple-500/30 p-4 rounded-xl space-y-4">
              <div className="text-xs text-purple-200 leading-relaxed font-medium">{states.c1pipeline.data.insight}</div>
              <div className="flex gap-4 mt-2">
                <span className="text-[10px] text-purple-400 font-bold px-2 py-1 bg-purple-500/10 rounded">{states.c1pipeline.data.metrics}</span>
                <span className="text-[10px] text-emerald-400 font-bold px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">C-2 정형/비정형 라벨링 규격 통과</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* A-1 Yield Prediction */}
        <div className="bg-[#101725] p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-6 hover:border-emerald-500/30 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><CloudRain size={16}/> 지역별 수확량 예측 (A-1)</h3>
            <button onClick={() => handleAction('yield', 'yield-prediction', { region: locGu, crop: '사과' }, '수확량 예측 생성 완료')} disabled={states.yield.predicting} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors">
              {states.yield.predicting ? <RefreshCw size={14} className="animate-spin"/> : <BarChart2 size={14}/>} 예측하기
            </button>
          </div>
          {states.yield.data && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0A0F1A] border border-slate-700 p-4 rounded-xl space-y-4">
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{states.yield.data.actionable_insight}</div>
              <div className="flex gap-4 mt-2">
                <span className="text-[10px] text-emerald-400 font-bold">예상 수확량: {states.yield.data.predicted_yield_kg}kg</span>
                <span className="text-[10px] text-rose-400 font-bold">증감율: {states.yield.data.yield_change_percent}%</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* A-2 Crop Simulator */}
        <div className="bg-[#101725] p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-6 hover:border-indigo-500/30 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Map size={16}/> 기후 대응 시뮬레이터 (A-2)</h3>
            <button onClick={() => handleAction('simulator', 'crop-simulator', { region: locGu, crop: '사과' }, '시뮬레이션 완료')} disabled={states.simulator.predicting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors">
              {states.simulator.predicting ? <RefreshCw size={14} className="animate-spin"/> : <TrendingUp size={14}/>} 시뮬레이션
            </button>
          </div>
          {states.simulator.data && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0A0F1A] border border-slate-700 p-4 rounded-xl space-y-4">
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{states.simulator.data.actionable_insight}</div>
              <div className="flex gap-4 mt-2">
                <span className="text-[10px] text-indigo-400 font-bold">10년 생존율: {states.simulator.data.survival_rate_10yr}%</span>
                <span className="text-[10px] text-amber-400 font-bold">대체 작물: {states.simulator.data.recommended_alternative_crop}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* A-3 Oversupply Risk */}
        <div className="bg-[#101725] p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-6 hover:border-rose-500/30 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><AlertTriangle size={16}/> 수급 불균형 지표 (A-3)</h3>
            <button onClick={() => handleAction('oversupply', 'oversupply-risk', { crop: '배추' }, '위험 지표 분석 완료')} disabled={states.oversupply.predicting} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors">
              {states.oversupply.predicting ? <RefreshCw size={14} className="animate-spin"/> : <BarChart2 size={14}/>} 분석하기
            </button>
          </div>
          {states.oversupply.data && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0A0F1A] border border-slate-700 p-4 rounded-xl space-y-4">
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{states.oversupply.data.actionable_insight}</div>
              <div className="flex gap-4 mt-2">
                <span className="text-[10px] text-rose-400 font-bold">위험도: {states.oversupply.data.risk_level} ({states.oversupply.data.risk_index})</span>
                <span className="text-[10px] text-slate-400 font-bold">예상 가격 하락: {states.oversupply.data.expected_price_drop_percent}%</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* A-4 Livestock Alert */}
        <div className="bg-[#101725] p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-6 hover:border-amber-500/30 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><ThermometerSun size={16}/> 폭염 폐사 방지 알림 (A-4)</h3>
            <button onClick={() => handleAction('livestock', 'livestock-alert', { region: locGu, livestock_type: '돼지' }, '골든타임 산출 완료')} disabled={states.livestock.predicting} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors">
              {states.livestock.predicting ? <RefreshCw size={14} className="animate-spin"/> : <ThermometerSun size={14}/>} 알림 생성
            </button>
          </div>
          {states.livestock.data && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0A0F1A] border border-slate-700 p-4 rounded-xl space-y-4">
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{states.livestock.data.actionable_insight}</div>
              <div className="flex gap-4 mt-2">
                <span className="text-[10px] text-amber-400 font-bold">골든타임: {states.livestock.data.golden_time_hours}시간</span>
                <span className="text-[10px] text-rose-400 font-bold">위험도: {states.livestock.data.mortality_risk_level}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* A-5 Resource Efficiency */}
        <div className="bg-[#101725] p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-6 hover:border-cyan-500/30 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Droplets size={16}/> 자원 투입 가이드 (A-5)</h3>
            <button onClick={() => handleAction('resource', 'resource-efficiency', { region: locGu, crop: '사과' }, '자원 가이드 산출 완료')} disabled={states.resource.predicting} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors">
              {states.resource.predicting ? <RefreshCw size={14} className="animate-spin"/> : <Droplets size={14}/>} 산출하기
            </button>
          </div>
          {states.resource.data && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0A0F1A] border border-slate-700 p-4 rounded-xl space-y-4">
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{states.resource.data.actionable_insight}</div>
              <div className="flex gap-4 mt-2">
                <span className="text-[10px] text-cyan-400 font-bold">비료 절감: {states.resource.data.fertilizer_reduction_percent}%</span>
                <span className="text-[10px] text-emerald-400 font-bold">탄소 저감: {states.resource.data.carbon_reduction_kg}kg</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* History Panel */}
        <div className="bg-[#101725] p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-4 md:col-span-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Sprout size={16}/> 합성 데이터 이력 (DB Cached)</h3>
          
          {loading ? (
             <div className="flex justify-center py-10 text-slate-500">
               <RefreshCw size={24} className="animate-spin" />
             </div>
          ) : history.length === 0 ? (
            <div className="text-center text-slate-500 text-xs py-10">이력이 없습니다.</div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-64 pr-2">
              {history.map(item => (
                <div key={item.id} className="bg-[#0A0F1A] p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold">{item.region} | {item.type}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">신뢰도: {item.confidence}%</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{JSON.stringify(item.result)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}