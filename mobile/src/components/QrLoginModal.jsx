import { useState, useEffect } from 'react';
import {
  getCurrentDevice,
  setCurrentDevice,
  getStoredTickets,
  loginWithQr,
} from '../services/ticketService';

export default function QrLoginModal({ isOpen, onClose, onSuccess }) {
  const [device, setDevice] = useState(getCurrentDevice());
  const [inputToken, setInputToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [tickets, setTickets] = useState([]);
  const [scanStep, setScanStep] = useState('input'); // 'input' | 'scanning'

  useEffect(() => {
    if (isOpen) {
      setTickets(getStoredTickets());
      setDevice(getCurrentDevice());
      setErrorMsg('');
      setInputToken('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (tokenToUse) => {
    setErrorMsg('');
    const token = (tokenToUse || inputToken).trim();

    if (!token) {
      setErrorMsg('Vui lòng nhập hoặc chọn một mã QR Token!');
      return;
    }

    try {
      const session = loginWithQr({
        qrToken: token,
        deviceId: device.id,
        deviceName: device.name,
      });
      if (onSuccess) onSuccess(session);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const simulateCameraScan = (token) => {
    setScanStep('scanning');
    setErrorMsg('');
    setTimeout(() => {
      setScanStep('input');
      handleLogin(token);
    }, 900);
  };

  const toggleTestDevice = () => {
    if (device.id.includes('iphone')) {
      const newDev = setCurrentDevice('dev-samsung-galaxy-s24', 'Samsung Galaxy S24 (Máy người khác)');
      setDevice(newDev);
    } else {
      const newDev = setCurrentDevice('dev-iphone-15-pro', 'iPhone 15 Pro (Máy khách chính chủ)');
      setDevice(newDev);
    }
    setErrorMsg('');
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="admin-modal-card"
        style={{
          maxWidth: '440px',
          padding: '24px',
          background: '#1e293b',
          color: '#f8fafc',
          borderRadius: '24px',
          textAlign: 'left',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#f8fafc' }}>
              📷 Quét Mã QR Vé Tham Quan
            </h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Vé có hiệu lực 24h & Khóa duy nhất 1 máy</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#94a3b8',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontWeight: '700',
            }}
          >
            ✕
          </button>
        </div>

        {/* Device Info Badge */}
        <div
          style={{
            background: '#0f172a',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '10px 14px',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>
              Thiết bị hiện tại của bạn:
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
              📱 {device.name}
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTestDevice}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
            title="Đổi ID thiết bị để thử nghiệm lỗi 409 khi máy khác quét"
          >
            🔄 Đổi thiết bị test
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '12px 14px',
              borderRadius: '12px',
              fontSize: '13px',
              marginBottom: '16px',
              lineHeight: '1.4',
            }}
          >
            <strong>🛑 Từ chối truy cập:</strong> {errorMsg}
          </div>
        )}

        {/* Scanner Simulation Box */}
        {scanStep === 'scanning' ? (
          <div
            style={{
              background: '#020617',
              borderRadius: '16px',
              padding: '30px',
              textAlign: 'center',
              border: '2px solid #3b82f6',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px', animation: 'spin 1s infinite' }}>📸</div>
            <div style={{ fontWeight: '700', color: '#38bdf8' }}>Đang nhận diện mã QR và xác thực thiết bị...</div>
          </div>
        ) : (
          <div>
            {/* Input Token manually */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                Nhập hoặc dán mã QR Token (32 ký tự):
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="admin-input"
                  style={{ flex: 1, fontFamily: 'monospace', fontSize: '13px' }}
                  placeholder="qr_sec_..."
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                />
                <button
                  type="button"
                  className="admin-btn-primary"
                  style={{ padding: '0 16px' }}
                  onClick={() => handleLogin()}
                >
                  Xác Thực
                </button>
              </div>
            </div>

            {/* Quick Test QR Tokens List */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>
                HOẶC CHỌN VÉ CÓ SẴN ĐỂ MÔ PHỎNG QUÉT CAMERA:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {tickets.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Chưa có vé nào được Admin tạo.</div>
                ) : (
                  tickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => simulateCameraScan(t.qr_token)}
                      style={{
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.06)',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>{t.note}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                          {t.qr_token.substring(0, 18)}...
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: t.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                          color: t.status === 'active' ? '#34d399' : '#fbbf24',
                        }}
                      >
                        {t.status === 'active' ? 'Đã khóa máy' : 'Chờ quét'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
