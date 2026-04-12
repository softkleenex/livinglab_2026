import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, X, RefreshCw, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com';

export default function ReportModal({ onClose, locationPath, userContext }) {
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(true);

  const isB2B = userContext?.industry && userContext?.industry !== '공공';
  const industryName = userContext?.industry || '비즈니스';

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/dashboard/report?path=${locationPath}&industry=${userContext?.industry || '공공'}`);
        setReport(res.data.report);
      } catch (err) {
        setReport("리포트를 생성하지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [locationPath, isB2B, userContext?.industry]);

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([report], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = isB2B ? `${industryName}_AI_Report_${new Date().toISOString().split('T')[0]}.txt` : `MDGA_주간_경영_리포트_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0A0F1A]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#101725] w-full max-w-lg max-h-[80vh] rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col relative">
        <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-[#0E1420] rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg text-white ${isB2B ? 'bg-emerald-600' : 'bg-blue-600'}`}><FileText size={18}/></div>
            <h3 className="text-base font-bold text-white uppercase">{isB2B ? `AI ${industryName} 데이터 분석 리포트` : '주간 경영 요약 뉴스레터'}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
        </div>
        <div className="p-5 overflow-y-auto grow custom-scrollbar">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-4">
              <RefreshCw className={`animate-spin ${isB2B ? 'text-emerald-500' : 'text-blue-500'}`} size={32}/>
              <p className="text-sm text-slate-400 font-medium">이번 주 데이터를 분석하여 보고서를 작성 중입니다...</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-medium flex-grow mb-6">
                {report}
              </div>
              <button 
                onClick={handleDownload}
                className={`w-full py-3 border rounded-xl font-bold text-sm transition-colors flex justify-center items-center gap-2 mt-auto shrink-0 ${isB2B ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600 hover:text-white' : 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600 hover:text-white'}`}
              >
                <Download size={16} /> 리포트 텍스트 파일로 저장
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
