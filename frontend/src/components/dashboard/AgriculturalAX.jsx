import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CloudRain, Sprout, TrendingUp, RefreshCw, BarChart2, CheckCircle2 } from 'lucide-react';

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
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);

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

  const handlePredict = async () => {
    setPredicting(true);
    setPrediction(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/ax-data/yield-prediction?region=${encodeURIComponent(locGu)}&crop=사과`);
      setPrediction(res.data.data);
      addToast("합성 데이터 생성이 완료되었습니다.", "success");
      fetchHistory(); // Refresh history
    } catch(err) {
      addToast("예측 생성 중 오류가 발생했습니다.", "error");
    } finally {
      setPredicting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto w-full pb-10 px-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Badge label="AGRICULTURAL AX" color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
          <Badge label="SYNTHETIC DATA" color="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" />
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">AI Yield Prediction</h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
              기상청 API와 농수산식품유통공사 데이터를 결합하여 Gemini가 지역별 수확량과 적정 가격을 예측합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#101725] p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><CloudRain size={16}/> 실시간 공공 데이터 융합</h3>
            <button onClick={handlePredict} disabled={predicting} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors">
              {predicting ? <RefreshCw size={14} className="animate-spin"/> : <BarChart2 size={14}/>}
              수확량 예측하기
            </button>
          </div>
          
          {prediction && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0A0F1A] border border-slate-700 p-4 rounded-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs text-slate-400 font-bold uppercase">예측 리포트 (Gemini 2.5)</span>
                <span className="text-[10px] bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">완료됨</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{prediction.synthetic_insight}</p>
            </motion.div>
          )}
        </div>

        <div className="bg-[#101725] p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-4">
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
                  <p className="text-xs text-slate-300 line-clamp-3">{item.result}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}