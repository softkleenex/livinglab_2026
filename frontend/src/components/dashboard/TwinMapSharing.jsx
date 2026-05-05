import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map as MapIcon, Navigation, UserCheck, Truck, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

// Custom map markers
const createIcon = (color) => new L.DivIcon({
  className: 'custom-icon',
  html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 10px ${color}; border: 2px solid #0A0F1A;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

export default function TwinMapSharing() {
  // Active tracking data for assets
  const assets = [
    { id: 1, type: 'tractor', name: '자율주행 트랙터 A호', status: 'available', location: '경상북도 안동시 구시장길 10', price: '50,000원/일', lat: 36.5684, lng: 128.7296 },
    { id: 2, type: 'drone', name: '방제용 드론 B호', status: 'in_use', location: '경상북도 의성군 풍산리', price: '30,000원/일', lat: 36.3524, lng: 128.6970 },
    { id: 3, type: 'labor', name: '수확 전문 인력 (3명)', status: 'available', location: '대구광역시 군위군', price: '협의', lat: 36.2428, lng: 128.5728 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-4 h-full"
    >
      <div className="bg-[#0A0F1A]/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <MapIcon className="text-emerald-400" />
          Twin Map Infra Sharing
        </h2>
        <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
          농기계 유휴 시간과 인력 현황을 지도에서 실시간으로 확인하고 공유하세요. AI Copilot에게 대여 일정을 요청할 수 있습니다.
        </p>

        {/* Real Map View */}
        <div className="relative w-full h-48 bg-slate-900 rounded-xl overflow-hidden border border-slate-700/50 mb-4 z-0">
          <MapContainer center={[36.4, 128.65]} zoom={9} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {assets.map(asset => (
              <Marker 
                key={asset.id} 
                position={[asset.lat, asset.lng]}
                icon={createIcon(asset.status === 'available' ? '#10b981' : '#f43f5e')}
              >
                <Popup className="custom-popup">
                  <div className="text-xs text-slate-800 font-bold">{asset.name}</div>
                  <div className="text-[10px] text-slate-500">{asset.status === 'available' ? '대여 가능' : '사용 중'}</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">공유 가능한 자원</h3>
          {assets.map((asset) => (
            <div key={asset.id} className="bg-[#05080F] border border-slate-800/60 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${asset.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {asset.type === 'tractor' ? <Truck size={18} /> : asset.type === 'drone' ? <Navigation size={18} /> : <UserCheck size={18} />}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200">{asset.name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapIcon size={10} /> {asset.location}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${asset.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {asset.status === 'available' ? '대여 가능' : '사용 중'}
                </div>
                <div className="text-[10px] text-slate-400">{asset.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
