// Quản lý vé QR 24h & Khóa thiết bị (Device Binding)
const STORAGE_KEY_TICKETS = 'quan4:qr-tickets';
const STORAGE_KEY_SESSION = 'quan4:active-session';
const STORAGE_KEY_DEVICE = 'quan4:current-device';

const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function generateBase62Token(length = 32) {
  let result = 'qr_sec_';
  // Chuỗi ngẫu nhiên 32 ký tự Base62 (~190 bit entropy)
  const remaining = length - 7;
  for (let i = 0; i < remaining; i++) {
    const randomIndex = Math.floor(Math.random() * BASE62_CHARS.length);
    result += BASE62_CHARS[randomIndex];
  }
  return result;
}

export function getCurrentDevice() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DEVICE);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.warn(err);
  }
  // Mặc định sinh một ID thiết bị ngẫu nhiên duy nhất cho trình duyệt này
  const defaultDevice = {
    id: `dev-iphone-${Math.random().toString(36).substring(2, 9)}`,
    name: 'iPhone 15 Pro (Thiết bị này)',
  };
  localStorage.setItem(STORAGE_KEY_DEVICE, JSON.stringify(defaultDevice));
  return defaultDevice;
}

export function setCurrentDevice(id, name) {
  const device = { id, name };
  localStorage.setItem(STORAGE_KEY_DEVICE, JSON.stringify(device));
  return device;
}

export function getStoredTickets() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (data) {
      const tickets = JSON.parse(data);
      // Cập nhật trạng thái hết hạn tự động nếu quá 24h
      const now = Date.now();
      return tickets.map((t) => {
        if (t.status !== 'revoked' && new Date(t.expires_at).getTime() <= now) {
          return { ...t, status: 'expired' };
        }
        return t;
      });
    }
  } catch (err) {
    console.error('Lỗi đọc vé:', err);
  }
  return seedInitialTickets();
}

export function saveStoredTickets(tickets) {
  localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
  window.dispatchEvent(new Event('quan4:tickets-updated'));
}

export function createQrTicket({ validHours = 24, note = 'Vé tham quan ẩm thực Quận 4', maxDevices = 1 } = {}) {
  const tickets = getStoredTickets();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + validHours * 3600 * 1000);
  const token = generateBase62Token(32);

  const newTicket = {
    id: `ticket-${Date.now().toString(36)}`,
    qr_token: token,
    token_length: 32,
    note: note || `Vé du lịch #${tickets.length + 1}`,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    valid_hours: validHours,
    max_devices: maxDevices,
    status: 'pending_activation', // pending_activation | active | expired | revoked
    bound_device: null, // { id, name, bound_at }
  };

  const updated = [newTicket, ...tickets];
  saveStoredTickets(updated);
  return newTicket;
}

export function revokeTicket(ticketId) {
  const tickets = getStoredTickets();
  const updated = tickets.map((t) => (t.id === ticketId || t.qr_token === ticketId ? { ...t, status: 'revoked' } : t));
  saveStoredTickets(updated);

  // Nếu session hiện tại đang dùng vé bị hủy thì đăng xuất
  const session = getActiveSession();
  if (session && (session.ticket_id === ticketId || session.qr_token === ticketId)) {
    logoutSession();
  }
}

export function loginWithQr({ qrToken, deviceId, deviceName }) {
  const tickets = getStoredTickets();
  const ticket = tickets.find((t) => t.qr_token.trim() === qrToken.trim());

  if (!ticket) {
    throw new Error('Mã QR không tồn tại trong hệ thống. Vui lòng kiểm tra lại!');
  }

  if (ticket.status === 'revoked') {
    throw new Error('Mã QR này đã bị quản trị viên thu hồi hoặc hủy bỏ!');
  }

  const now = Date.now();
  const expiryTime = new Date(ticket.expires_at).getTime();
  if (expiryTime <= now) {
    throw new Error('Mã QR đã hết hạn hiệu lực 24 giờ. Vui lòng liên hệ quầy vé để được cấp mã mới.');
  }

  // KIỂM TRA BINDING 1 THIẾT BỊ DUY NHẤT:
  if (ticket.bound_device && ticket.bound_device.id !== deviceId) {
    throw new Error(
      `Mã QR này đã được kích hoạt trên thiết bị [${ticket.bound_device.name || ticket.bound_device.id}]. Mỗi mã QR chỉ được phép sử dụng trên đúng 1 thiết bị duy nhất!`
    );
  }

  // Nếu chưa bind, tiến hành bind với thiết bị này
  if (!ticket.bound_device) {
    ticket.bound_device = {
      id: deviceId,
      name: deviceName || 'Thiết bị không xác định',
      bound_at: new Date().toISOString(),
    };
    ticket.status = 'active';
    saveStoredTickets(tickets);
  }

  // Cấp Session
  const session = {
    ticket_id: ticket.id,
    qr_token: ticket.qr_token,
    note: ticket.note,
    device_id: deviceId,
    device_name: deviceName,
    logged_in_at: new Date().toISOString(),
    expires_at: ticket.expires_at,
  };
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
  window.dispatchEvent(new Event('quan4:session-updated'));
  return session;
}

export function getActiveSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (new Date(session.expires_at).getTime() <= Date.now()) {
      logoutSession();
      return null;
    }
    return session;
  } catch (err) {
    console.warn(err);
    return null;
  }
}

export function logoutSession() {
  localStorage.removeItem(STORAGE_KEY_SESSION);
  window.dispatchEvent(new Event('quan4:session-updated'));
}

function seedInitialTickets() {
  const now = Date.now();
  const defaultTickets = [
    {
      id: 'ticket-demo-01',
      qr_token: 'qr_sec_A9f2K8xQ1vL3pZ7wR4mY6bC5tE0sD8uN',
      token_length: 32,
      note: 'Vé Tour Trải Nghiệm Ẩm Thực Vĩnh Khánh (Mẫu sẵn)',
      created_at: new Date(now - 2 * 3600 * 1000).toISOString(),
      expires_at: new Date(now + 22 * 3600 * 1000).toISOString(),
      valid_hours: 24,
      max_devices: 1,
      status: 'pending_activation',
      bound_device: null,
    },
    {
      id: 'ticket-demo-02',
      qr_token: 'qr_sec_X4tM8nQ2yK9pL1wR7bC0vE5sA3dZ6uF1',
      token_length: 32,
      note: 'Vé Du Khách Quốc Tế - Bàn 04 (Đã kích hoạt)',
      created_at: new Date(now - 5 * 3600 * 1000).toISOString(),
      expires_at: new Date(now + 19 * 3600 * 1000).toISOString(),
      valid_hours: 24,
      max_devices: 1,
      status: 'active',
      bound_device: {
        id: 'dev-samsung-galaxy-s24',
        name: 'Samsung Galaxy S24 Ultra (Khách A)',
        bound_at: new Date(now - 4.8 * 3600 * 1000).toISOString(),
      },
    },
  ];
  localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(defaultTickets));
  return defaultTickets;
}
