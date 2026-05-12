import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, X, ArrowUpRight, ArrowDownRight, RefreshCw, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

export default function WalletModal({ onClose, balance }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/dashboard/wallet/transactions`);
        if (res.data?.status === 'success') {
          setTransactions(res.data.transactions);
        }
      } catch (err) {
        console.error("Failed to load transactions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0A0F1A]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#101725] w-full max-w-md rounded-3xl border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col max-h-[90vh] relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-600"></div>

        <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-[#0E1420]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400"><Wallet size={18}/></div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">MDGA Wallet</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
        </div>

        <div className="p-6 bg-gradient-to-b from-[#0E1420] to-[#101725] flex flex-col items-center justify-center border-b border-slate-800/80 relative">
          <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full"></div>
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Total Balance</p>
          <div className="text-4xl font-black text-white flex items-center gap-2">
            <span className="text-indigo-500 text-2xl">🪙</span>
            {balance.toLocaleString()}
          </div>
        </div>

        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity size={14} /> Transaction History
          </h4>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-indigo-500/50">
              <RefreshCw className="animate-spin mb-2" size={24} />
              <span className="text-xs">내역을 불러오는 중...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-10 bg-[#0A0F1A]/50 rounded-xl border border-slate-800/50">
              거래 내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-[#0A0F1A] border border-slate-800/80 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {tx.amount > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-200">{tx.description}</div>
                      <div className="text-[10px] text-slate-500">{tx.timestamp}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-black ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}