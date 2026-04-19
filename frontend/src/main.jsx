
window.addEventListener('error', (e) => {
  const div = document.createElement('div');
  div.style.color = 'red';
  div.style.background = 'black';
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.zIndex = '999999';
  div.textContent = e.message + ' at ' + e.filename + ':' + e.lineno;
  document.body.appendChild(div);
});
window.addEventListener('unhandledrejection', (e) => {
  const div = document.createElement('div');
  div.style.color = 'red';
  div.style.background = 'black';
  div.style.position = 'fixed';
  div.style.top = '20px';
  div.style.left = '0';
  div.style.zIndex = '999999';
  div.textContent = 'Promise: ' + (e.reason ? e.reason.stack || e.reason.message : 'Unknown');
  document.body.appendChild(div);
});

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import axios from 'axios'

axios.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer mock-jwt-token`;
  return config;
});

const GOOGLE_CLIENT_ID = "485345719373-keeosnetrubiacu3ii89hh2esq3tvbeo.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
