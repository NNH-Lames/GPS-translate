import { useCallback, useEffect, useMemo, useState } from "react";
import MapLibreView from "./MapLibreView";
import { loadPois } from "../services/poiApi";
import { getActiveSession, logoutSession } from "../services/ticketService";
import QrLoginModal from "./QrLoginModal";
import "./map.css";


const STATUS_CLASS = {
  online: "map-chip--success",
  offline: "map-chip--danger",
  hybrid: "map-chip--warning",
};

const STATUS_LABELS = {
  online: "Online • Đang mở",
  offline: "Offline • Tạm đóng",
  hybrid: "Hybrid • Mang về",
};

export default function MapScreen() {
  const [pois, setPois] = useState([]);
  const [dataSource, setDataSource] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const [mode, setMode] = useState("all");
  const [dish, setDish] = useState("Tất cả");
  const [activeTab, setActiveTab] = useState("map"); // "map" | "list" | "saved"
  const [search, setSearch] = useState("");
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('quan4:saved-pois') || '[]'); } catch { return []; }
  });
  const [userLocation, setUserLocation] = useState(null);

  // QR Ticket Session State
  const [session, setSession] = useState(getActiveSession());
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    const handleSessionUpdate = () => setSession(getActiveSession());
    window.addEventListener('quan4:session-updated', handleSessionUpdate);
    return () => window.removeEventListener('quan4:session-updated', handleSessionUpdate);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadPois({ signal: controller.signal }).then(({ pois: loaded, source, error }) => {
      setPois(loaded);
      setDataSource(source);
      setLoadError(source === 'demo' && error ? 'Đang hiển thị dữ liệu mẫu vì máy chủ chưa kết nối.' : '');
    }).catch((error) => {
      if (!controller.signal.aborted) setLoadError(error.message || 'Không tải được dữ liệu địa điểm.');
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    localStorage.setItem('quan4:saved-pois', JSON.stringify(savedIds));
  }, [savedIds]);

  const dishes = useMemo(() => ["Tất cả", ...new Set(pois.map((poi) => poi.category))], [pois]);

  // Filter markers based on mode, dish category, and search text
  const visible = pois.filter(
    (m) => mode === "all" || m.status === mode
  )
    .filter((m) => dish === "Tất cả" || m.category === dish)
    .filter(
      (m) =>
        search.trim() === "" ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.category.toLowerCase().includes(search.toLowerCase()) ||
        m.address.toLowerCase().includes(search.toLowerCase())
    );

  const toggleSave = (id, e) => {
    if (e) e.stopPropagation();
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Trình duyệt này chưa hỗ trợ định vị.');
      return;
    }
    setLocationMessage('Đang xác định vị trí…');
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const position = [coords.longitude, coords.latitude];
      setUserLocation(position);
      mapInstance?.flyTo({ center: position, zoom: 16, duration: 700 });
      setLocationMessage('Đã cập nhật vị trí của bạn.');
      window.setTimeout(() => setLocationMessage(''), 3500);
    }, (error) => {
      setLocationMessage(error.code === error.PERMISSION_DENIED ? 'Hãy cho phép truy cập vị trí để định vị.' : 'Chưa thể lấy vị trí. Vui lòng thử lại.');
      window.setTimeout(() => setLocationMessage(''), 3500);
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
  };

  const savedList = pois.filter((m) => savedIds.includes(m.id));
  const [mapInstance, setMapInstance] = useState(null);
  const onMapReady = useCallback((map) => setMapInstance(map), []);

  const selectPoi = (id) => {
    const poi = pois.find((item) => item.id === id);
    if (poi && poi.coordinates) setSelectedMarker(poi);
  };


  return (
    <div className="map-screen">
      {/* --- Mobile App Bar --- */}
      <header className="mobile-app-bar">
        <div className="mobile-app-brand">
          <div className="brand-badge">Q4</div>
          <div className="brand-text">
            <h1>Ẩm Thực Quận 4</h1>
            <p>Thiên đường ăn uống Sài Gòn</p>
          </div>
        </div>

        <div className="mobile-app-actions">
          {session ? (
            <button
              className="ticket-status-btn active"
              onClick={() => {
                if (window.confirm(`Bạn đang đăng nhập vé: "${session.note}".\nThiết bị: ${session.device_name || session.device_id}\n\nBạn có muốn đăng xuất vé này không?`)) {
                  logoutSession();
                }
              }}
              title="Bấm để xem thông tin vé hoặc đăng xuất"
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              🎟️ Đã kích hoạt
            </button>
          ) : (
            <button
              className="ticket-status-btn scan"
              onClick={() => setShowQrModal(true)}
              title="Quét mã QR do Admin cấp để kích hoạt vé 24h"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              📷 Quét QR
            </button>
          )}

          <button
            className="icon-btn"
            title="Định vị của tôi"
            onClick={handleLocate}
            aria-label="Định vị của tôi"
          >
            📍
          </button>
        </div>
      </header>

      {/* --- Ticket Prompt Banner --- */}
      {!session ? (
        <div
          onClick={() => setShowQrModal(true)}
          style={{
            background: 'linear-gradient(90deg, #1e293b, #0f172a)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '8px 14px',
            fontSize: '11.5px',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <span>🎟️ Chế độ Khách: Quét QR vé 24h để mở khóa Thuyết minh GPS!</span>
          <span style={{ fontWeight: '700' }}>Quét ➔</span>
        </div>
      ) : (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '6px 14px',
            fontSize: '11.5px',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>✅ Đã kích hoạt: <strong>{session.note}</strong></span>
          <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>1 thiết bị</span>
        </div>
      )}

      {/* --- Quick Search Bar --- */}
      <div className="map-search-container">
        <div className="map-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="map-search-input"
            placeholder="Tìm món ngon, quán ốc, tên đường Quận 4..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Tìm kiếm quán ăn"
          />
          {search && (
            <button className="map-search-clear" onClick={() => setSearch("")} aria-label="Xóa tìm kiếm">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* --- Filter Bar --- */}
      <div className="map-filters">
        {/* All status */}
        <button
          className={`map-chip ${mode === "all" ? "map-chip--active" : ""}`}
          onClick={() => setMode("all")}
          aria-pressed={mode === "all"}
        >
          Tất cả ({pois.length})
        </button>

        {["online", "offline", "hybrid"].map((s) => (
          <button
            key={s}
            className={`map-chip ${mode === s ? "map-chip--active" : ""}`}
            onClick={() => setMode(mode === s ? "all" : s)}
            aria-pressed={mode === s}
          >
            <span
              style={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background:
                  s === "online" ? "#10b981" : s === "offline" ? "#ef4444" : "#f59e0b",
              }}
            />
            {s === "online" ? "Online" : s === "offline" ? "Offline" : "Hybrid"}
          </button>
        ))}

        <select
          value={dish}
          onChange={(e) => setDish(e.target.value)}
          aria-label="Lọc món"
        >
          {dishes.map((d) => (
            <option key={d} value={d}>
              {d} {d !== "Tất cả" ? `(${pois.filter((m) => m.category === d).length})` : ""}
            </option>
          ))}
        </select>
      </div>

      {(loadError || locationMessage) && <div className="map-notice" role="status">{locationMessage || loadError}</div>}
      {dataSource === 'loading' && <div className="map-notice" role="status">Đang tải địa điểm…</div>}

      {/* ========================================================
          TAB 1: BẢN ĐỒ (MAP VIEW)
         ======================================================== */}
      {activeTab === "map" && (
        <div className="map-viewport">
          <MapLibreView pois={visible} selectedId={selectedMarker?.id} onSelect={selectPoi} onMapReady={onMapReady} />
          {userLocation && <div className="location-ready-pill">📍 Đã cập nhật vị trí</div>}

          {/* Map Legend */}
          <div className="map-legend">
            <div className="legend-item">
              <span className="legend-dot legend-dot--online"></span> Online
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot--hybrid"></span> Mang về
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot--offline"></span> Đóng
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: DANH SÁCH QUÁN (LIST VIEW)
         ======================================================== */}
      {activeTab === "list" && (
        <div className="map-list-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 2px" }}>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              Tìm thấy {visible.length} quán ăn tại Quận 4
            </span>
          </div>

          {visible.length === 0 ? (
            <div className="map-empty-state">
              <div className="empty-icon">🔍</div>
              <h3>Không tìm thấy quán phù hợp</h3>
              <p>Thử tìm từ khóa khác hoặc xóa bộ lọc để xem toàn bộ món ngon Quận 4 nhé.</p>
              <button
                className="map-chip map-chip--active"
                onClick={() => {
                  setMode("all");
                  setDish("Tất cả");
                  setSearch("");
                }}
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            visible.map((m) => {
              const isSaved = savedIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  className="eatery-card"
                  onClick={() => setSelectedMarker(m)}
                >
                  <div className="eatery-icon-box">
                    {CATEGORY_ICONS[m.category] || "🍴"}
                  </div>
                  <div className="eatery-info">
                    <div className="eatery-info-top">
                      <h4 className="eatery-name">{m.name}</h4>
                      <button
                        className={`eatery-save-btn ${isSaved ? "is-saved" : ""}`}
                        onClick={(e) => toggleSave(m.id, e)}
                        title={isSaved ? "Bỏ lưu" : "Lưu quán"}
                        aria-label="Lưu quán"
                      >
                        {isSaved ? "❤️" : "🤍"}
                      </button>
                    </div>

                    <p className="eatery-address">{m.address}</p>

                    <div className="eatery-meta">
                      <span style={{ color: "#f59e0b", fontWeight: 600 }}>⭐ {m.rating}</span>
                      <span>•</span>
                      <span>{m.category}</span>
                      <span>•</span>
                      <span className={`map-chip ${STATUS_CLASS[m.status]}`} style={{ padding: "1px 6px", fontSize: "10px" }}>
                        {m.status === "online" ? "Mở cửa" : m.status === "offline" ? "Tạm đóng" : "Mang về"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: ĐÃ LƯU (SAVED VIEW)
         ======================================================== */}
      {activeTab === "saved" && (
        <div className="map-list-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 2px" }}>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              Quán ăn yêu thích ({savedList.length})
            </span>
          </div>

          {savedList.length === 0 ? (
            <div className="map-empty-state">
              <div className="empty-icon">🤍</div>
              <h3>Bạn chưa lưu quán nào</h3>
              <p>Khám phá bản đồ và bấm nút trái tim để lưu lại những quán ốc, quán ăn ngon Quận 4!</p>
              <button className="map-chip map-chip--active" onClick={() => setActiveTab("map")}>
                Xem bản đồ ngay
              </button>
            </div>
          ) : (
            savedList.map((m) => (
              <div
                key={m.id}
                className="eatery-card"
                onClick={() => setSelectedMarker(m)}
              >
                <div className="eatery-icon-box">
                  {CATEGORY_ICONS[m.category] || "🍴"}
                </div>
                <div className="eatery-info">
                  <div className="eatery-info-top">
                    <h4 className="eatery-name">{m.name}</h4>
                    <button
                      className="eatery-save-btn is-saved"
                      onClick={(e) => toggleSave(m.id, e)}
                      title="Bỏ lưu"
                      aria-label="Bỏ lưu quán"
                    >
                      ❤️
                    </button>
                  </div>
                  <p className="eatery-address">{m.address}</p>
                  <div className="eatery-meta">
                    <span style={{ color: "#f59e0b", fontWeight: 600 }}>⭐ {m.rating}</span>
                    <span>•</span>
                    <span>{m.category}</span>
                    <span>•</span>
                    <span>{m.price}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================
          BOTTOM SHEET: CHI TIẾT QUÁN KHI CHỌN MARKER
         ======================================================== */}
      {selectedMarker && (
        <>
          <div className="map-sheet-backdrop" onClick={() => setSelectedMarker(null)} />
          <div className="map-sheet">
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div>
                <h3 className="sheet-title">{selectedMarker.name}</h3>
                <span className="sheet-dish-badge">
                  {CATEGORY_ICONS[selectedMarker.category]} {selectedMarker.category} • {STATUS_LABELS[selectedMarker.status]}
                </span>
              </div>
              <button
                className="sheet-close-btn"
                onClick={() => setSelectedMarker(null)}
                aria-label="Đóng chi tiết"
              >
                ✕
              </button>
            </div>

            <div className="sheet-meta">
              <div className="sheet-meta-item">
                <span style={{ color: "#f59e0b" }}>⭐</span>
                <strong>{selectedMarker.rating}</strong> ({selectedMarker.reviews} đánh giá)
              </div>
              <div className="sheet-meta-item">
                <span>📍</span> {selectedMarker.address}
              </div>
              <div className="sheet-meta-item">
                <span>⏰</span> {selectedMarker.hours}
              </div>
              <div className="sheet-meta-item">
                <span>💵</span> {selectedMarker.price}
              </div>
            </div>

            {selectedMarker.tags && selectedMarker.tags.length > 0 && (
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6 }}>
                  Món đặc trưng & Điểm nổi bật:
                </div>
                <div className="sheet-tags">
                  {selectedMarker.tags.map((t, i) => (
                    <span key={i} className="sheet-tag">✨ {t}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="sheet-actions">
              <button
                className="sheet-btn sheet-btn--primary"
                onClick={() => {
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedMarker.coordinates?.[1]},${selectedMarker.coordinates?.[0]}`, '_blank', 'noopener,noreferrer');
                }}
              >
                🗺️ Chỉ đường
              </button>
              <button
                className={`sheet-btn sheet-btn--outline sheet-btn--fav ${savedIds.includes(selectedMarker.id) ? "is-saved" : ""}`}
                onClick={(e) => toggleSave(selectedMarker.id, e)}
              >
                {savedIds.includes(selectedMarker.id) ? "❤️ Đã lưu" : "🤍 Lưu quán"}
              </button>
              <a
                href={selectedMarker.phone ? `tel:${selectedMarker.phone.replace(/[^\d+]/g, '')}` : undefined}
                className="sheet-btn sheet-btn--outline"
                style={{ textDecoration: "none" }}
              >
                📞 Gọi quán
              </a>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          BOTTOM TAB NAVIGATION
         ======================================================== */}
      <nav className="map-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "map"}
          onClick={() => setActiveTab("map")}
        >
          <span>🗺️</span>
          <span>Bản đồ</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === "list"}
          onClick={() => setActiveTab("list")}
        >
          <span>📋</span>
          <span>Danh sách</span>
          <span className="tab-badge">{visible.length}</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === "saved"}
          onClick={() => setActiveTab("saved")}
        >
          <span>❤️</span>
          <span>Đã lưu</span>
          {savedList.length > 0 && <span className="tab-badge">{savedList.length}</span>}
        </button>
      </nav>

      {/* --- QR Login Modal --- */}
      <QrLoginModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        onSuccess={(newSession) => setSession(newSession)}
      />
    </div>
  );
}
