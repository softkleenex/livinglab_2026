const fs = require('fs');

let code = fs.readFileSync('frontend/src/pages/Onboarding.jsx', 'utf-8');

// 1. Replace getMockAddress with reverseGeocode
code = code.replace(/const getMockAddress[\s\S]*?\}\);/, `const reverseGeocode = async (lat, lng) => {
  try {
    const res = await axios.get(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}\`);
    const addr = res.data.address;
    if(!addr) throw new Error();
    return {
      gu: addr.city || addr.county || addr.town || '알수없는 구',
      dong: addr.suburb || addr.neighbourhood || addr.village || '알수없는 동',
      street: addr.road || '알수없는 거리',
      name: addr.building || addr.shop || addr.amenity || '새로운 사업장',
      industry: 'IT/서비스'
    };
  } catch(e) {
    return { gu: '미분류 구', dong: '미분류 동', street: '미분류 거리', name: '신규 사업장', industry: '기타' };
  }
};`);

// 2. Update LocationSelector
code = code.replace(/function LocationSelector\([\s\S]*?return null;\n\}/, `function LocationSelector({ setMapCenter, setLocGu, setLocDong, setLocStreet, setLocStore, setIndustry }) {
  const map = useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setMapCenter([lat, lng]);
      
      const addr = await reverseGeocode(lat, lng);
      setLocGu(addr.gu);
      setLocDong(addr.dong);
      setLocStreet(addr.street);
      setLocStore(addr.name);
      setIndustry(addr.industry);
    }
  });
  return null;
}`);

// 3. Update handleLocateMe
code = code.replace(/const handleLocateMe = \(\) => \{[\s\S]*? \};\n\n const handleSubmit/, `const handleLocateMe = () => {
 if (navigator.geolocation) {
 navigator.geolocation.getCurrentPosition(
 async (position) => {
 const lat = position.coords.latitude;
 const lng = position.coords.longitude;
 setMapCenter([lat, lng]); 
 const addr = await reverseGeocode(lat, lng);
 setLocGu(addr.gu);
 setLocDong(addr.dong);
 setLocStreet(addr.street);
 setLocStore(addr.name);
 setIndustry(addr.industry);
 },
 () => alert("위치 정보를 가져올 수 없습니다. 브라우저 설정에서 위치 권한을 허용해주세요.")
 );
 } else {
 alert("Geolocation이 지원되지 않는 브라우저입니다.");
 }
 };

 const handleSubmit`);

// 4. Update Inputs to be Comboboxes (datalists)
code = code.replace(
  /<input required placeholder="직접입력" value=\{locGu\}/g,
  `<input required list="gu-list" placeholder="직접입력 (또는 아래 목록 선택)" value={locGu}`
);
code = code.replace(
  /className="w-full bg-\[\#0A0F1A\] border border-slate-800 rounded-lg px-3 py-1\.5 text-xs focus:border-blue-500 outline-none text-white" \/>/,
  `className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 outline-none text-white" />
 <datalist id="gu-list">
  {[...new Set(allStoresList.map(s => s.gu).filter(Boolean))].map(g => <option key={g} value={g} />)}
 </datalist>`
);

code = code.replace(
  /<input required=\{\(levelId === 'store' \|\| levelId === 'street' \|\| levelId === 'dong'\)\} placeholder="직접입력" value=\{locDong\}/g,
  `<input required={(levelId === 'store' || levelId === 'street' || levelId === 'dong')} list="dong-list" placeholder="직접입력 (또는 아래 목록 선택)" value={locDong}`
);
code = code.replace(
  /className="w-full bg-\[\#0A0F1A\] border border-slate-800 rounded-lg px-3 py-1\.5 text-xs focus:border-emerald-500 outline-none text-white" \/>/,
  `className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-emerald-500 outline-none text-white" />
 <datalist id="dong-list">
  {[...new Set(allStoresList.filter(s => !locGu || s.gu === locGu).map(s => s.dong).filter(Boolean))].map(d => <option key={d} value={d} />)}
 </datalist>`
);

code = code.replace(
  /<input required=\{levelId==='store' \|\| levelId==='street'\} placeholder="직접입력" value=\{locStreet\}/g,
  `<input required={levelId==='store' || levelId==='street'} list="street-list" placeholder="직접입력 (또는 아래 목록 선택)" value={locStreet}`
);
code = code.replace(
  /className="w-full bg-\[\#0A0F1A\] border border-slate-800 rounded-lg px-3 py-1\.5 text-xs focus:border-rose-500 outline-none text-white" \/>/,
  `className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-rose-500 outline-none text-white" />
 <datalist id="street-list">
  {[...new Set(allStoresList.filter(s => (!locGu || s.gu === locGu) && (!locDong || s.dong === locDong)).map(s => s.street).filter(Boolean))].map(str => <option key={str} value={str} />)}
 </datalist>`
);

code = code.replace(
  /<input required placeholder="새로운 사업장\/농장 이름을 입력하세요" value=\{locStore\}/g,
  `<input required list="store-list" placeholder="기존 사업장 검색 또는 새로운 이름 입력" value={locStore}`
);
code = code.replace(
  /className="w-full bg-\[\#0A0F1A\] border border-slate-800 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" \/>/,
  `className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" />
 <datalist id="store-list">
  {allStoresList.filter(s => (!locStreet || s.street === locStreet)).map(s => <option key={s.name} value={s.name} />)}
 </datalist>`
);

fs.writeFileSync('frontend/src/pages/Onboarding.jsx', code);
console.log("Restored comboboxes and reverseGeocode to Onboarding.jsx");
