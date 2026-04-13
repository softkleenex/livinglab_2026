const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf-8');

const allMockStoresCode = `
const ALL_MOCK_STORES = [
  // 스마트팜
  { gu: '북구', dong: '산격동', street: '연암로 스마트팜 밸리', name: '지니스팜 제1농장', industry: '스마트팜', lat: 35.8821, lng: 128.6083 },
  { gu: '북구', dong: '산격동', street: '연암로 스마트팜 밸리', name: '에그리테크 산격센터', industry: '스마트팜', lat: 35.8825, lng: 128.6080 },
  { gu: '북구', dong: '산격동', street: '연암로 스마트팜 밸리', name: '초록잎 수직농장', industry: '스마트팜', lat: 35.8819, lng: 128.6090 },
  { gu: '수성구', dong: '두산동', street: '수성못 수변상권', name: '수성수산 수경재배', industry: '스마트팜', lat: 35.8258, lng: 128.6212 },
  { gu: '동구', dong: '불로동', street: '금호강 생태단지', name: '도시농부 협동조합', industry: '스마트팜', lat: 35.891, lng: 128.643 },
  { gu: '달성군', dong: '유가읍', street: '테크노폴리스 외곽', name: '달성 딸기 스마트팜', industry: '스마트팜', lat: 35.692, lng: 128.451 },
  { gu: '군위군', dong: '효령면', street: '경북대 사과연구소', name: '명품 사과 AI 농장', industry: '스마트팜', lat: 36.115, lng: 128.583 },
  { gu: '군위군', dong: '부계면', street: '청년귀농특구', name: '청년 버섯 농원', industry: '스마트팜', lat: 36.035, lng: 128.665 },
  { gu: '달성군', dong: '하빈면', street: '친환경 화훼단지', name: '하빈 꽃 화훼농장', industry: '스마트팜', lat: 35.882, lng: 128.455 },

  // 요식업 & 서비스
  { gu: '중구', dong: '삼덕동', street: '동성로', name: 'MDGA 로스터리 카페', industry: '식음료', lat: 35.8655, lng: 128.6015 },
  { gu: '중구', dong: '삼덕동', street: '동성로', name: '동성로 한우오마카세', industry: '요식업', lat: 35.8660, lng: 128.6020 },
  { gu: '중구', dong: '삼덕동', street: '동성로', name: '24시 국밥집 삼덕본점', industry: '요식업', lat: 35.8650, lng: 128.6010 },
  { gu: '중구', dong: '삼덕동', street: '동성로', name: '동성로 대형 베이커리', industry: '식음료', lat: 35.8665, lng: 128.6005 },
  { gu: '중구', dong: '동인동', street: '신천역 상권', name: 'MZ 타코야끼', industry: '요식업', lat: 35.869, lng: 128.615 },
  { gu: '중구', dong: '대봉동', street: '김광석거리', name: '레트로 뮤직 바', industry: '서비스업', lat: 35.859, lng: 128.606 },
  { gu: '중구', dong: '대봉동', street: '김광석거리', name: '대봉동 카페 루프탑', industry: '식음료', lat: 35.858, lng: 128.607 },
  { gu: '수성구', dong: '범어동', street: '범어네거리', name: '수성 파인다이닝', industry: '요식업', lat: 35.8593, lng: 128.6250 },
  { gu: '수성구', dong: '범어동', street: '범어네거리', name: 'AI 뷰티살롱 범어점', industry: '미용업', lat: 35.8600, lng: 128.6240 },
  { gu: '수성구', dong: '범어동', street: '범어네거리', name: '범어 요가 스튜디오', industry: '서비스업', lat: 35.8585, lng: 128.6260 },
  { gu: '수성구', dong: '만촌동', street: '수성구청역 주변', name: '대형 베이커리 르뱅', industry: '식음료', lat: 35.8580, lng: 128.6360 },
  { gu: '달서구', dong: '상인동', street: '상인역 번화가', name: '초저가 마트 상인점', industry: '도소매', lat: 35.819, lng: 128.537 },
  { gu: '달서구', dong: '상인동', street: '상인역 번화가', name: '상인동 돈카츠 전문점', industry: '요식업', lat: 35.818, lng: 128.538 },
  { gu: '달서구', dong: '진천동', street: '진천역 상권', name: '달서 헬스피트니스', industry: '체육시설', lat: 35.814, lng: 128.522 },
  { gu: '남구', dong: '대명동', street: '안지랑 곱창골목', name: '원조 불막창', industry: '요식업', lat: 35.839, lng: 128.573 },
  { gu: '남구', dong: '대명동', street: '안지랑 곱창골목', name: '안지랑 청춘 곱창', industry: '요식업', lat: 35.840, lng: 128.572 },
  { gu: '북구', dong: '칠성동', street: '삼성창조캠퍼스', name: '오가닉 샐러드바', industry: '요식업', lat: 35.882, lng: 128.595 },

  // IT, 제조업, 물류
  { gu: '북구', dong: '침산동', street: '경북대 창업캠퍼스', name: 'AI 비전로보틱스(주)', industry: 'IT/제조', lat: 35.884, lng: 128.595 },
  { gu: '북구', dong: '침산동', street: '경북대 창업캠퍼스', name: '(주)데이터블록', industry: 'IT/서비스', lat: 35.885, lng: 128.596 },
  { gu: '북구', dong: '침산동', street: '경북대 창업캠퍼스', name: '클라우드 시큐어(주)', industry: 'IT/서비스', lat: 35.883, lng: 128.594 },
  { gu: '달서구', dong: '성서동', street: '성서산업단지', name: '스마트물류(주) 대구센터', industry: '물류업', lat: 35.8451, lng: 128.5085 },
  { gu: '달서구', dong: '성서동', street: '성서산업단지', name: '정밀테크 부품가공', industry: '제조업', lat: 35.846, lng: 128.509 },
  { gu: '달서구', dong: '성서동', street: '성서산업단지', name: '성서 K-배터리 소재', industry: '제조업', lat: 35.844, lng: 128.507 },
  { gu: '달성군', dong: '현풍읍', street: '테크노폴리스', name: '미래차 밧데리(주)', industry: '제조업', lat: 35.694, lng: 128.455 },
  { gu: '달성군', dong: '다사읍', street: '국가산업단지', name: '메디컬 로봇(주)', industry: '제조업', lat: 35.858, lng: 128.458 },
  { gu: '동구', dong: '신암동', street: '동대구역 복합환승', name: '대구 IT 인재개발원', industry: 'IT/교육', lat: 35.879, lng: 128.628 },
  { gu: '동구', dong: '신암동', street: '동대구역 복합환승', name: '글로벌 무역 브로커', industry: '무역업', lat: 35.880, lng: 128.629 },
  { gu: '서구', dong: '중리동', street: '서대구공단', name: '에코 재생에너지', industry: '제조업', lat: 35.862, lng: 128.544 },
  { gu: '남구', dong: '봉덕동', street: '앞산 카페거리', name: '앞산 테크 랩', industry: 'IT/서비스', lat: 35.832, lng: 128.588 },
  { gu: '북구', dong: '검단동', street: '유통단지', name: '엑스코 종합물류', industry: '물류업', lat: 35.905, lng: 128.613 }
];

const getMockAddress = (lat, lng) => {
  let closest = ALL_MOCK_STORES[0];
  let minD = Infinity;
  for (let r of ALL_MOCK_STORES) {
    const d = Math.pow(r.lat - lat, 2) + Math.pow(r.lng - lng, 2);
    if (d < minD) { minD = d; closest = r; }
  }
  return closest;
};
`;

// Replace getMockAddress block
code = code.replace(/const getMockAddress = \(lat, lng\) => \{[\s\S]*?return closest;\n\};/g, allMockStoresCode);

// Update LocationSelector
code = code.replace(
  /function LocationSelector\(\{.*?\} \{/,
  'function LocationSelector({ setMapCenter, setLocGu, setLocDong, setLocStreet, setLocStore, setIndustry }) {'
);

code = code.replace(
  /const addr = getMockAddress\(lat, lng\);[\s\S]*?setLocStore\(''\); \/\/ Store is cleared to force user selection/,
  `const addr = getMockAddress(lat, lng);
      setLocGu(addr.gu);
      setLocDong(addr.dong);
      setLocStreet(addr.street);
      setLocStore(addr.name);
      setIndustry(addr.industry);`
);

code = code.replace(
  '<LocationSelector setMapCenter={setMapCenter} setLocGu={setLocGu} setLocDong={setLocDong} setLocStreet={setLocStreet} setLocStore={setLocStore} />',
  '<LocationSelector setMapCenter={setMapCenter} setLocGu={setLocGu} setLocDong={setLocDong} setLocStreet={setLocStreet} setLocStore={setLocStore} setIndustry={setIndustry} />'
);

// handleLocateMe
code = code.replace(
  /const handleLocateMe = \(\) => \{[\s\S]*?setLocStore\(''\); \/\/ Clear store/g,
  `const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const addr = getMockAddress(lat, lng);
          setMapCenter([addr.lat, addr.lng]); // Snap exactly to the nearest store
          setLocGu(addr.gu);
          setLocDong(addr.dong);
          setLocStreet(addr.street);
          setLocStore(addr.name);
          setIndustry(addr.industry);`
);

// horizontal list
const horizontalListCode = `</form>
        
        {/* Global Quick Select List */}
        {levelId === 'store' && (
          <div className="mt-8 pt-6 border-t border-slate-800 relative z-10">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <MapPin size={12} className="text-blue-500"/> 글로벌 파트너사 목록 (빠른 시작)
            </label>
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
              {ALL_MOCK_STORES.map(store => (
                <button
                  key={store.name}
                  type="button"
                  onClick={() => {
                    setLevelId('store');
                    setLocGu(store.gu);
                    setLocDong(store.dong);
                    setLocStreet(store.street);
                    setLocStore(store.name);
                    setIndustry(store.industry);
                    setMapCenter([store.lat, store.lng]);
                    setIsNewStore(false);
                  }}
                  className={\`shrink-0 px-3 py-2 rounded-xl text-left border transition-all \${locStore === store.name ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-[#101725] border-slate-800 hover:border-slate-600'}\`}
                >
                  <p className="text-xs font-bold text-slate-200">{store.name}</p>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider">{store.dong} | {store.industry}</p>
                </button>
              ))}
            </div>
          </div>
        )}
`;
code = code.replace('</form>', horizontalListCode);

// Update select handler
code = code.replace(
  /onClick=\{\(\) => \{ setLocStore\(store\); setIsNewStore\(false\); \}\}/g,
  `onClick={() => { 
    setLocStore(store); 
    setIsNewStore(false); 
    const found = ALL_MOCK_STORES.find(s => s.name === store);
    if(found) {
      setIndustry(found.industry);
      setMapCenter([found.lat, found.lng]);
    }
  }}`
);

fs.writeFileSync('frontend/src/App.jsx', code);
console.log('App.jsx successfully updated.');
