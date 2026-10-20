import { useState, useEffect } from 'react';
import MapScreen from './components/MapScreen';
import AdminPortal from './components/AdminPortal';
import { loginWithQr, getCurrentDevice } from './services/ticketService';
import './App.css';

function App() {
  const [viewMode, setViewMode] = useState('mockup'); // 'mockup' | 'full' | 'admin'
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

  const handleAdminLoginMobile = (ticket) => {
    try {
      const dev = getCurrentDevice();
      loginWithQr({
        qrToken: ticket.qr_token,
        deviceId: dev.id,
        deviceName: dev.name,
      });
      setViewMode('mockup');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app-root-container" data-theme={theme}>
      {/* --- Desktop Toolbar --- */}
      <header className={`desktop-toolbar ${viewMode === 'full' || viewMode === 'admin' ? 'wide' : ''}`}>
        <div className="toolbar-left">
          <span className="toolbar-title">
            {viewMode === 'admin' ? '👑 Bảng Quản Trị Hệ Thống' : '📱 Giao diện Du Khách'}
          </span>
          <span className="toolbar-badge">
            {viewMode === 'admin' ? 'Admin Portal' : 'Active'}
          </span>
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
            className={`toolbar-btn ${viewMode === 'admin' ? 'active' : ''}`}
            onClick={() => setViewMode('admin')}
            title="Mở Bảng Quản Trị: Cấp vé QR 24h, Device Binding & Điểm ẩm thực"
            style={viewMode === 'admin' ? { background: '#f59e0b', color: '#0f172a', fontWeight: '700' } : {}}
          >
            👑 Quản trị (Admin)
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

      {/* --- Body Router: Admin Portal or Mobile View --- */}
      {viewMode === 'admin' ? (
        <AdminPortal
          onSwitchToMobile={() => setViewMode('mockup')}
          onLoginWithTicket={handleAdminLoginMobile}
        />
      ) : (
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
      )}

      {/* --- Quick Network Access Hint --- */}
      {viewMode !== 'admin' && (
        <footer className="network-info-banner">
          💡 Mẹo: Bạn có thể bấm nút <strong>👑 Quản trị (Admin)</strong> trên thanh công cụ để tạo mã QR 24h và kiểm tra cơ chế bảo mật khóa 1 thiết bị!
        </footer>
      )}
    </div>
  );
}

export default App;
