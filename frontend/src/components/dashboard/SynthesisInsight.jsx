import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Cpu, Database, Activity, AlertTriangle, Leaf } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

export default function SynthesisInsight({ userContext }) {
  const [alertData, setAlertData] = useState(null);
  const [yieldData, setYieldData] = useState(null);
  const [resourceData, setResourceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const region = userContext?.location ? userContext.location.join(' ') : '대구광역시';
        
        // Fetch Livestock Alert
        const alertRes = await axios.get(`${API_BASE_URL}/api/v1/ax-data/livestock-alert`, {
          params: { region, livestock_type: '한우' }
        });
        
        if (alertRes.data?.status === 'success') {
          setAlertData(alertRes.data.data);
        }

        // Fetch Yield Prediction
        const yieldRes = await axios.get(`${API_BASE_URL}/api/v1/ax-data/yield-prediction`, {
          params: { region, crop: '사과' }
        });

        if (yieldRes.data?.status === 'success') {
          setYieldData(yieldRes.data.data);
        }

        // Fetch Resource Efficiency (A-5)
        const resourceRes = await axios.get(`${API_BASE_URL}/api/v1/ax-data/resource-efficiency`, {
          params: { region, crop: '사과' }
        });

        if (resourceRes.data?.status === 'success') {
          setResourceData(resourceRes.data.data);
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
      {/* Alert Widget */}
      {loading ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 shadow-lg flex items-center justify-center h-24 animate-pulse">
          <span className="text-sm text-slate-400">데이터 합성 중...</span>
        </div>
      ) : alertData ? (
        <div className={`border rounded-2xl p-4 shadow-lg flex items-start gap-3 ${alertData.mortality_risk_level === '심각' || alertData.mortality_risk_level === '고위험' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
          <AlertTriangle className={alertData.mortality_risk_level === '심각' || alertData.mortality_risk_level === '고위험' ? 'text-rose-500 shrink-0 mt-0.5' : 'text-yellow-500 shrink-0 mt-0.5'} size={20} />
          <div>
            <h3 className={`text-sm font-bold mb-1 ${alertData.mortality_risk_level === '심각' || alertData.mortality_risk_level === '고위험' ? 'text-rose-400' : 'text-yellow-400'}`}>폭염 경보 및 골든타임 알림 ({alertData.mortality_risk_level})</h3>
            <p className={`text-[11px] leading-relaxed ${alertData.mortality_risk_level === '심각' || alertData.mortality_risk_level === '고위험' ? 'text-rose-200/80' : 'text-yellow-200/80'}`}>
              {alertData.actionable_insight}
            </p>
          </div>
        </div>
      ) : null}

      <div className="bg-[#0A0F1A]/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Cpu className="text-violet-400" />
          AI Synthetic Data Generator
        </h2>
        <p className="text-[11px] text-slate-400 mb-5 leading-relaxed">
          AgiBot Genie Sim, Hugging Face LeRobot EnvHub, RoboCasa 기반 오픈소스 시뮬레이션 환경. 농기계 자율주행 및 수확 로봇 비전 학습용 합성 데이터를 지역 농가에 무료로 제공합니다.
        </p>

        {/* Sim Terminal / Log View */}
        <div className="bg-[#05080F] border border-slate-800 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Database size={12} /> LeRobot EnvHub Active
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] text-emerald-400">Generating</span>
            </span>
          </div>
          <div className="font-mono text-[10px] text-emerald-500/80 space-y-1 h-24 overflow-hidden relative">
            <p>{`> [EnvHub] Loading scenario: 'apple_orchard_harvest'`}</p>
            <p>{`> [Genie Sim] Initializing robot kinematics... OK`}</p>
            <p>{`> [RoboCasa] Rendering textures (lighting: overcast)`}</p>
            <p>{`> [Pipeline] Generating 10,000 synthetic vision frames...`}</p>
            <p>{`> Batch 1/100 complete. Saving to /data/synthetic/`}</p>
            <p className="animate-pulse">{`> Processing...`}</p>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#05080F] to-transparent"></div>
          </div>
        </div>

        {/* Phase 4: Commercial Data Hub Export Actions */}
        <div className="flex gap-2 mb-4">
          <button 
            onClick={async () => {
              try {
                const res = await axios.get(`${API_BASE_URL}/api/v1/data-marketplace/export/synthetic-yield`, {
                  headers: { 'x-api-key': 'mdga-b2b-snowflake-key' },
                  responseType: 'blob'
                });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'mdga_synthetic_yield_export.csv');
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
              } catch(e) { console.error(e); }
            }}
            className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Database size={14} /> Snowflake 연동 (CSV)
          </button>
          <button 
            onClick={async () => {
              try {
                const res = await axios.get(`${API_BASE_URL}/api/v1/data-marketplace/export/ai-ready-vision`, {
                  headers: { 'x-api-key': 'mdga-b2b-aihub-key' },
                  responseType: 'blob'
                });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'mdga_ai_ready_vision_logs.jsonl');
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
              } catch(e) { console.error(e); }
            }}
            className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Database size={14} /> AI Hub 납품 (JSONL)
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50 flex flex-col justify-center">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Activity size={12} /> 수확량 예측 ({yieldData?.yield_change_percent > 0 ? '+' : ''}{yieldData?.yield_change_percent}%)
            </div>
            <div className="text-sm font-bold text-white truncate">{yieldData ? `${yieldData.predicted_yield_kg}kg` : '계산 중...'}</div>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50 flex flex-col justify-center">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CloudRain size={12} /> 위기경보 ({yieldData?.oversupply_risk_level})
            </div>
            <div className="text-[10px] text-white truncate max-w-full" title={yieldData?.actionable_insight}>{yieldData ? yieldData.actionable_insight : '분석 중...'}</div>
          </div>
        </div>

        {/* Resource Efficiency (A-5) */}
        {resourceData && (
          <div className="bg-emerald-900/10 rounded-xl p-3 border border-emerald-500/30">
            <div className="text-[10px] text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1 font-bold">
              <Leaf size={12} /> 탄소 저감형 자원 투입 가이드
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-[11px] text-slate-300 leading-relaxed">
                  {resourceData.actionable_insight}
                </div>
              </div>
              <div className="shrink-0 text-center bg-[#0A0F1A] p-2 rounded-lg border border-emerald-500/20">
                <div className="text-[9px] text-slate-500 mb-0.5">탄소 발자국</div>
                <div className="text-sm font-black text-emerald-400">{resourceData.carbon_footprint_reduction}%</div>
                <div className="text-[8px] text-emerald-500/70">절감 기대</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
