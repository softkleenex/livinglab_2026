import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Cpu, Database, Activity, AlertTriangle, Droplets, TrendingUp, Package, Leaf, Newspaper, ExternalLink } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

export default function SynthesisInsight({ userContext }) {
  const [alertData, setAlertData] = useState(null);
  const [yieldData, setYieldData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [resourceData, setResourceData] = useState(null);
  const [simLogs, setSimLogs] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const isPigFarm = userContext?.industry?.includes('양돈') || userContext?.industry?.includes('축산');
  const isSmartFarm = userContext?.industry?.includes('스마트팜') || userContext?.industry?.includes('농업');
  const isB2B = userContext?.industry?.includes('기업') || userContext?.industry?.includes('연구');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const region = userContext?.location ? userContext.location.join(' ') : '대구광역시';
        const targetLivestock = userContext?.industry?.includes('양돈') ? '돼지' : (userContext?.industry?.includes('한우') ? '한우' : '가축');
        const targetCrop = userContext?.crop || '상추';

        // Fetch Livestock Alert (for Pigs)
        if (isPigFarm) {
          const alertRes = await axios.get(`${API_BASE_URL}/api/v1/ax-data/livestock-alert`, {
            params: { region, livestock_type: targetLivestock }
          });
          if (alertRes.data?.status === 'success') {
            setAlertData(alertRes.data.data);
          }
        }

        // Fetch Yield Prediction and Sales Data (For Smart Farms)
        if (isSmartFarm || (!isPigFarm && !isB2B)) {
          const yieldRes = await axios.get(`${API_BASE_URL}/api/v1/ax-data/yield-prediction`, {
            params: { region, crop: targetCrop }
          });
          if (yieldRes.data?.status === 'success') {
            setYieldData(yieldRes.data.data);
          }

          const pathStr = userContext?.location ? userContext.location.join('/') : '';
          const salesRes = await axios.get(`${API_BASE_URL}/api/v1/dashboard/sales-insight`, {
            params: { path: pathStr }
          });
          if (salesRes.data?.status === 'success') {
            setSalesData(salesRes.data.data);
          }
          
          const resourceRes = await axios.get(`${API_BASE_URL}/api/v1/ax-data/resource-efficiency`, {
            params: { region, crop: targetCrop }
          });
          if (resourceRes.data?.status === 'success') {
            setResourceData(resourceRes.data.data);
          }
        }

        // Fetch Dynamic Simulation Logs (For B2B/Research)
        if (isB2B || !userContext?.industry) {
          const logsRes = await axios.get(`${API_BASE_URL}/api/v1/ax-data/simulation-logs`);
          if (logsRes.data?.status === 'success') {
            setSimLogs(logsRes.data.logs);
          }
        }
        
        // Fetch Agricultural News
        const newsRes = await axios.get(`${API_BASE_URL}/api/v1/ax-data/news`);
        if (newsRes.data?.status === 'success') {
          setNewsData(newsRes.data.news);
        }

      } catch (err) {
        console.error("Failed to load AX data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userContext, isPigFarm, isSmartFarm, isB2B]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-4 h-full pb-10"
    >
      {loading ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 shadow-lg flex items-center justify-center h-24 animate-pulse">
          <span className="text-sm text-slate-400">AI 분석 중...</span>
        </div>
      ) : (
        <>
          {/* Golden Time Alert Widget (Focused on Pigs/Livestock) */}
          {isPigFarm && (
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
                    <span className={alertData?.water_change_percent < -5 ? 'text-yellow-400' : 'text-emerald-400'}>
                      {alertData?.water_change_percent < -5 ? '주의' : '정상'} (변화율 {alertData?.water_change_percent > 0 ? '+' : ''}{alertData?.water_change_percent || 0}%)
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500">사료 섭취량</span>
                    <span className={alertData?.feed_change_percent < -10 ? 'text-rose-400' : (alertData?.feed_change_percent < -5 ? 'text-yellow-400' : 'text-emerald-400')}>
                      {alertData?.feed_change_percent < -10 ? '심각' : (alertData?.feed_change_percent < -5 ? '주의' : '정상')} (변화율 {alertData?.feed_change_percent > 0 ? '+' : ''}{alertData?.feed_change_percent || 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Smart Farm Views */}
          {(isSmartFarm || (!isPigFarm && !isB2B)) && (
            <>
              <div className="border rounded-2xl p-4 shadow-lg bg-emerald-500/10 border-emerald-500/30 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <Activity className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="text-sm font-bold mb-1 text-emerald-400">농장 생육 환경 모니터링 (정상)</h3>
                    <p className="text-[11px] leading-relaxed text-emerald-200/80">
                      현재 온/습도가 작물 생육에 최적화되어 있습니다.
                    </p>
                  </div>
                </div>
                
                {resourceData && (
                  <div className="bg-[#0A0F1A]/60 rounded-xl p-3 border border-emerald-500/20 flex justify-between items-center mt-1">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest flex items-center gap-1"><CloudRain size={10}/> 권장 관수량</span>
                      <span className="text-xs font-bold text-blue-400 mt-1">{resourceData.water_supply_recommendation_liters} L</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest flex items-center gap-1"><Leaf size={10}/> 예상 탄소 저감</span>
                      <span className="text-xs font-bold text-emerald-400 mt-1">{resourceData.carbon_reduction_kg} kg</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Integrated Sales & Shipment Dashboard */}
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
                    <div className="text-sm font-bold text-white truncate">₩ {salesData?.totalSales || 0}</div>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50 flex flex-col justify-center">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Package size={12} /> 출고 완료 수량
                    </div>
                    <div className="text-sm font-bold text-white truncate">{salesData?.totalShipped || 0} 박스</div>
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
            </>
          )}

          {/* Open Source Synthetic Data Generator (For B2B Buyers) */}
          {isB2B && (
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
                  {simLogs.length > 0 ? simLogs.map((log, i) => (
                    <p key={i}>{log}</p>
                  )) : (
                    <>
                      <p>{`> [EnvHub] Connecting to cluster...`}</p>
                      <p>{`> [Genie Sim] Waiting for initialization...`}</p>
                    </>
                  )}
                  <p className="animate-pulse">{`> Processing...`}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#05080F] to-transparent"></div>
                </div>
              </div>
            </div>
          )}

          {/* Agricultural News Widget */}
          {newsData.length > 0 && (
            <div className="bg-[#0A0F1A]/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg mb-4">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Newspaper className="text-indigo-400" size={18} />
                농업 동향 뉴스
              </h2>
              <div className="space-y-3">
                {newsData.map((news, idx) => (
                  <div key={idx} className="bg-[#05080F] border border-slate-800 rounded-xl p-3 hover:border-indigo-500/50 transition-colors cursor-pointer group flex items-start gap-2">
                    <div className="flex-1">
                      <h4 className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-relaxed">
                        {news.title}
                      </h4>
                      <div className="text-[9px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>{news.source}</span>
                        <span>•</span>
                        <span>{news.time}</span>
                      </div>
                    </div>
                    <ExternalLink size={12} className="text-slate-600 group-hover:text-indigo-400 shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}