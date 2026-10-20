import { DEMO_POIS, normalizePoi } from '../data/pois';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';
const TIMEOUT_MS = 6000;

export async function loadPois({ signal } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const abortFromCaller = () => controller.abort(signal?.reason);
  signal?.addEventListener('abort', abortFromCaller, { once: true });

  try {
    const response = await fetch(`${API_BASE}${API_PREFIX}/poi/load-all?lang=vi`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Không tải được địa điểm (HTTP ${response.status})`);
    const payload = await response.json();
    const items = Array.isArray(payload) ? payload : payload.pois ?? payload.items ?? payload.data ?? [];
    if (!Array.isArray(items)) throw new Error('Dữ liệu POI từ máy chủ không hợp lệ');
    return { pois: items.map(normalizePoi).filter(Boolean), source: 'api' };
  } catch (error) {
    if (signal?.aborted) throw error;
    return { pois: DEMO_POIS.map(normalizePoi).filter(Boolean), source: 'demo', error };
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}
