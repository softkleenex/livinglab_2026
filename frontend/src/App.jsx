import React, { useState } from 'react';
import { Radar } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import 'leaflet/dist/leaflet.css';
import Onboarding from './pages/Onboarding.jsx';
import MainApp from './pages/MainApp.jsx';

function App() {
 const [googleUser, setGoogleUser] = useState(null);
 const [userContext, setUserContext] = useState(null); // { role, industry, location: [] }
 
 if (!googleUser) {
 return <GoogleLoginScreen onLogin={setGoogleUser} />;
 }

 if (!userContext) {
 return <Onboarding onComplete={setUserContext} googleUser={googleUser} />;
 }

 return <MainApp userContext={userContext} googleUser={googleUser} onLogout={() => {setUserContext(null); setGoogleUser(null);}} />;
}

function GoogleLoginScreen({ onLogin }) {
 return (
 <div className="min-h-screen bg-[#0A0F1A] text-slate-200 flex flex-col items-center justify-center p-4 selection:bg-blue-500/30">
 <div className="max-w-md w-full bg-[#0E1420] border border-slate-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
 <div className="absolute top-0 right-0 p-8 opacity-5"><Radar size={150}/></div>
 <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/50">
 <Radar size={32} className="text-white" />
 </div>
 <h1 className="text-3xl font-black text-white mb-2 relative z-10 tracking-tight">MDGA</h1>
 <p className="text-slate-400 mb-8 text-xs relative z-10 uppercase tracking-widest font-bold">Universal Data Engine</p>
 
 <div className="w-full bg-[#101725] p-6 rounded-2xl border border-slate-800 mb-6 relative z-10 flex flex-col items-center">
 <p className="text-xs text-slate-500 mb-6 font-bold uppercase tracking-wider">구글 계정으로 간편 시작</p>
 <div className="w-full flex flex-col items-center gap-3">
 <GoogleLogin
 onSuccess={credentialResponse => {
 const decoded = jwtDecode(credentialResponse.credential);
 onLogin({ ...decoded, isGuest: false });
 }}
 onError={() => {
 console.log('Login Failed');
 }}
 theme="filled_black"
 shape="pill"
 />
 <div className="w-full border-t border-slate-800 my-2 relative">
 <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#101725] px-2 text-[10px] text-slate-500 font-bold uppercase">or</span>
 </div>
 <button onClick={() => onLogin({ name: 'Guest User', isGuest: true })} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full font-bold text-xs transition-colors border border-slate-700">
 구글 계정 없이 게스트로 둘러보기
 </button>
 </div>
 </div>
 <p className="text-[10px] text-slate-600 relative z-10 font-medium">별도의 회원가입 없이 기존 구글 계정으로 연동됩니다.<br/>(게스트 모드 시 데이터 신뢰도 가중치 하락)</p>
 </div>
 </div>
 );
}

export default App;
