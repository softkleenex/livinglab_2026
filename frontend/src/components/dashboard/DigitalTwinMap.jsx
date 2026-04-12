import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Map } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const customMarkerIcon = new L.DivIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="color: #3b82f6; filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#0A0F1A" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="#3b82f6"/></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

export default function DigitalTwinMap({ childrenData }) {
  if (!childrenData || childrenData.length === 0) return null;

  return (
    <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-800 relative z-0 shadow-inner mb-6">
      <MapContainer center={[35.8714, 128.6014]} zoom={12} style={{ height: '100%', width: '100%', background: '#0A0F1A' }} zoomControl={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {childrenData.map((child) => {
          const latLng = child.location || [35.8714, 128.6014];
          return (
            <Marker key={child.name} position={latLng} icon={customMarkerIcon} />
          );
        })}
      </MapContainer>
      <div className="absolute top-4 left-4 z-[400] pointer-events-none">
         <div className="bg-[#0E1420]/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/50 shadow-xl flex items-center gap-2">
           <Map size={14} className="text-emerald-400"/>
           <span className="text-[10px] font-bold text-slate-300">디지털 트윈 모니터링 (가상 위치)</span>
         </div>
      </div>
    </div>
  );
}