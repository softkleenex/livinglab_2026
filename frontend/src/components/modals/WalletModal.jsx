import React from 'react';
import { Coins, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WalletModal({ onClose, personalData }) {
  const balance = personalData ? personalData.store.total_value : 0;
  const history = personalData ? personalData.store.entries : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0A0F1A]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#101725] w-full max-w-sm rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none"><Coins size={200} /></div>
        
        <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-[#0E1420] relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg border border-yellow-500/30 shadow-inner"><Coins size={18}/></div>
            <h3 className="text-base font-black text-white tracking-widest">MDGA WALLET</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
        </div>

        <div className="p-6 relative z-10 bg-gradient-to-b from-[#101725] to-[#0A0F1A]">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-center">Total Balance</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">
              {balance.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-yellow-500/50 mt-2">$MDGA</span>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Transaction History</h4>
            {history.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-4">아직 보상 내역이 없습니다.<br/>데이터를 피딩하고 보상을 받으세요!</p>
            ) : (
              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {[...history].reverse().map((e, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#0E1420] p-3 rounded-xl border border-slate-800/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold">{e.timestamp.split(' ')[0]}</span>
                      <span className="text-xs text-slate-300 font-medium">데이터 피딩 보상</span>
                    </div>
                    <div className="text-sm font-black text-emerald-400">
                      +{e.effective_value ? e.effective_value.toLocaleString() : '1,000'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}