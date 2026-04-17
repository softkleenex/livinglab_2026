const fs = require('fs');

let appCode = fs.readFileSync('frontend/src/App.jsx', 'utf-8');

// 1. Add fetchAllStores logic to useEffect on mount
const fetchAllStoresCode = `
 useEffect(() => {
   const loadAllStores = async () => {
     try {
       const res = await axios.get(\`\${API_BASE_URL}/api/stores/all\`);
       setAllStoresList(res.data.stores || []);
     } catch (e) {
       console.error("Failed to fetch all stores for combobox", e);
     }
   };
   loadAllStores();
 }, []);
`;

appCode = appCode.replace(
  "const [loadingAllStores, setLoadingAllStores] = useState(false);\n",
  "const [loadingAllStores, setLoadingAllStores] = useState(false);\n" + fetchAllStoresCode
);


// 2. Replace the GU input with list attribute
appCode = appCode.replace(
  '<input required placeholder="직접입력" value={locGu} onChange={e=>setLocGu(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 outline-none text-white" />',
  `<input required list="gu-list" placeholder="직접입력 (또는 아래 목록 선택)" value={locGu} onChange={e=>setLocGu(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 outline-none text-white" />
  <datalist id="gu-list">
    {[...new Set(allStoresList.map(s => s.gu).filter(Boolean))].map(g => <option key={g} value={g} />)}
  </datalist>`
);

// 3. Replace the DONG input
appCode = appCode.replace(
  '<input required={(levelId === \'store\' || levelId === \'street\' || levelId === \'dong\')} placeholder="직접입력" value={locDong} onChange={e=>setLocDong(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-emerald-500 outline-none text-white" />',
  `<input required={(levelId === 'store' || levelId === 'street' || levelId === 'dong')} list="dong-list" placeholder="직접입력 (또는 아래 목록 선택)" value={locDong} onChange={e=>setLocDong(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-emerald-500 outline-none text-white" />
  <datalist id="dong-list">
    {[...new Set(allStoresList.filter(s => !locGu || s.gu === locGu).map(s => s.dong).filter(Boolean))].map(d => <option key={d} value={d} />)}
  </datalist>`
);

// 4. Replace the STREET input
appCode = appCode.replace(
  '<input required={levelId===\'store\' || levelId===\'street\'} placeholder="직접입력" value={locStreet} onChange={e=>setLocStreet(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-rose-500 outline-none text-white" />',
  `<input required={levelId==='store' || levelId==='street'} list="street-list" placeholder="직접입력 (또는 아래 목록 선택)" value={locStreet} onChange={e=>setLocStreet(e.target.value)} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:border-rose-500 outline-none text-white" />
  <datalist id="street-list">
    {[...new Set(allStoresList.filter(s => (!locGu || s.gu === locGu) && (!locDong || s.dong === locDong)).map(s => s.street).filter(Boolean))].map(str => <option key={str} value={str} />)}
  </datalist>`
);

// 5. Replace STORE input for new store
appCode = appCode.replace(
  '<input required placeholder="새로운 사업장/농장 이름을 입력하세요" value={locStore} onChange={e=>{setLocStore(e.target.value); setIsNewStore(true);}} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" />',
  `<input required list="store-list" placeholder="기존 사업장 검색 또는 새로운 이름 입력" value={locStore} onChange={e=>{setLocStore(e.target.value); setIsNewStore(true);}} className="w-full bg-[#0A0F1A] border border-slate-800 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" />
  <datalist id="store-list">
    {allStoresList.filter(s => (!locStreet || s.street === locStreet)).map(s => <option key={s.name} value={s.name} />)}
  </datalist>`
);

fs.writeFileSync('frontend/src/App.jsx', appCode);
console.log('Comboboxes added to App.jsx');
