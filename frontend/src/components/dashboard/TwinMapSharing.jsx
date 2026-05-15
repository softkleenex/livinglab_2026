import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map as MapIcon, ShieldAlert, AlertTriangle, Wind, ThermometerSun } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

// Custom map markers
const createIcon = (color) => new L.DivIcon({
  className: 'custom-icon',
  html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 12px ${color}; border: 2px solid #0A0F1A;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

export default function TwinMapSharing({ userContext }) {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derive coordinates based on user location if possible, else default
  const getMapCenter = () => {
    if (userContext?.location?.includes('대구광역시')) return [35.8714, 128.6014];
    if (userContext?.location?.includes('서울특별시')) return [37.5665, 126.9780];
    return [36.4, 128.65]; // Default center
  };

  const center = getMapCenter();

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/dashboard/twin-map-risks`);
        if (res.data?.status === 'success') {
          setRisks(res.data.risks);
        }
      } catch (err) {
        console.error("Failed to load map risks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRisks();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-4 h-full pb-10"
    >
      <div className="bg-[#0A0F1A]/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <ShieldAlert className="text-rose-400" />
          방역 및 환경 위험 지도
        </h2>
        <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
          차단 방역이 최우선인 농가를 위해, 주변 지역의 전염병 발생 현황과 폭염 등 급격한 환경 변화를 실시간으로 모니터링합니다.
        </p>

        {/* Real Map View */}
        <div className="relative w-full h-48 bg-slate-900 rounded-xl overflow-hidden border border-slate-700/50 mb-4 z-0">
          <MapContainer center={center} zoom={9} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {risks.map(risk => (
              <Marker 
                key={risk.id} 
                position={[risk.lat, risk.lng]}
                icon={createIcon(risk.status === 'critical' ? '#f43f5e' : '#eab308')}
              >
                <Popup className="custom-popup">
                  <div className="text-xs text-slate-800 font-bold">{risk.name}</div>
                  <div className="text-[10px] text-slate-500">{risk.distance}</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">실시간 위험 알림</h3>
          {risks.map((risk) => (
            <div key={risk.id} className="bg-[#05080F] border border-slate-800/60 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${risk.status === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {risk.type === 'disease' ? <AlertTriangle size={18} /> : risk.type === 'weather' ? <ThermometerSun size={18} /> : <Wind size={18} />}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200">{risk.name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapIcon size={10} /> {risk.location}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${risk.status === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {risk.status === 'critical' ? '위험' : '주의'}
                </div>
                <div className="text-[10px] text-slate-400">{risk.distance}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
