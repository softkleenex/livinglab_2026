import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Award, Clock, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

const Badge = React.memo(({ label, icon, color }) => {
  return (
    <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-default ${color}`}>
      {icon} {label}
    </div>
  );
});

export default function QuestBoard({ addToast, userContext }) {
  const isFarm = userContext?.industry?.includes('스마트팜') || userContext?.industry?.includes('농업');
  const isManuf = userContext?.industry?.includes('제조') || userContext?.industry?.includes('물류');
  const locGu = userContext?.location?.[0] || '전체 지역';
  const [quests, setQuests] = useState([
    {
      id: 1,
      title: isFarm ? `${locGu} 온실 환경 및 생육 데이터` : isManuf ? `${locGu} 산업단지 야간 전력 사용량 분석` : "우천 시 상권 매출 변화 데이터",
      issuer: isFarm ? "농림축산식품부 (데이터전략팀)" : isManuf ? "한국산업단지공단" : `${locGu} (상권활성화과)`,
      reward: isFarm ? 1500 : isManuf ? 2000 : 500,
      deadline: "2일 남음",
      type: isFarm ? "환경/생육" : isManuf ? "전력/생산" : "매출/날씨",
      status: "open", // open, doing, done
      desc: isFarm ? "특정 온도 대역에서의 작물 성장 속도 변화 데이터를 텍스트로 피딩해주세요." : isManuf ? "야간 교대 근무 시 공장 내 전력 소비 패턴 데이터를 업로드해주세요." : "비가 오는 날의 오프라인 방문객 및 매출 비율이 어떻게 변하는지 분석하기 위해 결제 화면을 캡처하여 업로드해주세요."
    },
    {
      id: 2,
      title: isFarm ? "농기계 자율주행 AI 학습 이미지" : isManuf ? "불량품 비전 AI 판독 이미지" : "지역 축제 기간 방문객 설문 데이터",
      issuer: isFarm ? "한국농업기술진흥원" : isManuf ? "중소벤처기업부" : `${locGu} 관광과`,
      reward: 1200,
      deadline: "5시간 남음",
      type: "비전 AI",
      status: "open",
      desc: isFarm ? "자율주행 트랙터 학습용으로 농로 및 장애물 사진을 업로드해주세요." : isManuf ? "생산 라인에서 발생하는 표면 스크래치 불량 사진을 수집 중입니다." : "지역 행사 기간 동안 방문한 고객들의 체류 시간 및 만족도 데이터를 피딩해주세요."
    },
    {
      id: 3,
      title: isFarm ? "작물 병해충 초기 증상 스캔" : isManuf ? "설비 진동 센서 이상 데이터" : "야간 시간대(22시 이후) 유동인구 스캔",
      issuer: isFarm ? "스마트팜 혁신밸리" : isManuf ? "설비안전협회" : "지역 상인회 연합",
      reward: 300,
      deadline: "상시",
      type: isFarm ? "이미지 판독" : isManuf ? "IoT 센서" : "비전 AI",
      status: "done",
      desc: isFarm ? "잎의 변색 등 병해충 초기 증상 사진을 업로드해주세요." : isManuf ? "진동 센서에서 감지된 이상 주파수 로그를 텍스트로 업로드해주세요." : "야간 상권 활성화 정책 수립을 위해 밤 10시 이후 매장 앞 전경 사진을 업로드해주세요."
    }
  ]);

  const handleAcceptQuest = (id) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, status: 'doing' } : q));
    addToast("퀘스트를 수락했습니다! [피딩] 탭에서 데이터를 업로드하세요.", "info");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl mx-auto w-full pb-10">
      <div className="flex flex-col gap-2 px-4 sm:px-0">
        <div className="flex items-center gap-3">
          <Badge label="DATA BOUNTY" color="bg-rose-500/10 text-rose-400 border-rose-500/20" />
          <Badge label="EVENT" color="bg-yellow-500/10 text-yellow-400 border-yellow-500/20" />
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Quest Board</h2>
        <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
          지자체와 상인회에서 필요로 하는 특정 데이터를 제공하고, 일반 피딩보다 높은 $MDGA 현상금을 획득하세요!
        </p>
      </div>

      <div className="space-y-4 px-4 sm:px-0">
        <AnimatePresence>
          {quests.map((quest) => (
            <motion.div 
              key={quest.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-5 sm:p-6 rounded-2xl border transition-all relative overflow-hidden flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center ${
                quest.status === 'done' 
                  ? 'bg-slate-900/40 border-slate-800/50 opacity-60 grayscale' 
                  : quest.status === 'doing'
                  ? 'bg-blue-900/10 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                  : 'bg-[#101725] border-slate-700 hover:border-slate-500 shadow-lg'
              }`}
            >
              {quest.status === 'doing' && (
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 animate-pulse"></div>
              )}

              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${
                    quest.status === 'done' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                    quest.status === 'doing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {quest.status === 'done' ? 'Completed' : quest.status === 'doing' ? 'In Progress' : 'Urgent'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-800/80 px-2 py-0.5 rounded">{quest.type}</span>
                  {quest.status !== 'done' && (
                    <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded">
                      <Clock size={10} /> {quest.deadline}
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-slate-200">{quest.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{quest.desc}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pt-2 border-t border-slate-800/60 w-fit">
                  발주처: {quest.issuer}
                </p>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 sm:gap-3 shrink-0 border-t sm:border-t-0 border-slate-800/80 pt-4 sm:pt-0 mt-2 sm:mt-0">
                <div className="flex flex-col sm:items-end">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Reward</span>
                  <span className="text-2xl font-black text-yellow-400 flex items-center gap-1 drop-shadow-md">
                    <img src="/favicon.svg" className="w-5 h-5 opacity-80 grayscale contrast-200 brightness-200 sepia hue-rotate-15" alt=""/>
                    {quest.reward.toLocaleString()} 
                  </span>
                </div>
                
                {quest.status === 'open' ? (
                  <button onClick={() => handleAcceptQuest(quest.id)} className="px-5 py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all">
                    <Target size={14}/> 퀘스트 수락
                  </button>
                ) : quest.status === 'doing' ? (
                  <div className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.4)] animate-pulse">
                    진행 중 (데이터 피딩 대기)
                  </div>
                ) : (
                  <div className="px-5 py-2.5 bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={14}/> 완료됨
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}