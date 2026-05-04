import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ShieldCheck, RefreshCw, Filter, Leaf, Tractor, Trash2, ArrowRight, Sparkles, Map } from 'lucide-react';
import DigitalTwinMap from './DigitalTwinMap.jsx';

const Badge = React.memo(({ label, icon, color }) => {
  return (
    <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-default ${color}`}>
      {icon} {label}
    </div>
  );
});

export default function DataMarket({ addToast, userContext, setWalletBalance }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '', category: 'b_grade_crop', description: '', price: '', stock: 1
  });

  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://mdga-api.onrender.com').replace(/\/$/, '');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/b2b-market/products`);
      setProducts(res.data.products);
    } catch(err) {
      addToast("상품 목록을 불러오지 못했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleBuy = async (product) => {
    setBuyingId(product.id);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/b2b-market/matchings?product_id=${product.id}&quantity=1&message=Buy Request`);
      addToast("매칭 요청이 완료되었습니다!", "success");
      fetchProducts();
    } catch(err) {
      addToast(err.response?.data?.detail || "구매 중 오류가 발생했습니다.", "error");
    } finally {
      setBuyingId(null);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/b2b-market/products?title=${encodeURIComponent(newProduct.title)}&category=${encodeURIComponent(newProduct.category)}&description=${encodeURIComponent(newProduct.description)}&price=${newProduct.price}&stock=${newProduct.stock}`);
      addToast("성공적으로 상품을 등록했습니다.", "success");
      setShowRegisterForm(false);
      fetchProducts();
    } catch(err) {
      addToast("상품 등록 중 오류가 발생했습니다.", "error");
    } finally {
      setRegistering(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (filterCategory === 'all') return products;
    return products.filter(p => p.category === filterCategory);
  }, [products, filterCategory]);

  const mapData = useMemo(() => {
    // Generate mock locations around Daegu for demo purposes
    const baseLat = 35.8714;
    const baseLng = 128.6014;
    return filteredProducts.map((p, idx) => ({
      name: p.title,
      value: p.price,
      pulse: p.stock,
      location: [
        baseLat + (Math.random() - 0.5) * 0.05,
        baseLng + (Math.random() - 0.5) * 0.05
      ]
    }));
  }, [filteredProducts]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto w-full pb-10">
      <div className="flex flex-col gap-2 px-4 ">
        <div className="flex items-center gap-3">
          <Badge label="B2B MARKET" color="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" />
          <Badge label="TWIN MAP CONNECTED" color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Resource Reverse Logistics</h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
              B급 농산물(B-1), 동네 식자재 공동구매(B-2), 유휴 농기계 쉐어링(B-4), 부산물 역순환(B-5) 매칭
            </p>
          </div>
          <button onClick={() => setShowRegisterForm(!showRegisterForm)} className="text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors">
            {showRegisterForm ? "닫기" : "자원 등록하기"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showRegisterForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-4">
            <div className="bg-[#101725] p-6 rounded-2xl border border-slate-800 shadow-xl mb-6">
              <h3 className="text-sm font-bold text-white mb-4">자원 등록 및 AI 검수</h3>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">제목</label>
                    <input type="text" required value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} className="w-full bg-[#0A0F1A] border border-slate-700 rounded-lg p-2.5 text-sm text-white" placeholder="예: 못난이 사과 10kg, 유휴 트랙터" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">카테고리</label>
                    <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-[#0A0F1A] border border-slate-700 rounded-lg p-2.5 text-sm text-white">
                      <option value="b_grade_crop">B급 농산물 (B-1)</option>
                      <option value="co-purchase">식자재 공동구매 (B-2)</option>
                      <option value="machinery">유휴 농기계 쉐어링 (B-4)</option>
                      <option value="byproduct">도심 부산물 역순환 (B-5)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">단가/비용 (원)</label>
                    <input type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-[#0A0F1A] border border-slate-700 rounded-lg p-2.5 text-sm text-white" placeholder="무상일 경우 0" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">제공 수량</label>
                    <input type="number" required min="1" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full bg-[#0A0F1A] border border-slate-700 rounded-lg p-2.5 text-sm text-white" placeholder="1" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">상세 설명</label>
                  <textarea required rows="3" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-[#0A0F1A] border border-slate-700 rounded-lg p-2.5 text-sm text-white" placeholder="자원의 상태 및 픽업 가능 시간을 적어주세요."></textarea>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={registering} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">
                    {registering ? <RefreshCw size={14} className="animate-spin"/> : <ShieldCheck size={14}/>}
                    AI 1차 검수 및 등록
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4">
         <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button onClick={() => setFilterCategory('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${filterCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>전체 보기</button>
            <button onClick={() => setFilterCategory('b_grade_crop')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${filterCategory === 'b_grade_crop' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>B급 농산물 (B-1)</button>
            <button onClick={() => setFilterCategory('co-purchase')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${filterCategory === 'co-purchase' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>공동구매 (B-2)</button>
            <button onClick={() => setFilterCategory('machinery')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${filterCategory === 'machinery' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>농기계 쉐어 (B-4)</button>
            <button onClick={() => setFilterCategory('byproduct')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${filterCategory === 'byproduct' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>부산물 수거 (B-5)</button>
         </div>

         {!loading && filteredProducts.length > 0 && (
           <div className="mb-6">
             <div className="flex items-center gap-2 mb-2 px-1">
               <Map size={14} className="text-emerald-400" />
               <span className="text-xs font-bold text-slate-300">트윈 맵 실시간 위치</span>
             </div>
             <DigitalTwinMap childrenData={mapData} />
           </div>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
        {loading ? (
           <div className="col-span-2 flex justify-center py-20 text-slate-500">
             <RefreshCw size={24} className="animate-spin" />
           </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-2 bg-[#101725] p-10 rounded-2xl border border-slate-800 text-center text-slate-400 text-sm">
            등록된 자원이 없습니다.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <motion.div key={product.id} whileHover={{ y: -2 }} className="bg-[#101725] p-5 rounded-2xl border border-slate-800 shadow-md hover:border-indigo-500/30 transition-all group flex flex-col gap-4 justify-between items-start">
              <div className="w-full space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{product.title}</h3>
                  <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-bold tracking-wider uppercase">{product.category}</span>
                </div>
                {product.ai_grade && (
                  <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-3">
                    <p className="text-[10px] text-indigo-400 font-bold mb-1 flex items-center gap-1"><Sparkles size={12}/> AI Vision Analysis</p>
                    <p className="text-xs text-slate-300">검수 등급: <span className="font-black text-white">{product.ai_grade}</span></p>
                    <p className="text-xs text-slate-400 mt-1">{product.ai_recommendation}</p>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <p className="text-sm font-black text-yellow-400">{product.price === 0 ? '무상 제공' : `${product.price.toLocaleString()} 원`}</p>
                  <p className="text-xs text-slate-500">남은 수량/기간: <span className="text-white font-bold">{product.stock}</span></p>
                </div>
              </div>
              <button onClick={() => handleBuy(product)} disabled={buyingId === product.id || product.stock <= 0} className="w-full py-2.5 bg-slate-800 hover:bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                {buyingId === product.id ? <RefreshCw size={14} className="animate-spin"/> : <ShoppingCart size={14}/>} 
                {product.category === 'co-purchase' ? '공동구매 참여' : product.stock <= 0 ? '완료됨' : '매칭/수거 신청'}
              </button>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
