import { useState, useEffect } from 'react';
import QrCodeView from './QrCodeView';
import {
  getStoredTickets,
  createQrTicket,
  revokeTicket,
  saveStoredTickets,
  loginWithQr,
} from '../services/ticketService';
import { DEMO_POIS } from '../data/pois';
import './AdminPortal.css';

export default function AdminPortal({ onSwitchToMobile, onLoginWithTicket }) {
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'pois' | 'simulate'
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');

  // POI Management State
  const [pois, setPois] = useState(() => {
    try {
      const saved = localStorage.getItem('quan4:admin-pois');
      return saved ? JSON.parse(saved) : DEMO_POIS;
    } catch {
      return DEMO_POIS;
    }
  });
  const [showPoiModal, setShowPoiModal] = useState(false);
  const [editingPoi, setEditingPoi] = useState(null);
  const [poiForm, setPoiForm] = useState({
    name: '',
    category: 'Ốc',
    address: 'Quận 4, TP. Hồ Chí Minh',
    price: '30.000đ - 80.000đ',
    hours: '15:00 - 23:00',
    phone: '0901234567',
    status: 'online',
    coordinates: '106.7011, 10.7583',
    geofence_radius: 35,
    tags: 'Đặc sản Quận 4',
  });

  // Security Simulation State
  const [simToken, setSimToken] = useState('');
  const [simLogs, setSimLogs] = useState([]);

  // Load tickets on mount & subscribe to updates
  useEffect(() => {
    const refresh = () => setTickets(getStoredTickets());
    refresh();
    window.addEventListener('quan4:tickets-updated', refresh);
    return () => window.removeEventListener('quan4:tickets-updated', refresh);
  }, []);

  // Set default sim token if available
  useEffect(() => {
    if (tickets.length > 0 && !simToken) {
      setSimToken(tickets[0].qr_token);
    }
  }, [tickets, simToken]);

  const handleCreateTicket = (e) => {
    e.preventDefault();
    const created = createQrTicket({
      validHours: 24,
      note: newNote.trim() || `Vé du lịch #${tickets.length + 1}`,
      maxDevices: 1,
    });
    setNewNote('');
    setSelectedTicket(created);
  };

  const handleRevoke = (id) => {
    if (window.confirm('Bạn có chắc muốn thu hồi / hủy hiệu lực mã QR này?')) {
      revokeTicket(id);
    }
  };

  const handleDeleteTicket = (id) => {
    if (window.confirm('Xóa vĩnh viễn vé này khỏi danh sách?')) {
      const updated = tickets.filter((t) => t.id !== id);
      saveStoredTickets(updated);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback('Đã sao chép token vào bộ nhớ tạm!');
    window.setTimeout(() => setCopyFeedback(''), 2500);
  };

  const formatRemainingTime = (expiresAt) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Đã hết hạn';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `Còn ${hours}g ${mins}p`;
  };

  // POI Save/Delete
  const handleSavePoi = (e) => {
    e.preventDefault();
    const coords = poiForm.coordinates.split(',').map((c) => parseFloat(c.trim()));
    const newPoi = {
      id: editingPoi ? editingPoi.id : `q4-poi-${Date.now()}`,
      name: poiForm.name,
      category: poiForm.category,
      address: poiForm.address,
      price: poiForm.price,
      hours: poiForm.hours,
      phone: poiForm.phone,
      status: poiForm.status,
      coordinates: coords.length === 2 && !isNaN(coords[0]) ? coords : [106.7011, 10.7583],
      geofence_radius: Number(poiForm.geofence_radius) || 30,
      tags: poiForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      rating: editingPoi?.rating || 4.8,
      reviews: editingPoi?.reviews || 120,
    };

    let updated;
    if (editingPoi) {
      updated = pois.map((p) => (p.id === editingPoi.id ? newPoi : p));
    } else {
      updated = [newPoi, ...pois];
    }
    setPois(updated);
    localStorage.setItem('quan4:admin-pois', JSON.stringify(updated));
    setShowPoiModal(false);
    setEditingPoi(null);
  };

  const handleDeletePoi = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa địa điểm này?')) {
      const updated = pois.filter((p) => p.id !== id);
      setPois(updated);
      localStorage.setItem('quan4:admin-pois', JSON.stringify(updated));
    }
  };

  // Run Simulation Step
  const runSimulateStep = (deviceType) => {
    const targetToken = simToken.trim();
    const timestamp = new Date().toLocaleTimeString();

    if (!targetToken) {
      setSimLogs((prev) => [`[${timestamp}] ❌ Lỗi: Chưa nhập hoặc chọn mã QR để thử nghiệm!`, ...prev]);
      return;
    }

    let devId, devName;
    if (deviceType === 'primary') {
      devId = 'dev-khach-1-iphone15';
      devName = 'iPhone 15 Pro (Khách 1)';
    } else if (deviceType === 'secondary') {
      devId = 'dev-ke-gian-samsung-s24';
      devName = 'Samsung S24 (Người thứ 2 cố tình quét lại)';
    } else {
      devId = 'dev-test-expired';
      devName = 'Thiết bị quét mã hết hạn';
    }

    try {
      loginWithQr({
        qrToken: targetToken,
        deviceId: devId,
        deviceName: devName,
      });
      setSimLogs((prev) => [
        `[${timestamp}] ✅ THÀNH CÔNG: [${devName}] đã xác thực và khóa thiết bị vào vé! Cấp JWT Token hạn dùng 24h.`,
        ...prev,
      ]);
    } catch (err) {
      setSimLogs((prev) => [
        `[${timestamp}] 🛑 TỪ CHỐI BẢO MẬT (HTTP 409 / 403): ${err.message}`,
        ...prev,
      ]);
    }
  };

  // KPIs
  const totalTickets = tickets.length;
  const activeTickets = tickets.filter((t) => t.status === 'active').length;
  const pendingTickets = tickets.filter((t) => t.status === 'pending_activation').length;
  const expiredTickets = tickets.filter((t) => t.status === 'expired' || t.status === 'revoked').length;

  return (
    <div className="admin-container">
      {/* Top Navigation */}
      <header className="admin-navbar">
        <div className="admin-nav-brand">
          <span className="admin-badge-role">Admin</span>
          <span className="admin-nav-title">Quản Trị Du Lịch & GPS Quận 4</span>
        </div>

        <nav className="admin-nav-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            🎟️ Quản lý Vé QR 24h
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'pois' ? 'active' : ''}`}
            onClick={() => setActiveTab('pois')}
          >
            📍 Điểm Ẩm Thực ({pois.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'simulate' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulate')}
          >
            🛡️ Thử Nghiệm Bảo Mật (1 Thiết bị)
          </button>
        </nav>

        <div className="admin-nav-actions">
          {onSwitchToMobile && (
            <button className="admin-btn-back" onClick={onSwitchToMobile} title="Mở giao diện ứng dụng điện thoại">
              📱 Xem App Mobile
            </button>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="admin-main-body">
        {copyFeedback && (
          <div style={{ background: '#059669', color: '#fff', padding: '10px 16px', borderRadius: '10px', marginBottom: '16px', fontWeight: '600' }}>
            ✓ {copyFeedback}
          </div>
        )}

        {/* --- TAB 1: QUẢN LÝ VÉ QR 24H --- */}
        {activeTab === 'tickets' && (
          <div>
            {/* KPI Cards */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <div className="admin-kpi-title">Tổng số vé đã cấp</div>
                <div className="admin-kpi-val">{totalTickets}</div>
                <div className="admin-kpi-hint">Độ dài mã 32 ký tự Base62</div>
              </div>
              <div className="admin-kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
                <div className="admin-kpi-title">Đang hoạt động (Đã Bind)</div>
                <div className="admin-kpi-val" style={{ color: '#34d399' }}>{activeTickets}</div>
                <div className="admin-kpi-hint">Đã khóa vào đúng 1 thiết bị</div>
              </div>
              <div className="admin-kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                <div className="admin-kpi-title">Chờ khách quét</div>
                <div className="admin-kpi-val" style={{ color: '#fbbf24' }}>{pendingTickets}</div>
                <div className="admin-kpi-hint">Chưa liên kết thiết bị nào</div>
              </div>
              <div className="admin-kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
                <div className="admin-kpi-title">Hết hạn sau 24h / Đã hủy</div>
                <div className="admin-kpi-val" style={{ color: '#94a3b8' }}>{expiredTickets}</div>
                <div className="admin-kpi-hint">Tự động vô hiệu hóa</div>
              </div>
            </div>

            {/* Quick Generator Panel */}
            <div className="admin-panel">
              <div className="admin-section-header">
                <div>
                  <h2 className="admin-section-title">⚡ Cấp Mã QR Tham Quan Mới (Hạn 24 Giờ)</h2>
                  <p className="admin-section-subtitle">
                    Hệ thống tự động sinh ID bảo mật 32 ký tự Base62 (~190-bit entropy). Mã chỉ cho phép kích hoạt trên đúng 1 thiết bị và tự hủy sau 24h.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateTicket} className="admin-gen-form">
                <div className="admin-form-group">
                  <label>Ghi chú vé / Tên du khách:</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="VD: Khách đoàn ẩm thực Vĩnh Khánh - Bàn 05"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Thời hạn hiệu lực:</label>
                  <select className="admin-select" disabled>
                    <option>24 Giờ (Chính xác từ lúc tạo)</option>
                  </select>
                </div>
                <button type="submit" className="admin-btn-primary">
                  <span>➕</span> Sinh mã QR ngay
                </button>
              </form>
            </div>

            {/* Tickets Table */}
            <div className="admin-panel">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Danh Sách Mã QR & Trạng Thái Thiết Bị (Device Binding)</h2>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã QR Token (32 ký tự)</th>
                      <th>Ghi chú vé</th>
                      <th>Trạng thái</th>
                      <th>Thiết bị đã khóa (Device Binding)</th>
                      <th>Thời gian tạo</th>
                      <th>Thời hạn còn lại</th>
                      <th style={{ textAlign: 'center' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                          Chưa có mã QR nào. Bấm nút "Sinh mã QR ngay" ở trên để tạo vé!
                        </td>
                      </tr>
                    ) : (
                      tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>
                            <span
                              className="token-code"
                              onClick={() => handleCopy(ticket.qr_token)}
                              title="Bấm để sao chép token"
                            >
                              {ticket.qr_token.substring(0, 16)}... 📋
                            </span>
                          </td>
                          <td style={{ fontWeight: '600' }}>{ticket.note}</td>
                          <td>
                            <span className={`status-pill ${ticket.status}`}>
                              {ticket.status === 'active' && '🟢 Đang dùng'}
                              {ticket.status === 'pending_activation' && '🟡 Chờ quét'}
                              {ticket.status === 'expired' && '⚪ Đã hết hạn'}
                              {ticket.status === 'revoked' && '🔴 Đã hủy'}
                            </span>
                          </td>
                          <td>
                            {ticket.bound_device ? (
                              <div style={{ fontSize: '12px' }}>
                                <div style={{ color: '#34d399', fontWeight: '600' }}>
                                  📱 {ticket.bound_device.name}
                                </div>
                                <div style={{ color: '#64748b', fontFamily: 'monospace' }}>
                                  {ticket.bound_device.id}
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12.5px' }}>
                                Chưa khóa thiết bị nào
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {new Date(ticket.created_at).toLocaleString('vi-VN')}
                          </td>
                          <td style={{ fontWeight: '600', color: ticket.status === 'active' ? '#38bdf8' : '#94a3b8' }}>
                            {formatRemainingTime(ticket.expires_at)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                className="admin-tab-btn"
                                style={{ background: '#3b82f6', color: '#fff', padding: '6px 12px' }}
                                onClick={() => setSelectedTicket(ticket)}
                                title="Xem mã QR to và in vé"
                              >
                                🔍 Xem QR
                              </button>
                              {ticket.status !== 'revoked' && ticket.status !== 'expired' && (
                                <button
                                  className="admin-tab-btn"
                                  style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '6px 10px' }}
                                  onClick={() => handleRevoke(ticket.id)}
                                  title="Thu hồi vé lập tức"
                                >
                                  ⛔ Hủy
                                </button>
                              )}
                              <button
                                className="admin-tab-btn"
                                style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', padding: '6px 10px' }}
                                onClick={() => handleDeleteTicket(ticket.id)}
                                title="Xóa khỏi danh sách"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: QUẢN LÝ POI (ẨM THỰC QUẬN 4) --- */}
        {activeTab === 'pois' && (
          <div className="admin-panel">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Danh Sách Địa Điểm Ẩm Thực & Bán Kính GPS (Geofence)</h2>
                <p className="admin-section-subtitle">
                  Quản lý các điểm ẩm thực Quận 4 hiển thị trên bản đồ MapLibre và cài đặt khoảng cách kích hoạt thuyết minh âm thanh tự động.
                </p>
              </div>
              <button
                className="admin-btn-primary"
                onClick={() => {
                  setEditingPoi(null);
                  setPoiForm({
                    name: '',
                    category: 'Ốc',
                    address: 'Quận 4, TP. Hồ Chí Minh',
                    price: '30.000đ - 80.000đ',
                    hours: '15:00 - 23:00',
                    phone: '0901234567',
                    status: 'online',
                    coordinates: '106.7011, 10.7583',
                    geofence_radius: 35,
                    tags: 'Đặc sản Quận 4',
                  });
                  setShowPoiModal(true);
                }}
              >
                <span>➕</span> Thêm Quán Ăn Mới
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tên Quán Ăn</th>
                    <th>Danh mục</th>
                    <th>Địa chỉ</th>
                    <th>Tọa độ GPS [Lng, Lat]</th>
                    <th>Bán kính Geofence</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pois.map((poi) => (
                    <tr key={poi.id}>
                      <td style={{ fontWeight: '700' }}>
                        <div>{poi.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>⭐ {poi.rating || 4.8} ({poi.reviews || 100} đánh giá)</div>
                      </td>
                      <td>
                        <span className="token-code" style={{ color: '#fbbf24' }}>{poi.category}</span>
                      </td>
                      <td style={{ fontSize: '13px', maxWidth: '240px' }}>{poi.address}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        [{poi.coordinates ? poi.coordinates.join(', ') : 'Chưa có'}]
                      </td>
                      <td>
                        <span style={{ background: '#0284c7', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
                          🎯 {poi.geofence_radius || 35} mét
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${poi.status}`}>
                          {poi.status === 'online' ? 'Đang mở' : poi.status === 'hybrid' ? 'Mang về' : 'Tạm đóng'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            className="admin-tab-btn"
                            style={{ background: '#3b82f6', color: '#fff', padding: '5px 10px' }}
                            onClick={() => {
                              setEditingPoi(poi);
                              setPoiForm({
                                name: poi.name,
                                category: poi.category,
                                address: poi.address,
                                price: poi.price || '',
                                hours: poi.hours || '',
                                phone: poi.phone || '',
                                status: poi.status || 'online',
                                coordinates: poi.coordinates ? poi.coordinates.join(', ') : '',
                                geofence_radius: poi.geofence_radius || 35,
                                tags: Array.isArray(poi.tags) ? poi.tags.join(', ') : '',
                              });
                              setShowPoiModal(true);
                            }}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            className="admin-tab-btn"
                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '5px 8px' }}
                            onClick={() => handleDeletePoi(poi.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 3: THỬ NGHIỆM BẢO MẬT 1 THIẾT BỊ (SANDBOX) --- */}
        {activeTab === 'simulate' && (
          <div className="admin-panel">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">🛡️ Phòng Thí Nghiệm Bảo Mật (1 Vé QR = 1 Thiết Bị Trong 24H)</h2>
                <p className="admin-section-subtitle">
                  Mô phỏng trực quan kịch bản bạn đã yêu cầu: Khách mua vé quét thành công trên máy mình, nhưng người khác sao chép mã QR đó để quét lại trên máy khác sẽ bị hệ thống phát hiện và chặn lại ngay lập tức!
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
                Chọn mã QR Token cần kiểm tra:
              </label>
              <select
                className="admin-select"
                style={{ width: '100%', maxWidth: '500px' }}
                value={simToken}
                onChange={(e) => setSimToken(e.target.value)}
              >
                {tickets.map((t) => (
                  <option key={t.id} value={t.qr_token}>
                    {t.note} — [{t.qr_token.substring(0, 18)}...] ({t.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="sim-grid">
              {/* Device 1 */}
              <div className="sim-device-card authorized">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '800', color: '#34d399', fontSize: '15px' }}>📱 Thiết bị 1 (Khách mua vé)</span>
                  <span className="status-pill active">Hợp Lệ</span>
                </div>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                  Điện thoại <strong>iPhone 15 Pro</strong> của khách du lịch được cấp vé lần đầu. Khi quét, server sẽ tự động liên kết (bind) thiết bị này vào mã QR.
                </p>
                <button
                  className="admin-btn-primary"
                  style={{ width: '100%', marginTop: '16px', background: '#10b981' }}
                  onClick={() => runSimulateStep('primary')}
                >
                  ▶️ Quét Đăng Nhập Lần Đầu (Thiết Bị 1)
                </button>
              </div>

              {/* Device 2 */}
              <div className="sim-device-card intruder">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '800', color: '#f87171', fontSize: '15px' }}>📱 Thiết bị 2 (Kẻ gian / Máy khác)</span>
                  <span className="status-pill revoked">Bị Chặn</span>
                </div>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                  Điện thoại <strong>Samsung S24</strong> cố tình chụp trộm hoặc dùng lại mã QR của Khách 1 để sử dụng "chùa" dịch vụ thuyết minh.
                </p>
                <button
                  className="admin-btn-primary"
                  style={{ width: '100%', marginTop: '16px', background: '#ef4444' }}
                  onClick={() => runSimulateStep('secondary')}
                >
                  ⚠️ Cố Tình Quét Lại Mã Này (Thiết Bị 2)
                </button>
              </div>
            </div>

            {/* Console Log */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8' }}>NHẬT KÝ KIỂM TRA BẢO MẬT (CONSOLE LOGS):</span>
                <button
                  style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}
                  onClick={() => setSimLogs([])}
                >
                  Xóa log
                </button>
              </div>
              <div className="sim-console-log">
                {simLogs.length === 0 ? (
                  <span style={{ color: '#64748b' }}>Chưa có thao tác. Bấm vào nút quét ở 2 thiết bị phía trên để xem kết quả phản hồi của Server...</span>
                ) : (
                  simLogs.map((log, index) => <div key={index}>{log}</div>)
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL XEM CHI TIẾT VÉ & IN VÉ DU LỊCH --- */}
      {selectedTicket && (
        <div className="admin-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc', marginBottom: '6px' }}>
              Vé Du Lịch Ẩm Thực Quận 4
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
              Mã QR có hiệu lực 24 giờ kể từ thời điểm tạo
            </p>

            {/* In phiếu vé */}
            <div className="admin-ticket-slip">
              <div className="admin-ticket-header">
                <div className="admin-ticket-title">GPS-Translate & Quan 4 Audio Tour</div>
                <div className="admin-ticket-meta">
                  {selectedTicket.note} • Hạn dùng 24H • 1 Thiết bị duy nhất
                </div>
              </div>

              {/* QR Code Canvas */}
              <QrCodeView
                value={`gps-app://login?token=${selectedTicket.qr_token}`}
                size={220}
              />

              <div className="admin-ticket-token-box">
                {selectedTicket.qr_token}
              </div>

              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '10px' }}>
                Hết hạn: {new Date(selectedTicket.expires_at).toLocaleString('vi-VN')}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="admin-btn-primary"
                onClick={() => handleCopy(selectedTicket.qr_token)}
              >
                📋 Sao Chép Token (32 ký tự)
              </button>
              <button
                className="admin-tab-btn"
                style={{ background: '#10b981', color: '#fff' }}
                onClick={() => window.print()}
              >
                🖨️ In Vé Ra Giấy
              </button>
              {onLoginWithTicket && (
                <button
                  className="admin-tab-btn"
                  style={{ background: '#8b5cf6', color: '#fff' }}
                  onClick={() => {
                    onLoginWithTicket(selectedTicket);
                    setSelectedTicket(null);
                  }}
                >
                  🚀 Đăng Nhập Thử Vào Mobile
                </button>
              )}
              <button
                className="admin-tab-btn"
                style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#f8fafc' }}
                onClick={() => setSelectedTicket(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL THÊM / SỬA POI --- */}
      {showPoiModal && (
        <div className="admin-modal-overlay" onClick={() => setShowPoiModal(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '600px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#f8fafc' }}>
              {editingPoi ? '✏️ Cập Nhật Địa Điểm Ẩm Thực' : '➕ Thêm Quán Ăn Mới Vào Bản Đồ Quận 4'}
            </h3>

            <form onSubmit={handleSavePoi} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="admin-form-group">
                <label>Tên quán ăn / Địa điểm:</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  value={poiForm.name}
                  onChange={(e) => setPoiForm({ ...poiForm, name: e.target.value })}
                  placeholder="VD: Quán Ốc Đào Duy Từ"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="admin-form-group">
                  <label>Danh mục:</label>
                  <select
                    className="admin-select"
                    value={poiForm.category}
                    onChange={(e) => setPoiForm({ ...poiForm, category: e.target.value })}
                  >
                    <option value="Ốc">Ốc</option>
                    <option value="Bánh mì">Bánh mì</option>
                    <option value="Phá lấu">Phá lấu</option>
                    <option value="Cháo">Cháo</option>
                    <option value="Cơm tấm">Cơm tấm</option>
                    <option value="Hủ tiếu">Hủ tiếu</option>
                    <option value="Súp cua">Súp cua</option>
                    <option value="Trà sữa / Cafe">Trà sữa / Cafe</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Trạng thái:</label>
                  <select
                    className="admin-select"
                    value={poiForm.status}
                    onChange={(e) => setPoiForm({ ...poiForm, status: e.target.value })}
                  >
                    <option value="online">Online • Đang mở</option>
                    <option value="hybrid">Hybrid • Mang về</option>
                    <option value="offline">Offline • Tạm đóng</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Địa chỉ:</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  value={poiForm.address}
                  onChange={(e) => setPoiForm({ ...poiForm, address: e.target.value })}
                  placeholder="VD: 200 Xóm Chiếu, Phường 14, Quận 4"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="admin-form-group">
                  <label>Tọa độ GPS (Lng, Lat):</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={poiForm.coordinates}
                    onChange={(e) => setPoiForm({ ...poiForm, coordinates: e.target.value })}
                    placeholder="106.7011, 10.7583"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Bán kính Geofence kích hoạt (mét):</label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    className="admin-input"
                    value={poiForm.geofence_radius}
                    onChange={(e) => setPoiForm({ ...poiForm, geofence_radius: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="admin-form-group">
                  <label>Mức giá:</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={poiForm.price}
                    onChange={(e) => setPoiForm({ ...poiForm, price: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Giờ mở cửa:</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={poiForm.hours}
                    onChange={(e) => setPoiForm({ ...poiForm, hours: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button
                  type="button"
                  className="admin-tab-btn"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                  onClick={() => setShowPoiModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary">
                  💾 Lưu Địa Điểm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
