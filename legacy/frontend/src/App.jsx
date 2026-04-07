import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const sampleDataMap = {
  "외식업 (식당/카페)": JSON.stringify({
    "date": "2026-04-12",
    "daily_sales": 1250000,
    "customer_count": 85,
    "peak_hours": ["12:00", "18:00", "19:00"],
    "popular_items": ["아메리카노", "치즈케이크", "샌드위치"],
    "weather": "맑음",
    "recent_reviews": {
      "positive": 12,
      "negative": 2,
      "common_keywords": ["친절함", "맛있음", "주차공간 부족"]
    }
  }, null, 2),
  "소매업 (의류/잡화)": JSON.stringify({
    "date": "2026-04-12",
    "daily_sales": 2100000,
    "visitor_count": 45,
    "conversion_rate": "35%",
    "top_selling_categories": ["봄 아우터", "에코백"],
    "inventory_warnings": ["여성 M사이즈 티셔츠 재고 부족"],
    "competitor_event": "인근 백화점 봄 정기세일 시작"
  }, null, 2),
  "관광/숙박업": JSON.stringify({
    "date": "2026-04-12",
    "occupancy_rate": "85%",
    "revenue": 3500000,
    "upcoming_bookings_next_7_days": 42,
    "cancellations": 3,
    "guest_feedback": "조식이 훌륭하나, 객실 방음이 조금 아쉬움",
    "local_event": "지역 벚꽃 축제 진행 중"
  }, null, 2),
  "기타 산업": "{\n  \"metric\": \"value\"\n}"
};

function App() {
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze' or 'community'
  const [industry, setIndustry] = useState('외식업 (식당/카페)');
  const [rawData, setRawData] = useState(sampleDataMap['외식업 (식당/카페)']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // Community State
  const [communityData, setCommunityData] = useState([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);

  const fetchCommunityData = async () => {
    setLoadingCommunity(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/submissions`);
      setCommunityData(response.data);
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoadingCommunity(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'community') {
      fetchCommunityData();
    }
  }, [activeTab]);

  const handleIndustryChange = (e) => {
    const newIndustry = e.target.value;
    setIndustry(newIndustry);
    setRawData(sampleDataMap[newIndustry]);
    setResult(null);
  };

  const handleLoadSample = () => {
    setRawData(sampleDataMap[industry]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let parsedData;
      try {
        parsedData = JSON.parse(rawData);
      } catch (err) {
        parsedData = { text: rawData };
      }

      const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
        industry: industry,
        raw_data: parsedData,
      });

      setResult(response.data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setResult({ status: 'error', message: '데이터 분석 중 오류가 발생했습니다. 백엔드 서버가 켜져있는지 확인해주세요.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center items-start">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden mt-10 mb-10">
        
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">MDGA AI Engine</h1>
          <p className="text-sm text-blue-100 mt-1">지역 소상공인 맞춤형 데이터 리포트</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'analyze' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('analyze')}
          >
            내 상점 분석
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'community' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('community')}
          >
            지역 공용 인사이트
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'analyze' && (
            <div className="animate-fade-in">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">업종 선택</label>
                  <select
                    value={industry}
                    onChange={handleIndustryChange}
                    className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="외식업 (식당/카페)">외식업 (식당/카페)</option>
                    <option value="소매업 (의류/잡화)">소매업 (의류/잡화)</option>
                    <option value="관광/숙박업">관광/숙박업</option>
                    <option value="기타 산업">기타 산업</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-gray-700">오늘의 영업 데이터 입력</label>
                    <button 
                      type="button" 
                      onClick={handleLoadSample}
                      className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded cursor-pointer"
                    >
                      샘플 불러오기
                    </button>
                  </div>
                  <textarea
                    value={rawData}
                    onChange={(e) => setRawData(e.target.value)}
                    rows={8}
                    className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm leading-relaxed"
                    placeholder='{"매출": 50000}'
                  />
                  <p className="text-xs text-gray-500 mt-1">이 데이터는 분석 후 지역 커뮤니티 데이터로 익명 기여됩니다.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex justify-center items-center shadow-md cursor-pointer"
                >
                  {loading ? (
                    <span className="animate-pulse flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AI 분석 중...
                    </span>
                  ) : (
                    'AI 데이터 리포트 생성'
                  )}
                </button>
              </form>

              {/* Results Section */}
              {result && (
                <div className="mt-8 pt-6 border-t border-gray-200 animate-fade-in-up">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="text-xl mr-2">✨</span> AI 인사이트 리포트
                  </h2>
                  
                  {result.status === 'error' ? (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
                      {result.message}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl shadow-sm">
                        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed prose prose-sm prose-blue">
                          {result.processed_data.insights}
                        </div>
                      </div>
                      {result.public_data_used && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl mt-4">
                          <h3 className="text-xs font-bold text-green-700 mb-2">🌍 실시간 외부 데이터 연동 (Open-Meteo & Google News)</h3>
                          <div className="text-xs text-green-800 space-y-2">
                            <p><strong>날씨:</strong> {result.public_data_used.weather}</p>
                            <p><strong>뉴스:</strong><br/>{result.public_data_used.news}</p>
                          </div>
                        </div>
                      )}
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl mt-4">
                        <h3 className="text-xs font-bold text-gray-500 mb-2">분석에 사용된 원본 데이터</h3>                        <pre className="text-xs text-gray-600 overflow-x-auto">
                          {JSON.stringify(result.raw_data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'community' && (
            <div className="animate-fade-in">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">지역 상권 최신 인사이트</h2>
                <p className="text-xs text-gray-500 mt-1">공공 데이터 및 다른 소상공인들이 공유한 데이터 기반 AI 분석 결과입니다.</p>
              </div>

              {loadingCommunity ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-5">
                  {communityData.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${item.type === 'public' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                          {item.industry}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-800 mt-3 whitespace-pre-wrap">
                        {item.insights}
                      </div>
                      <details className="mt-3 group">
                        <summary className="text-xs text-blue-600 cursor-pointer font-medium hover:underline">원본 데이터 보기</summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 overflow-x-auto">
                          <pre>{JSON.stringify(item.raw_data, null, 2)}</pre>
                        </div>
                      </details>
                    </div>
                  ))}
                  {communityData.length === 0 && (
                    <p className="text-center text-sm text-gray-500 py-10">공유된 데이터가 없습니다.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
