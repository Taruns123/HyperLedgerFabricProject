import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import useAsync from '../lib/useAsync';
import * as f from '../lib/format';
import ParcelMap from '../components/ParcelMap';
import { StatusChip, UseChip, Avatar, Skeleton } from '../components/ui';
import { IconSearch, IconPlus, IconDownload, IconChevron, IconAlert } from '../components/Icons';

const STATUSES = ['All', 'Verified', 'Pending', 'Encumbered', 'Disputed'];

export default function Assets() {
  const { data, loading, error, reload } = useAsync(() => api.listAssets(), []);
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [use, setUse] = useState('');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('updated');

  const assets = useMemo(() => data || [], [data]);
  const states = [...new Set(assets.map((a) => a.state))].sort();
  const districts = [...new Set(assets.filter((a) => !state || a.state === state).map((a) => a.district))].sort();

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const r = assets.filter((a) =>
      (!state || a.state === state) && (!district || a.district === district) && (!use || a.landUse === use) &&
      (status === 'All' || a.status === status) &&
      (!term || [a.id, a.surveyNo, a.village, a.taluka, a.district, ...a.owners.map((o) => o.name)].join(' ').toLowerCase().includes(term)));
    const by = { updated: (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated), value: (a, b) => b.assetValue - a.assetValue, area: (a, b) => b.areaSqm - a.areaSqm };
    return r.sort(by[sort]);
  }, [assets, q, state, district, use, status, sort]);

  const total = assets.reduce((s, a) => s + (a.assetValue || 0), 0);
  const count = (s) => assets.filter((a) => a.status === s).length;

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="crumbs">Registry <IconChevron width={12} height={12} /> Assets</div>
          <h1>Asset register</h1>
          <p className="page__sub">All land parcels committed to <span className="mono">landchannel</span>, queried from the world state.</p>
        </div>
        <div className="page__actions">
          <button className="btn btn--secondary"><IconDownload width={16} height={16} />Export CSV</button>
          <Link to="/assets/new" className="btn btn--primary"><IconPlus width={16} height={16} />Register parcel</Link>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi"><span>Parcels on ledger</span><strong>{loading ? <Skeleton h={28} w={60} /> : assets.length}</strong><small>across {states.length || '—'} states</small></div>
        <div className="kpi"><span>Registered value</span><strong>{loading ? <Skeleton h={28} w={110} /> : f.inrCompact(total)}</strong><small>government guidance value</small></div>
        <div className="kpi"><span>Pending mutations</span><strong className="t-warn">{loading ? <Skeleton h={28} w={40} /> : count('Pending')}</strong><small>awaiting endorsement</small></div>
        <div className="kpi"><span>Encumbered / disputed</span><strong>{loading ? <Skeleton h={28} w={60} /> : <>{count('Encumbered')}<em> / </em><span className="t-bad">{count('Disputed')}</span></>}</strong><small>active liens and court holds</small></div>
      </div>

      <div className="card">
        <div className="filters">
          <div className="search">
            <IconSearch width={16} height={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search parcel ID, survey no., village or owner" />
          </div>
          <select value={state} onChange={(e) => { setState(e.target.value); setDistrict(''); }} aria-label="State">
            <option value="">All states</option>{states.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} aria-label="District">
            <option value="">All districts</option>{districts.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={use} onChange={(e) => setUse(e.target.value)} aria-label="Land use">
            <option value="">Any land use</option>{['Agricultural', 'Residential', 'Commercial', 'Industrial'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            <option value="updated">Sort: last updated</option><option value="value">Sort: valuation</option><option value="area">Sort: area</option>
          </select>
        </div>
        <div className="segmented" role="tablist">
          {STATUSES.map((s) => (
            <button key={s} className={status === s ? 'is-on' : ''} onClick={() => setStatus(s)}>
              {s === 'Pending' ? 'Pending mutation' : s}<span>{s === 'All' ? assets.length : count(s)}</span>
            </button>
          ))}
        </div>

        {error ? (
          <div className="empty empty--error">
            <IconAlert width={28} height={28} />
            <h3>Couldn't reach the Fabric gateway</h3>
            <p>{String(error.message || error)}. Start the backend or run the app with <span className="mono">REACT_APP_DEMO=1</span>.</p>
            <button className="btn btn--secondary" onClick={reload}>Retry</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Parcel</th><th>Location</th><th>Owner(s)</th><th>Land use</th>
                  <th className="num">Area</th><th className="num">Valuation</th><th>Status</th><th className="num">Last block</th>
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 7 }).map((_, i) => (
                  <tr key={i} className="row--skeleton">{Array.from({ length: 8 }).map((__, j) => <td key={j}><Skeleton h={14} w={j === 0 ? 140 : 80} /></td>)}</tr>
                ))}
                {!loading && rows.map((a) => (
                  <tr key={a.id} onClick={() => nav(`/assets/${a.id}`)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && nav(`/assets/${a.id}`)}>
                    <td>
                      <div className="cell-parcel">
                        <span className="thumb"><ParcelMap geometry={a.geometry} seed={a.id} width={120} height={120} labels={false} /></span>
                        <div><span className="mono strong">{a.id}</span><small>{a.surveyNo}</small></div>
                      </div>
                    </td>
                    <td><div className="cell-2"><span>{a.village}, {a.taluka}</span><small>{a.district} · {a.state}</small></div></td>
                    <td>
                      <div className="cell-owners">
                        <span className="stack">{a.owners.slice(0, 3).map((o, i) => <Avatar key={o.name} name={o.name} size={26} tone={i} />)}</span>
                        <div className="cell-2"><span>{a.owners[0].name}</span><small>{a.owners.length > 1 ? `+${a.owners.length - 1} co-owner${a.owners.length > 2 ? 's' : ''}` : 'Sole owner'}</small></div>
                      </div>
                    </td>
                    <td><UseChip use={a.landUse} /></td>
                    <td className="num"><div className="cell-2 cell-2--r"><span>{f.sqm(a.areaSqm)}</span><small>{f.acres(a.areaSqm)}</small></div></td>
                    <td className="num"><div className="cell-2 cell-2--r"><span className="strong">{f.inrCompact(a.assetValue)}</span><small>{a.loan ? `Lien ${f.inrCompact(a.loan.amount)}` : 'No lien'}</small></div></td>
                    <td><StatusChip status={a.status} /></td>
                    <td className="num"><div className="cell-2 cell-2--r"><span className="mono">{f.block(a.lastBlock)}</span><small>{f.date(a.lastUpdated)}</small></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && rows.length === 0 && (
              <div className="empty"><h3>No parcels match these filters</h3><p>Try clearing the search or choosing a different district.</p></div>
            )}
          </div>
        )}
        <div className="table-foot">
          <span>Showing <b>{loading ? '—' : rows.length}</b> of {assets.length} parcels</span>
          <span className="muted">World state synced · channel height {f.block(Math.max(0, ...assets.map((a) => a.lastBlock || 0)) + 37)}</span>
        </div>
      </div>
    </div>
  );
}
