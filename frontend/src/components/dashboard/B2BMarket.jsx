import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, PackageOpen, ArrowRight, MapPin, Database, Sprout } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

export default function B2BMarket({ addToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('synthetic_data'); // 'synthetic_data' or 'b_grade_produce'
  const [apiKey, setApiKey] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);

  const generateApiKey = async () => {
    setGeneratingKey(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`${API_BASE_URL}/api/v1/b2b-market/apikeys`, {}, {
        headers
      });
      if (res.data?.status === 'success') {
        setApiKey(res.data.api_key);
        addToast("API Key가 생성되었습니다.", "success");
      }
    } catch (err) {
      console.error(err);
      addToast("API Key 생성에 실패했습니다.", "error");
    } finally {
      setGeneratingKey(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    addToast("클립보드에 복사되었습니다.", "success");
  };

  const handleBuyRequest = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`${API_BASE_URL}/api/v1/b2b-market/matchings`, null, {
        params: { product_id: productId, quantity: 1, message: "구매 요청합니다." },
        headers
      });
      if (res.data?.status === 'success') {
        addToast("구매 요청이 성공적으로 전송되었습니다.", "success");
        // Update local item status to 'matched'
        setItems(prevItems => prevItems.map(item => item.id === productId ? { ...item, status: 'matched' } : item));
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.detail || "구매 요청에 실패했습니다.", "error");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const categoryParam = activeTab === 'synthetic_data' ? 'synthetic_data' : 'b_grade_produce';
        const res = await axios.get(`${API_BASE_URL}/api/v1/b2b-market/products`, {
          params: { category: categoryParam }
        });
        
        if (res.data?.status === 'success' && res.data.products.length > 0) {
          let mappedItems = res.data.products.map(p => ({
            id: p.id,
            title: p.title,
            seller: '지역 농가 및 MDGA',
            location: '대구/경북 일대',
            price: p.price === 0 ? '협의' : `${p.price.toLocaleString()}원`,
            originalPrice: p.price === 0 ? null : `${(p.price * 1.5).toLocaleString()}원`,
            match: p.ai_recommendation || (activeTab === 'synthetic_data' ? '기후/생육 AI 모델 학습용' : '농기계 센서 분석용'),
            status: p.stock > 0 ? 'available' : 'matched',
            imageUrl: p.image_url || 'https://images.unsplash.com/photo-1586771107445-d3afeb0d2ba1?q=80&w=600&auto=format&fit=crop'
          }));
          setItems(mappedItems);
        } else {
          setItems([]);
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
          onClick={() => setActiveTab('b_grade_produce')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-bold transition-all ${
            activeTab === 'b_grade_produce' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Sprout size={14} /> B급 농산물 직거래
        </button>
      </div>

      {/* API Key Generation Section (Only for Data) */}
      <AnimatePresence>
        {activeTab === 'synthetic_data' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-[#0A0F1A]/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg mb-2 flex flex-col gap-2 overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                🔑 Data API Key
              </h2>
              <button 
                onClick={generateApiKey}
                disabled={generatingKey}
                className="text-[10px] px-3 py-1.5 rounded-lg font-bold bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors disabled:opacity-50"
              >
                {generatingKey ? '생성 중...' : '새 API Key 발급'}
              </button>
            </div>
            {apiKey && (
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 bg-black/50 text-indigo-300 px-3 py-2 rounded text-xs break-all border border-indigo-500/30">
                  {apiKey}
                </code>
                <button onClick={copyApiKey} className="text-xs px-3 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">
                  복사
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#0A0F1A]/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {activeTab === 'synthetic_data' ? <Database className="text-blue-400" /> : <Sprout className="text-orange-400" />}
            {activeTab === 'synthetic_data' ? 'Synthetic Data Market' : '못난이 농작물 B2B 매칭'}
          </h2>
        </div>
        <p className="text-[11px] text-slate-400 mb-5 leading-relaxed min-h-[36px]">
          {activeTab === 'synthetic_data' 
            ? "농가 데이터 기반 고품질 합성 데이터를 연구 기관에 제공합니다."
            : "AI 비전으로 상품성이 낮은 '못난이 농작물'의 상태를 분석하여 지역 소상공인(베이커리, 식당 등)의 가공 원료로 직거래 매칭을 지원합니다."}
        </p>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-sm text-slate-500 py-10 animate-pulse">상품을 불러오는 중입니다...</div>
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
                          <span className={`text-xs font-bold ${activeTab === 'synthetic_data' ? 'text-blue-400' : 'text-orange-400'}`}>{item.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`border-t border-slate-800 p-2 flex items-center justify-between ${activeTab === 'synthetic_data' ? 'bg-blue-900/10' : 'bg-orange-900/10'}`}>
                    <div className="flex items-center gap-2 text-[10px] font-medium text-slate-300">
                      <PackageOpen size={12} className={activeTab === 'synthetic_data' ? 'text-blue-400' : 'text-orange-400'} /> AI 매칭 추천
                      <ArrowRight size={10} className="text-slate-500" />
                      <span className={`${activeTab === 'synthetic_data' ? 'text-blue-300' : 'text-orange-300'} truncate max-w-[120px]`}>{item.match}</span>
                    </div>
                    <button 
                      onClick={() => handleBuyRequest(item.id)}
                      disabled={item.status === 'matched'}
                      className={`text-[10px] px-3 py-1 rounded-md font-bold whitespace-nowrap ${item.status === 'matched' ? 'bg-slate-800 text-slate-500' : (activeTab === 'synthetic_data' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white')}`}
                    >
                      {item.status === 'matched' ? '요청 완료' : '구매 요청'}
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
