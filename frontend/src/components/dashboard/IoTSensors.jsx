import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Droplets, Wind, Zap } from 'lucide-react';

export default function IoTSensors({ industry }) {
  const isFarmOrFactory = industry && (industry.includes('스마트팜') || industry.includes('농업') || industry.includes('제조'));
  
  if (!isFarmOrFactory) return null;

  const [sensors, setSensors] = useState([
    { id: 1, label: "내부 온도", value: 24.5, unit: "°C", icon: Thermometer, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    { id: 2, label: "토양 습도", value: 68.2, unit: "%", icon: Droplets, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { id: 3, label: "CO2 농도", value: 450, unit: "ppm", icon: Wind, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { id: 4, label: "전력 소모량", value: 1.2, unit: "kW", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => prev.map(s => {
        const fluctuation = (Math.random() - 0.5) * (s.id === 3 ? 10 : 0.5);
        return { ...s, value: Math.max(0, s.value + fluctuation) };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Zap size={14} className="text-yellow-500" /> IoT Sensor Telemetry
        </h3>
        <span className="flex items-center gap-1.5 text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sensors.map(s => {
          const Icon = s.icon;
          return (
            <motion.div key={s.id} className={`${s.bg} ${s.border} border p-3 rounded-xl flex flex-col justify-center`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={12} className={s.color} />
                <span className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-black ${s.color} font-mono tracking-tighter`}>
                  {s.id === 3 ? Math.floor(s.value) : s.value.toFixed(1)}
                </span>
                <span className="text-[9px] font-bold text-slate-500">{s.unit}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}