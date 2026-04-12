import React, { useState } from 'react';
import { Crown, X, Check, CreditCard, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UpgradeModal({ onClose, addToast }) {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      addToast("PRO 플랜 결제가 완료되었습니다!", "success");
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 2500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0A0F1A]/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#101725] w-full max-w-2xl rounded-3xl border border-violet-500/30 shadow-[0_0_80px_rgba(139,92,246,0.15)] flex flex-col relative overflow-hidden">
        <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none"><Crown size={300} /></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600"></div>

        <button onClick={onClose} className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors z-20"><X size={20}/></button>

        <div className="p-8 md:p-10 relative z-10 flex flex-col items-center text-center">
          <div className="p-4 bg-violet-500/20 text-violet-400 rounded-2xl mb-6 shadow-inner shadow-violet-500/20">
            <Crown size={40} className="drop-shadow-[0_0_15px_rgba(139,92,246,0.8)]"/>
          </div>
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">MDGA <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">PRO</span></h2>
          <p className="text-slate-400 text-sm max-w-md mb-8">모든 데이터를 무제한으로 연동하고, 최고 수준의 AI 모델(Gemini 1.5 Pro)이 생성하는 심층 분석 리포트를 받아보세요.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8 text-left">
            {[
              "무제한 데이터 피딩 및 자산화",
              "주간/월간 심층 AI 경영 리포트",
              "CSV/Excel 데이터 Raw 파일 다운로드",
              "수기 영농일지/장부 AI 비전 스캔",
              "우선순위 고객 지원 (24/7)",
              "지역 정책/예산 배정 우선 매칭 풀 등록"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-[#0E1420] p-3 rounded-xl border border-slate-800">
                <Check size={16} className="text-emerald-400 shrink-0"/>
                <span className="text-[11px] font-bold text-slate-300">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex items-end gap-2 mb-8">
            <span className="text-5xl font-black text-white">₩29,000</span>
            <span className="text-slate-500 font-bold mb-2">/ 월 (VAT 포함)</span>
          </div>

          <AnimatePresence mode="wait">
            {!success ? (
              <motion.button 
                key="pay-btn"
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleSubscribe} 
                disabled={processing} 
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-black text-sm shadow-[0_5px_20px_rgba(139,92,246,0.4)] hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100 flex justify-center items-center gap-2 uppercase tracking-widest"
              >
                {processing ? <RefreshCw className="animate-spin" size={18}/> : <CreditCard size={18}/>}
                {processing ? "Securely Processing..." : "Start PRO 14-Day Free Trial"}
              </motion.button>
            ) : (
              <motion.div 
                key="success-msg"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full py-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl font-black text-sm flex justify-center items-center gap-2 uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                <Check size={18} /> Welcome to PRO
              </motion.div>
            )}
          </AnimatePresence>
          <p className="text-[10px] text-slate-600 mt-4 font-bold uppercase tracking-widest flex items-center gap-1"><Lock size={10}/> Secured by Stripe</p>
        </div>
      </motion.div>
    </motion.div>
  );
}