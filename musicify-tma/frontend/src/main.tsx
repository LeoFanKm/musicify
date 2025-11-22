import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 初始化 Telegram Mini App
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();

  // 启用返回按钮（在需要时）
  // tg.BackButton.show();

  // 设置主题颜色
  tg.setHeaderColor('#0ea5e9');
  tg.setBackgroundColor('#ffffff');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
