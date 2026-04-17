const fs = require('fs');

// --- APP.JSX MODIFICATIONS ---
let appCode = fs.readFileSync('frontend/src/App.jsx', 'utf-8');

// 1. Add states
appCode = appCode.replace(
  "const [isNewStore, setIsNewStore] = useState(false);",
  "const [isNewStore, setIsNewStore] = useState(false);\n const [showAllStores, setShowAllStores] = useState(false);\n const [allStoresList, setAllStoresList] = useState([]);\n const [loadingAllStores, setLoadingAllStores] = useState(false);"
);

// 2. Add handleFetchAllStores
appCode = appCode.replace(
  "const handleLocateMe = () => {",
  `const handleFetchAllStores = async () => {
   if (showAllStores) { setShowAllStores(false); return; }
   setShowAllStores(true);
   setLoadingAllStores(true);
   try {
     const res = await axios.get(\`\${API_BASE_URL}/api/stores/all\`);
     setAllStoresList(res.data.stores || []);
   } catch(e) {
     alert("데이터를 불러오지 못했습니다: " + e.message);
   } finally {
     setLoadingAllStores(false);
   }
 };\n\n const handleLocateMe = () => {`
);

// 3. Improve handleSubmit Error Handling
appCode = appCode.replace(
  "alert('초기화 실패. 서버 연결을 확인하세요.');",
  "alert('서버 연결 실패: ' + (err.response?.data?.detail || err.message));"
);

// 4. Add "Browse all stores" button and list UI right before the <form> closing tag
const browseStoresUI = `
  <div className="mt-4 pt-4 border-t border-slate-800/60">
    <button type="button" onClick={handleFetchAllStores} className="w-full py-3 bg-slate-800/50 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors flex justify-center items-center gap-2">
       {showAllStores ? "목록 닫기" : "기존에 등록된 모든 객체(사업장) 찾아보기"}
    </button>
    
    <AnimatePresence>
      {showAllStores && (
        <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
           {loadingAllStores ? (
              <div className="p-4 text-center text-xs text-slate-500 flex justify-center items-center gap-2">
                 <RefreshCw size={14} className="animate-spin" /> 데이터를 불러오는 중...
              </div>
           ) : allStoresList.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">등록된 객체가 없습니다.</div>
           ) : (
              allStoresList.map((s, idx) => (
                 <div key={idx} onClick={() => {
                    setLevelId('store');
                    setLocGu(s.gu); setLocDong(s.dong); setLocStreet(s.street); setLocStore(s.name); setIndustry(s.industry);
                    setShowAllStores(false);
                 }} className="p-3 bg-[#101725] border border-slate-800 hover:border-blue-500/50 rounded-xl cursor-pointer transition-colors group">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{s.name}</span>
                       <span className="text-[9px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md">{s.industry}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{s.gu} > {s.dong} > {s.street}</div>
                 </div>
              ))
           )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
`;

appCode = appCode.replace(
  "  </button>\n </form>",
  `  </button>\n ${browseStoresUI}\n </form>`
);

fs.writeFileSync('frontend/src/App.jsx', appCode);
console.log("Updated App.jsx with Browse All Stores and Error logging.");

// --- INGEST MODAL MODIFICATIONS ---
let ingestCode = fs.readFileSync('frontend/src/components/modals/IngestModal.jsx', 'utf-8');

// Enhance loading UX
ingestCode = ingestCode.replace(
  "{loading ? <RefreshCw className=\"animate-spin mr-2\" size={16}/> : <Upload className=\"mr-2\" size={16}/>}",
  "{loading ? <RefreshCw className=\"animate-spin mr-2\" size={16}/> : <Upload className=\"mr-2\" size={16}/>}"
);

ingestCode = ingestCode.replace(
  "{loading ? \"AI 분석 및 자산화 진행 중...\" : \"업로드 및 자산화\"}",
  "{loading ? (file ? \"비전 AI 스캔 및 딥러닝 분석 중...\" : \"현장 데이터 AI 분석 및 자산화 중...\") : \"업로드 및 자산화\"}"
);

// Add error details to catch block
ingestCode = ingestCode.replace(
  "addToast(\"데이터 자산화에 실패했습니다.\", 'error');",
  "addToast(\"자산화 실패: \" + (err.response?.data?.detail || err.message), 'error');"
);

fs.writeFileSync('frontend/src/components/modals/IngestModal.jsx', ingestCode);
console.log("Updated IngestModal.jsx with better Loading UX and Error logging.");
