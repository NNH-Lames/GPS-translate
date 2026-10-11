import { useState, useEffect } from 'react';
import MapScreen from './components/MapScreen';
import './App.css';

function App() {
  const [viewMode, setViewMode] = useState('mockup'); // 'mockup' | 'full'
  const [theme, setTheme] = useState('dark');
  const [currentTime, setCurrentTime] = useState('');

  // Update clock in status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="app-root-container" data-theme={theme}>
      {/* --- Desktop Toolbar (Ẩn trên điện thoại thật) --- */}
      <header className={`desktop-toolbar ${viewMode === 'full' ? 'wide' : ''}`}>
        <div className="toolbar-left">
          <span className="toolbar-title">
            📱 Giao diện Mobile
          </span>
          <span className="toolbar-badge">Active</span>
        </div>

        <div className="toolbar-right">
          <button
            className={`toolbar-btn ${viewMode === 'mockup' ? 'active' : ''}`}
            onClick={() => setViewMode('mockup')}
            title="Xem theo khung viền điện thoại iPhone"
          >
            📱 Điện thoại
          </button>
          <button
            className={`toolbar-btn ${viewMode === 'full' ? 'active' : ''}`}
            onClick={() => setViewMode('full')}
            title="Xem toàn màn hình responsive"
          >
            🖥️ Mở rộng
          </button>
          <button
            className="toolbar-btn"
            onClick={toggleTheme}
            title="Đổi nền Sáng / Tối"
          >
            {theme === 'dark' ? '☀️ Sáng' : '🌙 Tối'}
          </button>
        </div>
      </header>

      {/* --- Mobile Phone Wrapper --- */}
      <main
        className={`mobile-device-frame ${viewMode === 'full' ? 'mode-full' : ''}`}
        data-theme={theme}
      >
        {/* Status Bar (iPhone Simulation) */}
        {viewMode === 'mockup' && (
          <div className="mobile-status-bar">
            <span className="status-left">{currentTime || '09:41'}</span>
            <div className="dynamic-island" />
            <div className="status-right">
              <span>5G</span>
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>
        )}

        {/* Screen Content: Quận 4 App MapScreen */}
        <div className="mobile-screen-content">
          <MapScreen />
        </div>

        {/* Home Indicator Bar */}
        {viewMode === 'mockup' && (
          <div className="home-indicator">
            <div className="home-indicator-bar" />
          </div>
        )}
      </main>

      {/* --- Quick Network Access Hint --- */}
      <footer className="network-info-banner">
        💡 Mẹo: Ứng dụng hỗ trợ cảm ứng mượt mà. Bạn có thể mở <strong>F12 → Toggle device toolbar</strong> (Ctrl+Shift+M) hoặc truy cập qua mạng WiFi nội bộ để trải nghiệm trực tiếp trên điện thoại!
      </footer>
    </div>
  );
}

export default App;
