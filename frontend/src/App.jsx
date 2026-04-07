import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  Activity, 
  BrainCircuit, 
  Zap,
  ArrowUpRight,
  Target,
  BarChart3,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [industry, setIndustry] = useState('ABB');
  const [district, setDistrict] = useState('북구');
  const [rawData, setRawData] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [stats, setStats] = useState({ total_nodes: 0, growth: "+1.2%" });

  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/community`);
        setStats(prev => ({ ...prev, total_nodes: res.data.length }));
      } catch (err) { console.error(err); }
    };
    init();
  }, []);

  const handleRunAnalysis = async () => {
    if (!rawData) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/analyze`, {
        industry, district, street: '경북대 북문', raw_data: rawData
      });
      setAnalysis(res.data.insights);
      setActiveTab('result');
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-[#0F172A] text-white flex flex-col shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10 text-blue-400">
            <BrainCircuit size={36} strokeWidth={2.5} />
            <span className="text-2xl font-black tracking-tighter">MDGA</span>
          </div>
          
          <nav className="space-y-2">
            <NavBtn active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Activity size={20}/>} label="대구 시티 펄스" />
            <NavBtn active={activeTab === 'analyze'} onClick={() => setActiveTab('analyze')} icon={<Target size={20}/>} label="데이터 분석 & 기여" />
            <NavBtn active={activeTab === 'network'} onClick={() => setActiveTab('network')} icon={<Users size={20}/>} label="상생 매치메이커" />
            <NavBtn active={activeTab === 'gov'} onClick={() => setActiveTab('gov')} icon={<BarChart3 size={20}/>} label="거버넌스 리포트" />
          </nav>
        </div>
        
        <div className="mt-auto p-8 bg-slate-800/50">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Ecosystem Power</div>
          <div className="space-y-3">
            <StatRow label="ABB Node" value={stats.total_nodes} />
            <StatRow label="Regional Trust" value="94.8%" />
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
            <Globe size={18} className="text-blue-600" />
            <span className="uppercase tracking-widest">Daegu Strategic Dashboard</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />)}
            </div>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              Live Monitor
            </button>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="p-10 max-w-7xl mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <HighlightCard title="ABB 산업 활성도" value="High" sub="대구광역시 주도" color="bg-blue-500" />
                  <HighlightCard title="실시간 유동인구" value="24.5k" sub="중구 동성로 기준" color="bg-indigo-500" />
                  <HighlightCard title="데이터 신뢰 지수" value="AA+" sub="Blockchain Verified" color="bg-emerald-500" />
                </div>
                
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative group">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-2">무엇을 도와드릴까요?</h3>
                    <p className="text-slate-500 mb-8 max-w-lg">대구의 파편화된 현장 데이터를 비즈니스 전략으로 전환합니다. 지금 분석을 시작하고 지역 상생 에코시스템에 기여하세요.</p>
                    <button onClick={() => setActiveTab('analyze')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:gap-5 transition-all">
                      데이터 분석 엔진 가동 <ArrowUpRight size={20} />
                    </button>
                  </div>
                  <BrainCircuit size={300} className="absolute -right-20 -bottom-20 text-slate-50 opacity-[0.03] group-hover:text-blue-50 group-hover:opacity-100 transition-all duration-700" />
                </div>
              </motion.div>
            )}

            {activeTab === 'analyze' && (
              <motion.div key="analyze" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
                <div className="bg-white p-10 rounded-[2rem] shadow-2xl border border-white space-y-8">
                  <div className="text-center space-y-2">
                    <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-3xl mb-4"><Zap size={32} /></div>
                    <h3 className="text-3xl font-black">AI 전략 솔루션</h3>
                    <p className="text-slate-400">데이터를 입력하면 ABB 엔진이 즉시 가동됩니다.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase ml-1">산업 분야</label>
                        <select value={industry} onChange={(e)=>setIndustry(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold">
                          <option>ABB</option><option>로봇</option><option>외식업</option><option>카페</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase ml-1">소속 구역</label>
                        <select value={district} onChange={(e)=>setDistrict(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold">
                          <option>북구</option><option>수성구</option><option>중구</option><option>달서구</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase ml-1">현장 로그 입력</label>
                      <textarea value={rawData} onChange={(e)=>setRawData(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 focus:border-blue-500 focus:bg-white outline-none transition-all min-h-[200px] font-medium leading-relaxed" placeholder="오늘의 매출, 손님들의 반응, 혹은 해결하고 싶은 고민을 자유롭게 기록하세요." />
                    </div>
                    
                    <button onClick={handleRunAnalysis} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:opacity-50">
                      {loading ? "ABB 엔진 연산 중..." : "전략 리포트 생성 및 기여"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 min-h-[600px] prose prose-slate max-w-none">
                  <div className="flex items-center gap-2 mb-8 text-blue-600 font-black tracking-tighter">
                    <BrainCircuit size={24} /> <span>MDGA MASTER ANALYSIS</span>
                  </div>
                  {analysis ? analysis.split('\n').map((l, i) => <p key={i}>{l}</p>) : "No results yet."}
                </div>
                <div className="space-y-6">
                  <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl">
                    <h4 className="text-xl font-bold mb-4">상권 기여도</h4>
                    <p className="text-slate-400 text-sm mb-6">사장님의 데이터가 방금 <b>{district}</b> 지역 정책 보정 데이터로 합류되었습니다.</p>
                    <div className="flex items-center justify-between text-3xl font-black text-blue-400">
                      <span>Tier 1</span>
                      <ArrowUpRight size={32} />
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('network')} className="w-full py-6 bg-white border-2 border-slate-200 rounded-[2rem] font-black text-slate-800 hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-3">
                    <Users size={20} /> 상생 파트너 찾기
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon} <span>{label}</span>
    </button>
  );
}

function HighlightCard({ title, value, sub, color }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</div>
      <div className={`text-4xl font-black my-2`}>{value}</div>
      <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${color}`} /> {sub}
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm font-bold">
      <span className="text-slate-500">{label}</span>
      <span className="text-blue-400">{value}</span>
    </div>
  );
}

export default App;
