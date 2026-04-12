import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function PulseChart({ data, color, title, subtitle }) {
  if (!data || data.length === 0) return null;

  // Format data for Recharts: [{ name: 'Day 1', value: 65 }, ...]
  const chartData = data.map((val, index) => ({
    name: `D-${data.length - index - 1}`,
    value: val
  }));

  const minVal = Math.min(...data) - 5;
  const maxVal = Math.max(...data) + 5;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-lg mt-6 relative overflow-hidden group">
      {/* Decorative gradient blur */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ backgroundColor: color }}></div>
      
      <div className="flex justify-between items-end mb-4 relative z-10">
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">{title || "Activity Trend"}</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-1">{subtitle || "Recent 8 cycles pulse variation"}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black" style={{ color }}>
            {data[data.length - 1]} <span className="text-[10px] text-slate-500 font-bold uppercase">BPM</span>
          </span>
        </div>
      </div>

      <div className="h-40 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`colorGradient_${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#334155" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis domain={[minVal, maxVal]} stroke="#334155" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0E1420', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', color: '#f8fafc' }}
              itemStyle={{ color: color }}
              cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#colorGradient_${color.replace('#','')})`} 
              activeDot={{ r: 6, fill: color, stroke: '#0E1420', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}