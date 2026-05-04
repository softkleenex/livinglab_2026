import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, PackageOpen, ArrowRight, MapPin, Recycle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

export default function B2BMarket({ addToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('b_grade'); // 'b_grade' or 'reverse_logistics'

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const categoryParam = activeTab === 'b_grade' ? 'b_grade_crop' : 'urban_byproduct';
        const res = await axios.get(`${API_BASE_URL}/api/v1/b2b-market/products`, {
          params: { category: categoryParam }
        });
        
        if (res.data?.status === 'success') {
          let mappedItems = res.data.products.map(p => ({
            id: p.id,
            title: p.title,
            seller: activeTab === 'b_grade' ? '지역 농가' : '도심 소상공인',
            location: '대구/경북 일대',
            price: p.price === 0 ? '무료 나눔' : `${p.price.toLocaleString()}원`,
            originalPrice: p.price === 0 ? null : `${(p.price * 2).toLocaleString()}원`,
            match: p.ai_recommendation || (activeTab === 'b_grade' ? '가공용으로 적합' : '친환경 퇴비 원료'),
            status: p.stock > 0 ? 'available' : 'matched',
            imageUrl: p.image_url || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23facc15;stop-opacity:1" /><stop offset="100%" style="stop-color:%23a16207;stop-opacity:1" /></linearGradient></defs><rect width="200" height="200" fill="url(%23grad)" /><text x="50%" y="50%" font-family="sans-serif" font-size="24" font-weight="bold" fill="white" dominant-baseline="middle" text-anchor="middle">상품</text></svg>`
          }));

          // Mock fallback if DB is empty for urban_byproduct
          if (mappedItems.length === 0 && activeTab === 'reverse_logistics') {
            mappedItems = [
              {
                id: 'mock-1',
                title: "수성구 대형카페 커피찌꺼기 100kg",
                seller: "도심 카페",
                location: "대구 수성구",
                price: "무료 나눔",
                originalPrice: null,
                match: "사과/배 과수원 친환경 퇴비 원료",
                status: "available",
                imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2378350f;stop-opacity:1" /><stop offset="100%" style="stop-color:%23451a03;stop-opacity:1" /></linearGradient></defs><rect width="200" height="200" fill="url(%23grad4)" /><text x="50%" y="50%" font-family="sans-serif" font-size="20" font-weight="bold" fill="white" dominant-baseline="middle" text-anchor="middle">커피박</text></svg>'
              },
              {
                id: 'mock-2',
                title: "식품공장 콩비지 2톤 (매주 배출)",
                seller: "두부 공장",
                location: "대구 성서산단",
                price: "50,000원",
                originalPrice: "150,000원",
                match: "한우/돼지 축산 농가 특식 사료",
                status: "available",
                imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23fef3c7;stop-opacity:1" /><stop offset="100%" style="stop-color:%23d97706;stop-opacity:1" /></linearGradient></defs><rect width="200" height="200" fill="url(%23grad5)" /><text x="50%" y="50%" font-family="sans-serif" font-size="20" font-weight="bold" fill="white" dominant-baseline="middle" text-anchor="middle">콩비지</text></svg>'
              }
            ];
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
          onClick={() => setActiveTab('b_grade')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-bold transition-all ${
            activeTab === 'b_grade' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <ShoppingCart size={14} /> 못난이 농작물 B2B
        </button>
        <button
          onClick={() => setActiveTab('reverse_logistics')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-bold transition-all ${
            activeTab === 'reverse_logistics' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Recycle size={14} /> 도심 부산물 역순환
        </button>
      </div>

      <div className="bg-[#0A0F1A]/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {activeTab === 'b_grade' ? <ShoppingCart className="text-yellow-400" /> : <Recycle className="text-emerald-400" />}
            {activeTab === 'b_grade' ? 'B-grade Crop Market' : 'Reverse Logistics'}
          </h2>
          <button className={`text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider ${activeTab === 'b_grade' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            판매 등록
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mb-5 leading-relaxed min-h-[36px]">
          {activeTab === 'b_grade' 
            ? "상품성이 낮은 '못난이 농작물'의 상태를 AI가 분석하여, 가공 원료로 활용할 수 있는 지역 소상공인과 매칭해 줍니다."
            : "도심에서 발생하는 유기성 부산물(커피박, 비지 등)을 농가의 친환경 퇴비/사료 원료로 연결하여 탄소 배출을 줄입니다."}
        </p>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-sm text-slate-500 py-10 animate-pulse">상품 목록을 불러오는 중입니다...</div>
          ) : items.length === 0 ? (
            <div className="text-center text-sm text-slate-500 py-10 bg-[#0A0F1A]/50 rounded-xl border border-slate-800/50">
              현재 등록된 상품이 없습니다.
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
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#05080F]"></div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {item.seller} · {item.location}
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          {item.originalPrice && <span className="text-[10px] text-slate-500 line-through mr-1">{item.originalPrice}</span>}
                          <span className={`text-xs font-bold ${activeTab === 'b_grade' ? 'text-yellow-400' : 'text-emerald-400'}`}>{item.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-900/10 border-t border-slate-800 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-medium text-slate-300">
                      <PackageOpen size={12} className="text-blue-400" /> AI 매칭 추천
                      <ArrowRight size={10} className="text-slate-500" />
                      <span className="text-blue-300">{item.match}</span>
                    </div>
                    <button 
                      onClick={() => addToast("거래 요청이 전송되었습니다.", "success")}
                      className={`text-[10px] px-3 py-1 rounded-md font-bold ${item.status === 'matched' ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                      disabled={item.status === 'matched'}
                    >
                      {item.status === 'matched' ? '거래 완료' : '제안하기'}
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
