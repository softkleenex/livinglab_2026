import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Cpu, Database, Activity, AlertTriangle, Droplets, TrendingUp, Package } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

export default function SynthesisInsight({ userContext }) {
  const [alertData, setAlertData] = useState(null);
  const [yieldData, setYieldData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [cropSimData, setCropSimData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mocking data for the specific personas (Pig Farm / Lettuce Smart Farm)
  const isPigFarm = userContext?.industry?.includes('양돈') || userContext?.industry?.includes('축산');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const region = userContext?.location ? userContext.location.join(' ') : '대구광역시';
        
        // Fetch Livestock Alert (for Pigs)
        const alertRes = await axios.get(`${API_BASE_URL}/api/v1/ax-data/livestock-alert`, {
          params: { region, livestock_type: '돼지' }
        });
        
        if (alertRes.data?.status === 'success') {
          setAlertData(alertRes.data.data);
        }

        // Fetch Yield Prediction (For Lettuce/Crops)
        const yieldRes = await axios.get(`${API_BASE_URL}/api/v1/ax-data/yield-prediction`, {
          params: { region, crop: '상추' }
        });

        if (yieldRes.data?.status === 'success') {
          setYieldData(yieldRes.data.data);
        }

        // Fetch Integrated Sales and Shipment Data
        const pathStr = userContext?.location ? userContext.location.join('/') : '';
        const salesRes = await axios.get(`${API_BASE_URL}/api/v1/dashboard/sales-insight`, {
          params: { path: pathStr }
        });
        
        if (salesRes.data?.status === 'success') {
          setSalesData(salesRes.data.data);
        }

      } catch (err) {
        console.error("Failed to load AX data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userContext]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-4 h-full pb-10"
    >
      {/* Golden Time Alert Widget (Focused on Pigs/Livestock) */}
      {loading ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 shadow-lg flex items-center justify-center h-24 animate-pulse">
          <span className="text-sm text-slate-400">AI 분석 중...</span>
        </div>
      ) : isPigFarm ? (
        <div className={`border rounded-2xl p-4 shadow-lg flex flex-col gap-3 ${alertData?.mortality_risk_level === '심각' || alertData?.mortality_risk_level === '고위험' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={alertData?.mortality_risk_level === '심각' || alertData?.mortality_risk_level === '고위험' ? 'text-rose-500 shrink-0 mt-0.5' : 'text-yellow-500 shrink-0 mt-0.5'} size={20} />
            <div>
              <h3 className={`text-sm font-bold mb-1 ${alertData?.mortality_risk_level === '심각' || alertData?.mortality_risk_level === '고위험' ? 'text-rose-400' : 'text-yellow-400'}`}>폐사 위험 골든타임 알림 ({alertData?.mortality_risk_level || '주의'})</h3>
              <p className={`text-[11px] leading-relaxed ${alertData?.mortality_risk_level === '심각' || alertData?.mortality_risk_level === '고위험' ? 'text-rose-200/80' : 'text-yellow-200/80'}`}>
                {alertData?.actionable_insight || '정전 및 환기 시설 이상에 대비하세요.'}
              </p>
            </div>
          </div>
          <div className="bg-[#0A0F1A]/60 rounded-xl p-3 border border-slate-800/50 mt-2">
            <div className="text-[10px] text-slate-400 font-bold mb-2 flex items-center gap-1"><Droplets size={12}/> 사료 및 음수량 모니터링 (질병 조기진단)</div>
            <div className="flex justify-between items-center text-sm font-mono text-slate-200">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500">일평균 음수량</span>
                <span className="text-emerald-400">정상 (변화율 -1.2%)</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500">사료 섭취량</span>
                <span className="text-yellow-400">주의 (변화율 -8.5%)</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-2xl p-4 shadow-lg bg-emerald-500/10 border-emerald-500/30 flex items-start gap-3">
          <Activity className="text-emerald-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm font-bold mb-1 text-emerald-400">농장 생육 환경 모니터링 (정상)</h3>
            <p className="text-[11px] leading-relaxed text-emerald-200/80">
              현재 온/습도가 작물 생육에 최적화되어 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* Open Source Synthetic Data Generator */}
      <div className="bg-[#0A0F1A]/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg mb-4">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Database className="text-violet-400" />
          오픈소스 AI 합성 환경 (EnvHub)
        </h2>
        <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
          멘토링 피드백 반영: AgiBot Genie Sim, Hugging Face LeRobot EnvHub, RoboCasa 등 오픈소스 기반 시나리오로 고품질 합성 데이터를 무상 제공합니다.
        </p>

        {/* Sim Terminal / Log View */}
        <div className="bg-[#05080F] border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Database size={12} /> LeRobot EnvHub Active
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] text-emerald-400">Generating</span>
            </span>
          </div>
          <div className="font-mono text-[10px] text-emerald-500/80 space-y-1 h-20 overflow-hidden relative">
            <p>{`> [EnvHub] Loading scenario: 'apple_orchard_harvest'`}</p>
            <p>{`> [Genie Sim] Initializing robot kinematics... OK`}</p>
            <p>{`> [RoboCasa] Rendering textures (lighting: overcast)`}</p>
            <p>{`> Generating 10,000 synthetic vision frames...`}</p>
            <p className="animate-pulse">{`> Processing...`}</p>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#05080F] to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Integrated Sales & Shipment Dashboard (Focused on Smart Farms) */}
      <div className="bg-[#0A0F1A]/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <TrendingUp className="text-blue-400" />
          통합 매출 및 출고 대시보드
        </h2>
        <p className="text-[11px] text-slate-400 mb-5 leading-relaxed">
          분산된 쇼핑몰 주문과 출고 데이터를 하나로 통합하여 보여줍니다.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50 flex flex-col justify-center">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Activity size={12} /> 이번 달 총 매출
            </div>
            <div className="text-sm font-bold text-white truncate">₩ {salesData?.totalSales}</div>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50 flex flex-col justify-center">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Package size={12} /> 출고 완료 수량
            </div>
            <div className="text-sm font-bold text-white truncate">{salesData?.totalShipped} 박스</div>
          </div>
        </div>

        {/* AI Cultivation Recommendation */}
        <div className="bg-blue-900/10 rounded-xl p-3 border border-blue-500/30 mb-4">
          <div className="text-[10px] text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1 font-bold">
            <Cpu size={12} /> AI 재배량 추천
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-[11px] text-slate-300 leading-relaxed">
                {salesData?.recommendation || '데이터 분석 중...'}
              </div>
            </div>
            <div className="shrink-0 text-center bg-[#0A0F1A] p-2 rounded-lg border border-blue-500/20">
              <div className="text-[9px] text-slate-500 mb-0.5">최근 성장률</div>
              <div className={`text-sm font-black ${salesData?.growth_trend >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>{salesData?.growth_trend > 0 ? '+' : ''}{salesData?.growth_trend || 0}%</div>
              <div className={`text-[8px] ${salesData?.growth_trend >= 0 ? 'text-blue-500/70' : 'text-rose-500/70'}`}>{salesData?.growth_trend >= 0 ? '판매 상향' : '판매 하락'}</div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
