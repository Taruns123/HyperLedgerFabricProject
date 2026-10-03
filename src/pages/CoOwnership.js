import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import useAsync from '../lib/useAsync';
import * as f from '../lib/format';
import { Avatar, StatusChip, Hash } from '../components/ui';
import { IconChevron, IconPlus, IconClose, IconUsers, IconCheck, IconArrowRight, IconAlert } from '../components/Icons';

const COLORS = ['var(--accent)', '#3E7CB1', '#5BA88B', '#B4687A', '#8C7AC8', '#C9A55B'];

export default function CoOwnership() {
  const { data } = useAsync(() => api.listAssets(), []);
  const assets = (data || []).filter((a) => a.status !== 'Disputed');
  const [id, setId] = useState('');
  const [owners, setOwners] = useState([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const asset = assets.find((a) => a.id === id);

  useEffect(() => { if (!id && assets.length) setId((assets.find((a) => a.owners.length > 1) || assets[0]).id); }, [assets, id]);
  useEffect(() => { if (asset) setOwners(asset.owners.map((o) => ({ ...o }))); }, [asset?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = owners.reduce((s, o) => s + Number(o.share || 0), 0);
  const valid = total === 100 && owners.every((o) => o.name.trim().length >= 3 && o.share > 0);
  const upd = (i, k, v) => setOwners((os) => os.map((o, j) => (j === i ? { ...o, [k]: k === 'share' ? Number(v) : v } : o)));

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    const r = await api.transferOwnership(asset.id, owners.map((o) => ({ name: o.name.trim(), share: o.share })));
    setBusy(false); setDone(r);
  };

  if (done) {
    return (
      <div className="page page--narrow">
        <div className="card success">
          <span className="success__ico"><IconCheck width={28} height={28} /></span>
          <h1>Share split recorded</h1>
          <p>{asset.id} now has {owners.length} owners. Tx <Hash value={done.txId} /> in block {f.block(done.block)}.</p>
          <div className="success__actions"><Link className="btn btn--primary" to={`/assets/${asset.id}`}>View parcel <IconArrowRight width={16} height={16} /></Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="crumbs">Registry <IconChevron width={12} height={12} /> Multiple ownership</div>
          <h1>Multiple ownership</h1>
          <p className="page__sub">Record undivided shares between co-owners — family partitions, joint purchases or partnerships.</p>
        </div>
      </div>

      <div className="form-layout">
        <div className="form-main">
          <section className="card form-section">
            <header><span className="form-section__n"><IconUsers width={14} height={14} /></span><div><h2>Parcel</h2><p>Choose the parcel whose ownership is being split.</p></div></header>
            <div className="grid-2">
              <label className="field"><span className="field__label">Parcel</span>
                <select value={id} onChange={(e) => setId(e.target.value)}>
                  {assets.map((a) => <option key={a.id} value={a.id}>{a.id} — {a.surveyNo}, {a.village}</option>)}
                </select>
              </label>
              {asset && <div className="mini-facts"><StatusChip status={asset.status} /><span>{f.sqm(asset.areaSqm)}</span><span>{f.inrCompact(asset.assetValue)}</span></div>}
            </div>
          </section>

          <section className="card form-section">
            <header><span className="form-section__n">%</span><div><h2>Share split</h2><p>Drag to adjust. Shares must total exactly 100%.</p></div></header>
            <div className="sharebar sharebar--stack">
              {owners.map((o, i) => <i key={i} style={{ width: `${Math.min(o.share, 100)}%`, background: COLORS[i % COLORS.length] }} title={`${o.name} ${o.share}%`} />)}
            </div>
            <div className="split-list">
              {owners.map((o, i) => (
                <div className="split-row" key={i}>
                  <span className="split-swatch" style={{ background: COLORS[i % COLORS.length] }} />
                  <Avatar name={o.name || '?'} size={32} tone={i} />
                  <input className="split-name" value={o.name} onChange={(e) => upd(i, 'name', e.target.value)} placeholder="Co-owner full name" />
                  <input type="range" min="0" max="100" value={o.share} onChange={(e) => upd(i, 'share', e.target.value)} style={{ '--c': COLORS[i % COLORS.length], '--p': `${o.share}%` }} />
                  <div className="split-pct"><input type="number" min="0" max="100" value={o.share} onChange={(e) => upd(i, 'share', e.target.value)} /><span>%</span></div>
                  <span className="split-val mono">{asset ? f.inrCompact(Math.round((asset.assetValue * o.share) / 100)) : ''}</span>
                  <button className="icon-btn" disabled={owners.length < 2} onClick={() => setOwners((os) => os.filter((_, j) => j !== i))} aria-label="Remove"><IconClose width={15} height={15} /></button>
                </div>
              ))}
            </div>
            <div className="owners-edit__foot">
              <button className="btn btn--text" onClick={() => setOwners((os) => [...os, { name: '', share: 0 }])}><IconPlus width={15} height={15} />Add co-owner</button>
              <span className={`share-total ${total === 100 ? 'is-ok' : 'is-bad'}`}>Total {total}%</span>
            </div>
          </section>
        </div>
        <aside className="form-side">
          <div className="card sticky">
            <h3>Summary</h3>
            <ul className="owners">
              {owners.map((o, i) => (
                <li key={i}><span className="split-swatch" style={{ background: COLORS[i % COLORS.length] }} /><div className="owners__body"><div className="owners__row"><strong>{o.name || 'Unnamed'}</strong><span className="mono">{o.share}%</span></div></div></li>
              ))}
            </ul>
            {!valid && <div className="alert alert--error"><IconAlert width={15} height={15} />{total !== 100 ? `Shares total ${total}% — adjust to 100%` : 'Every co-owner needs a name and a share'}</div>}
            <button className="btn btn--primary btn--block" disabled={!valid || busy} onClick={submit}>{busy ? <><span className="spinner" />Submitting…</> : 'Record share split'}</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
