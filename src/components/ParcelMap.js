import React, { useMemo } from 'react';

function rng(seed) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/**
 * Cadastral-style parcel visual. Renders the parcel's GeoJSON polygon on top of a
 * procedurally generated neighbourhood mosaic (deterministic per seed).
 */
export default function ParcelMap({ geometry, seed = 'parcel', width = 640, height = 420, labels = true, north = true, label, className = '' }) {
  const data = useMemo(() => {
    const rnd = rng(seed);
    const cell = 64;
    const cols = Math.ceil(width / cell) + 2;
    const rows = Math.ceil(height / cell) + 2;
    const pts = [];
    for (let i = 0; i < cols; i++) {
      pts[i] = [];
      for (let j = 0; j < rows; j++) {
        pts[i][j] = [(i - 1) * cell + (rnd() - 0.5) * cell * 0.55, (j - 1) * cell + (rnd() - 0.5) * cell * 0.55];
      }
    }
    const quads = [];
    for (let i = 0; i < cols - 1; i++) {
      for (let j = 0; j < rows - 1; j++) {
        const q = [pts[i][j], pts[i + 1][j], pts[i + 1][j + 1], pts[i][j + 1]];
        quads.push({ d: 'M' + q.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L') + 'Z', tone: rnd() });
      }
    }
    const roadY = height * (0.2 + rnd() * 0.15);
    const road = `M-20,${roadY} C${width * 0.3},${roadY + 40} ${width * 0.6},${roadY - 30} ${width + 20},${roadY + 20}`;
    const sx = width * (0.75 + rnd() * 0.15);
    const stream = `M${sx},-10 C${sx - 60},${height * 0.3} ${sx + 40},${height * 0.6} ${sx - 30},${height + 10}`;

    let parcel = null;
    let scale = null;
    const ring = geometry?.coordinates?.[0];
    if (ring && ring.length > 2) {
      const lat0 = ring[0][1];
      const kx = Math.cos((lat0 * Math.PI) / 180);
      const xs = ring.map((p) => p[0] * kx);
      const ys = ring.map((p) => p[1]);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      const span = Math.max(maxX - minX, maxY - minY) || 1e-6;
      const target = Math.min(width, height) * 0.5;
      const k = target / span;
      const cx = width * 0.46, cy = height * 0.56;
      const mx = (minX + maxX) / 2, my = (minY + maxY) / 2;
      const proj = ring.map(([lng, lat]) => [cx + (lng * kx - mx) * k, cy - (lat - my) * k]);
      parcel = { d: 'M' + proj.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L') + 'Z', pts: proj.slice(0, -1) };
      const metersPerPx = (span * 111320) / target;
      const nice = [10, 20, 25, 50, 100, 200, 250, 500][[10, 20, 25, 50, 100, 200, 250, 500].findIndex((m) => m / metersPerPx > 60)] || 500;
      scale = { px: nice / metersPerPx, label: `${nice} m` };
    }
    return { quads, road, stream, parcel, scale };
  }, [geometry, seed, width, height]);

  return (
    <svg className={`parcelmap ${className}`} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label="Parcel boundary map">
      <defs>
        <pattern id={`hatch-${seed}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--accent)" strokeWidth="2" opacity="0.35" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="var(--map-bg)" />
      {data.quads.map((q, i) => (
        <path key={i} d={q.d} fill={q.tone > 0.7 ? 'var(--map-field-2)' : q.tone > 0.35 ? 'var(--map-field)' : 'var(--map-bg)'} stroke="var(--map-line)" strokeWidth="1" />
      ))}
      <path d={data.stream} fill="none" stroke="var(--map-water)" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
      <path d={data.road} fill="none" stroke="var(--map-road-edge)" strokeWidth="16" strokeLinecap="round" />
      <path d={data.road} fill="none" stroke="var(--map-road)" strokeWidth="12" strokeLinecap="round" />
      {data.parcel && (
        <g>
          <path d={data.parcel.d} fill={`url(#hatch-${seed})`} />
          <path d={data.parcel.d} fill="var(--accent)" fillOpacity="0.16" stroke="var(--accent-strong)" strokeWidth="2.5" strokeLinejoin="round" />
          {labels && data.parcel.pts.map((p, i) => (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r="4.5" fill="var(--surface)" stroke="var(--accent-strong)" strokeWidth="2" />
              <text x={p[0] + 8} y={p[1] - 7} className="parcelmap__vtx">P{i + 1}</text>
            </g>
          ))}
          {label && (() => {
            const cx = data.parcel.pts.reduce((s, p) => s + p[0], 0) / data.parcel.pts.length;
            const cy = data.parcel.pts.reduce((s, p) => s + p[1], 0) / data.parcel.pts.length;
            return <text x={cx} y={cy + 4} textAnchor="middle" className="parcelmap__label">{label}</text>;
          })()}
        </g>
      )}
      {labels && north && (
        <g transform={`translate(${width - 40},44)`} className="parcelmap__north">
          <circle r="16" fill="var(--surface)" stroke="var(--map-line-strong)" />
          <path d="M0,-10 L5,5 L0,2 L-5,5 Z" fill="var(--ink-900)" />
          <text y="-20" textAnchor="middle">N</text>
        </g>
      )}
      {labels && data.scale && (
        <g transform={`translate(20,${height - 24})`} className="parcelmap__scale">
          <rect x="-6" y="-16" width={data.scale.px + 58} height="28" rx="6" fill="var(--surface)" opacity="0.92" />
          <path d={`M0,0 v-5 M0,0 H${data.scale.px} M${data.scale.px},0 v-5`} stroke="var(--ink-900)" strokeWidth="1.6" fill="none" />
          <text x={data.scale.px + 8} y="3">{data.scale.label}</text>
        </g>
      )}
    </svg>
  );
}
