import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, PackageOpen, ArrowRight, MapPin, Database } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

export default function B2BMarket({ addToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('synthetic_data'); // 'synthetic_data' or 'raw_data'

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const categoryParam = activeTab === 'synthetic_data' ? 'synthetic_data' : 'raw_data';
        const res = await axios.get(`${API_BASE_URL}/api/v1/b2b-market/products`, {
          params: { category: categoryParam }
        });
        
        if (res.data?.status === 'success') {
          let mappedItems = res.data.products.map(p => ({
            id: p.id,
            title: p.title,
            seller: '지역 농가 및 MDGA',
            location: '대구/경북 일대',
            price: p.price === 0 ? '협의' : `${p.price.toLocaleString()}원`,
            originalPrice: p.price === 0 ? null : `${(p.price * 1.5).toLocaleString()}원`,
            match: p.ai_recommendation || (activeTab === 'synthetic_data' ? '기후/생육 AI 모델 학습용' : '농기계 센서 분석용'),
            status: p.stock > 0 ? 'available' : 'matched',
            imageUrl: p.image_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop'
          }));

          // Fallback if DB is empty
          if (mappedItems.length === 0) {
            if (activeTab === 'synthetic_data') {
              mappedItems = [
                {
                  id: 'synth-1',
                  title: "대구 사과 기후변화 대응 합성 데이터셋 (10만 건)",
                  seller: "경북대 사과 센터 연계",
                  location: "대구광역시",
                  price: "1,500,000원",
                  originalPrice: "2,000,000원",
                  match: "아열대화 기후 예측 모델 학습",
                  status: "available",
                  imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=600&auto=format&fit=crop'
                },
                {
                  id: 'synth-2',
                  title: "스마트팜 환경-생육 상관관계 결합 데이터 (API)",
                  seller: "MDGA Data Hub",
                  location: "경북 의성군",
                  price: "구독형 (월 50만원)",
                  originalPrice: null,
                  match: "농업용 AI 에이전트 RAG 파이프라인",
                  status: "available",
                  imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop'
                }
              ];
            } else {
              mappedItems = [
                {
                  id: 'raw-1',
                  title: "자율주행 트랙터 일일 가동 및 토양 압축 센서 로그",
                  seller: "안동 청년 농부 연합",
                  location: "경북 안동시",
                  price: "300,000원",
                  originalPrice: null,
                  match: "농기계 제조사 R&D 부서",
                  status: "available",
                  imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop'
                }
              ];
            }
          }

          setItems(mappedItems);
        }
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeTab]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-4 h-full pb-10"
    >
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[#0A0F1A] border border-slate-800 rounded-xl mb-1">
        <button
          onClick={() => setActiveTab('synthetic_data')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-bold transition-all ${
            activeTab === 'synthetic_data' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Database size={14} /> AI 합성 데이터
        </button>
        <button
          onClick={() => setActiveTab('raw_data')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-bold transition-all ${
            activeTab === 'raw_data' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <MapPin size={14} /> 농기계/생육 Raw Data
        </button>
      </div>

      <div className="bg-[#0A0F1A]/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {activeTab === 'synthetic_data' ? <Database className="text-blue-400" /> : <MapPin className="text-emerald-400" />}
            {activeTab === 'synthetic_data' ? 'Synthetic Data Market' : 'Raw Data Hub'}
          </h2>
          <button className={`text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider ${activeTab === 'synthetic_data' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            데이터 구독
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mb-5 leading-relaxed min-h-[36px]">
          {activeTab === 'synthetic_data' 
            ? "농기계 가동 데이터와 작물 생육 지표를 결합해 생성된 고품질의 합성 데이터(Synthetic Data)를 연구 기관 및 AI 기업에 제공합니다."
            : "개별 농가에서 수집된 파편화된 농기계 로그와 수기 영농일지 등의 원시 데이터(Raw Data)를 안전하게 거래할 수 있습니다."}
        </p>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-sm text-slate-500 py-10 animate-pulse">데이터 상품을 불러오는 중입니다...</div>
          ) : items.length === 0 ? (
            <div className="text-center text-sm text-slate-500 py-10 bg-[#0A0F1A]/50 rounded-xl border border-slate-800/50">
              현재 등록된 데이터 상품이 없습니다.
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id} 
                  className="bg-[#05080F] border border-slate-800/60 rounded-xl overflow-hidden flex flex-col"
                >
                  <div className="flex h-24">
                    <div className="w-24 shrink-0 relative">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#05080F]"></div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{item.title}</h3>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {item.seller} · {item.location}
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          {item.originalPrice && <span className="text-[10px] text-slate-500 line-through mr-1">{item.originalPrice}</span>}
                          <span className={`text-xs font-bold ${activeTab === 'synthetic_data' ? 'text-blue-400' : 'text-emerald-400'}`}>{item.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-900/10 border-t border-slate-800 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-medium text-slate-300">
                      <PackageOpen size={12} className="text-blue-400" /> AI 매칭 추천
                      <ArrowRight size={10} className="text-slate-500" />
                      <span className="text-blue-300 truncate max-w-[120px]">{item.match}</span>
                    </div>
                    <button 
                      onClick={() => addToast("데이터 구매 요청이 전송되었습니다.", "success")}
                      className={`text-[10px] px-3 py-1 rounded-md font-bold whitespace-nowrap ${item.status === 'matched' ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                      disabled={item.status === 'matched'}
                    >
                      {item.status === 'matched' ? '거래 완료' : '샘플 요청'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}
