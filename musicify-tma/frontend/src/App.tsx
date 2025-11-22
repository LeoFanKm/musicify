import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useTelegramStore } from './stores/telegramStore';
import { useUserStore } from './stores/userStore';

// Pages
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import ProjectPage from './pages/ProjectPage';
import MyProjectsPage from './pages/MyProjectsPage';
import MultimodalPage from './pages/MultimodalPage';

function App() {
  const initTelegram = useTelegramStore(state => state.init);
  const fetchUser = useUserStore(state => state.fetchUser);

  useEffect(() => {
    // 初始化 Telegram WebApp
    initTelegram();

    // 获取用户信息
    fetchUser();
  }, [initTelegram, fetchUser]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/my-projects" element={<MyProjectsPage />} />
          <Route path="/multimodal" element={<MultimodalPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
