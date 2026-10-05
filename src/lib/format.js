export function inrCompact(v) {
  if (v == null || isNaN(v)) return '—';
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(1).replace(/\.0$/, '')} L`;
  return `₹${Number(v).toLocaleString('en-IN')}`;
}

export const inr = (v) => (v == null || isNaN(v) ? '—' : `₹${Number(v).toLocaleString('en-IN')}`);

export const sqm = (v) => (v == null ? '—' : `${Number(v).toLocaleString('en-IN')} m²`);

export const acres = (v) => (v == null ? '' : `${(v / 4046.86).toFixed(2)} ac`);

export function date(iso, opts) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', opts || { day: '2-digit', month: 'short', year: 'numeric' });
}

export const shortHash = (h, n = 6) => (h ? `${h.slice(0, n)}…${h.slice(-4)}` : '—');

export const block = (b) => (b == null ? '—' : `#${Number(b).toLocaleString('en-IN')}`);

export const initials = (name) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
