import React, { useState } from 'react';
import axios from 'axios';
import { Upload, X, ShieldCheck, RefreshCw, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com';

export default function IngestModal({ isGuest, onClose, onSuccess, locationPath, childOptions = [], addToast }) {
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  
  const [selectedPath, setSelectedPath] = useState(locationPath);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleIngest = async () => {
    setLoading(true);
    const formData = new FormData();
    if (rawText) formData.append('raw_text', rawText);
    if (file) formData.append('file', file);
    formData.append('location', selectedPath);
    if (isGuest) formData.append('is_guest', 'true');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/ingest`, formData);
      setRes(response.data);
      setTimeout(() => onSuccess(response.data.value_added), 2500);
    } catch (err) { 
      addToast("업로드에 실패했습니다. 사진 용량이나 네트워크를 확인해주세요.", "error"); 
    }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0A0F1A]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#101725] w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-[#0E1420]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white"><Upload size={18}/></div>
            <h3 className="text-base font-bold text-white uppercase">Data & Vision Ingest</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20}/></button>
        </div>
        <div className="p-5 space-y-4">
          {!res ? (
            <>
              {childOptions && childOptions.length > 0 && (
                <div className="space-y-1 mb-2">
                  <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest"><MapPin size={10}/> 업로드 대상 계층 선택</label>
                  <select 
                    value={selectedPath} 
                    onChange={(e) => setSelectedPath(e.target.value)} 
                    className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-xs text-blue-400 focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                  >
                    <option value={locationPath}>🏢 현재 상위 계층 ({locationPath.split('/').pop() || 'Root'}) 전체 공유 데이터로 올리기</option>
                    <optgroup label="👇 하위 특정 계층/상점으로 올리기">
                      {childOptions.map((c, i) => (
                        <option key={i} value={`${locationPath ? locationPath + '/' : ''}${c.name}`}>{c.name} ({c.type})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}
              
              {isGuest ? (
                <p className="text-xs text-orange-400 text-center font-bold">⚠️ 게스트 모드: 업로드되는 데이터는 신뢰도 가중치에서 패널티를 받습니다.</p>
              ) : (
                <p className="text-xs text-emerald-400 text-center font-bold">✨ 구글 공식 인증 계정: 업로드 데이터에 높은 신뢰도 가중치가 부여됩니다.</p>
              )}
              <p className="text-xs text-slate-400 text-center">텍스트는 물론, 사업장의 전경이나 데이터를 업로드하면 Vision AI가 분석하여 자산화합니다.</p>
              
              {preview && (
                <div className="relative w-full h-32 bg-black rounded-xl overflow-hidden border border-slate-800">
                  <img src={preview} alt="preview" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-900/30">
                    <span className="bg-[#0A0F1A]/80 text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm border border-blue-500/30">Vision AI Ready</span>
                  </div>
                </div>
              )}
              
              <textarea value={rawText} onChange={e=>setRawText(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-200" rows={preview ? 2 : 4} placeholder="여기에 텍스트 상황을 입력하세요..." />
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-500/10 file:text-blue-400 bg-[#0A0F1A] p-2 rounded-xl border border-slate-800" />
              
              <label className="flex items-start gap-2 opacity-50 cursor-not-allowed">
                <input type="checkbox" disabled checked={false} className="mt-1" />
                <span className="text-xs text-slate-400">다른 사용자의 데이터 다운로드 허용 안 함<br/><span className="text-[10px] text-red-400 font-bold">(현재 개발 중으로 필수 공개 설정됨)</span></span>
              </label>

              <button onClick={handleIngest} disabled={loading || (!rawText && !file)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <RefreshCw className="animate-spin" size={16}/> : "업로드 및 자산화"}
              </button>
            </>
          ) : (
            <div className="py-10 text-center space-y-4">
              <ShieldCheck size={48} className="text-emerald-400 mx-auto" />
              <h4 className="text-lg font-bold text-white">업로드 완료</h4>
              <p className="text-xs text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full inline-block">+ ₩{res.value_added.toLocaleString()} 자산 증가</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}