import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import useAsync from '../lib/useAsync';
import * as f from '../lib/format';
import ParcelMap from '../components/ParcelMap';
import { StatusChip, Avatar, Field, Hash, Skeleton } from '../components/ui';
import { IconChevron, IconSearch, IconCheck, IconShield, IconArrowRight, IconAlert, IconLock } from '../components/Icons';

const STAMP = { Maharashtra: 0.06, Karnataka: 0.056 };
const KINDS = ['Sale deed', 'Gift deed', 'Inheritance', 'Court decree'];

export default function Transfer() {
  const [params] = useSearchParams();
  const { data, loading } = useAsync(() => api.listAssets(), []);
  const [selected, setSelected] = useState(params.get('asset') || '');
  const [q, setQ] = useState('');
  const [buyer, setBuyer] = useState('');
  const [kind, setKind] = useState('Sale deed');
  const [consideration, setConsideration] = useState('');
  const [deedNo, setDeedNo] = useState('');
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const pickerRef = useRef(null);

  const assets = useMemo(() => data || [], [data]);
  const asset = assets.find((a) => a.id === selected);
  const list = useMemo(() => {
    const t = q.toLowerCase();
    return assets.filter((a) => !t || `${a.id} ${a.surveyNo} ${a.village} ${a.owners.map((o) => o.name).join(' ')}`.toLowerCase().includes(t));
  }, [assets, q]);

  // bring a preselected parcel (?asset=) into view inside the picker
  useEffect(() => {
    const el = pickerRef.current?.querySelector('.is-on');
    if (el) pickerRef.current.scrollTop = el.offsetTop - 4;
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSale = kind === 'Sale deed';
  const value = Number(consideration) || 0;
  const stampBase = asset ? Math.max(value, asset.assetValue) : 0;
  const stamp = asset && isSale ? Math.round(stampBase * (STAMP[asset.state] || 0.06)) : asset ? 200 : 0;
  const regFee = asset ? Math.min(30000, Math.round(stampBase * 0.01)) : 0;

  const errors = {};
  if (!asset) errors.asset = 'Select a parcel';
  else if (asset.status === 'Disputed') errors.asset = 'Disputed parcels cannot be transferred';
  if (buyer.trim().length < 3) errors.buyer = 'Enter the transferee’s full name';
  else if (asset && asset.owners.some((o) => o.name.toLowerCase() === buyer.trim().toLowerCase())) errors.buyer = 'Transferee is already an owner';
  if (isSale && !(value > 0)) errors.consideration = 'Consideration is required for a sale';
  if (!/^[A-Z]{3}\d?-\d{4,}-\d{4}$/.test(deedNo.trim().toUpperCase())) errors.deedNo = 'Format: HVL2-4821-2026';
  if (!agree) errors.agree = 'Required';
  const valid = Object.keys(errors).length === 0;
  const touchedErr = (k, has) => (tried || has) && errors[k];

  const submit = async () => {
    setTried(true);
    if (!valid) return;
    setBusy(true);
    const r = await api.transferOwnership(asset.id, [{ name: buyer.trim(), share: 100 }], isSale ? value : null);
    setBusy(false);
    setDone(r);
  };

  if (done) {
    return (
      <div className="page page--narrow">
        <div className="card success">
          <span className="success__ico"><IconCheck width={28} height={28} /></span>
          <h1>Transfer committed</h1>
          <p>{asset.id} now records <b>{buyer}</b> as owner. The mutation entry is pending revenue endorsement.</p>
          <dl className="kv kv--mono"><div><dt>Transaction</dt><dd><Hash value={done.txId} n={10} /></dd></div><div><dt>Block</dt><dd>{f.block(done.block)}</dd></div></dl>
          <div className="success__actions"><Link className="btn btn--primary" to={`/assets/${asset.id}`}>View ownership history <IconArrowRight width={16} height={16} /></Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="crumbs">Registry <IconChevron width={12} height={12} /> Transfer ownership</div>
          <h1>Transfer ownership</h1>
          <p className="page__sub">Records a change of title. The transaction is endorsed by the revenue department and registrar before commit.</p>
        </div>
      </div>

      <div className="form-layout">
        <div className="form-main">
          <section className="card form-section">
            <header><span className={`form-section__n ${asset && !errors.asset ? 'is-done' : ''}`}>{asset && !errors.asset ? <IconCheck width={14} height={14} /> : 1}</span><div><h2>Select parcel</h2><p>Only verified or encumbered parcels can change hands.</p></div></header>
            <div className="search search--block"><IconSearch width={16} height={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by parcel ID, survey no. or current owner" /></div>
            <div className="picker" ref={pickerRef}>
              {loading && Array.from({ length: 4 }).map((_, i) => <div key={i} className="picker__item"><Skeleton h={38} /></div>)}
              {list.map((a) => (
                <button key={a.id} type="button" disabled={a.status === 'Disputed'} className={`picker__item ${selected === a.id ? 'is-on' : ''}`} onClick={() => setSelected(a.id)}>
                  <span className="picker__radio" />
                  <div className="cell-2"><span className="mono strong">{a.id}</span><small>{a.surveyNo} · {a.village}</small></div>
                  <div className="cell-2"><span>{a.owners.map((o) => o.name).join(', ')}</span><small>{f.inrCompact(a.assetValue)} · {f.sqm(a.areaSqm)}</small></div>
                  <StatusChip status={a.status} />
                </button>
              ))}
            </div>
          </section>

          <section className="card form-section">
            <header><span className="form-section__n">2</span><div><h2>Transferee & instrument</h2><p>Details exactly as they appear on the registered deed.</p></div></header>
            <div className="seg-row">
              {KINDS.map((k) => <button type="button" key={k} className={`seg ${kind === k ? 'is-on' : ''}`} onClick={() => setKind(k)}>{k}</button>)}
            </div>
            <div className="grid-2">
              <Field label="Transfer to (full name)" error={touchedErr('buyer', buyer.length > 0)} ok={buyer.length > 0 && !errors.buyer}>
                <input value={buyer} onChange={(e) => setBuyer(e.target.value)} placeholder="Name as on Aadhaar / PAN" name="buyer" />
              </Field>
              <Field label="Registered deed no." hint="Issued by the sub-registrar office" error={touchedErr('deedNo', deedNo.length > 6)} ok={deedNo.length > 0 && !errors.deedNo}>
                <input className="mono-input" value={deedNo} onChange={(e) => setDeedNo(e.target.value.toUpperCase())} placeholder="HVL2-4821-2026" name="deed" />
              </Field>
              <Field label={isSale ? 'Consideration (₹)' : 'Consideration (₹) — optional'} error={touchedErr('consideration', false)} ok={value > 0}
                hint={asset && value > 0 ? (value < asset.assetValue ? `Below guidance value — stamp duty charged on ${f.inrCompact(asset.assetValue)}` : f.inrCompact(value)) : null}>
                <div className="prefix-input"><span>₹</span><input className="mono-input" inputMode="numeric" value={consideration} onChange={(e) => setConsideration(e.target.value.replace(/\D/g, ''))} placeholder="0" name="consideration" /></div>
              </Field>
              <Field label="Transferor (current owner)">
                <input value={asset ? asset.owners.map((o) => o.name).join(', ') : ''} readOnly placeholder="Select a parcel" className="is-readonly" />
              </Field>
            </div>
          </section>
        </div>

        <aside className="form-side">
          <div className="card sticky transfer-summary">
            <h3>Review & sign</h3>
            {asset ? (
              <>
                <div className="ts-map"><ParcelMap geometry={asset.geometry} seed={asset.id} width={360} height={170} labels={false} /><span className="ts-map__id mono">{asset.id}</span></div>
                <div className="ts-parties">
                  <div className="ts-party">
                    <small>From</small>
                    {asset.owners.map((o, i) => <div key={o.name} className="ts-person"><Avatar name={o.name} size={28} tone={i} /><span>{o.name}</span></div>)}
                  </div>
                  <span className="ts-arrow"><IconArrowRight width={16} height={16} /></span>
                  <div className="ts-party">
                    <small>To</small>
                    {buyer.trim() ? <div className="ts-person"><Avatar name={buyer.trim()} size={28} tone={3} /><span>{buyer}</span></div> : <span className="muted small">Not entered</span>}
                  </div>
                </div>
                <dl className="fees">
                  <div><dt>Consideration</dt><dd>{value ? f.inr(value) : '—'}</dd></div>
                  <div><dt>Stamp duty {isSale ? `(${((STAMP[asset.state] || 0.06) * 100).toFixed(1)}%)` : '(fixed)'}</dt><dd>{f.inr(stamp)}</dd></div>
                  <div><dt>Registration fee</dt><dd>{f.inr(regFee)}</dd></div>
                  <div className="fees__total"><dt>Payable by transferee</dt><dd>{f.inr(stamp + regFee)}</dd></div>
                </dl>
                {asset.loan && <div className="alert alert--info"><IconLock width={15} height={15} />Lien of {f.inrCompact(asset.loan.amount)} with {asset.loan.bank} carries over unless discharged.</div>}
                <div className="endorse">
                  <small>Endorsement policy</small>
                  <ul>
                    <li><IconShield width={14} height={14} />{asset.state === 'Karnataka' ? 'RevenueKA-MSP' : 'RevenueMH-MSP'}</li>
                    <li><IconShield width={14} height={14} />RegistrarOrg-MSP</li>
                  </ul>
                </div>
              </>
            ) : <div className="empty empty--sm"><p>Select a parcel to see the transfer summary.</p></div>}
            <label className={`confirm ${tried && errors.agree ? 'confirm--error' : ''}`}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} name="agree" />
              <span>I have verified the deed, identity documents and stamp duty challan.</span>
            </label>
            {tried && !valid && <div className="alert alert--error"><IconAlert width={15} height={15} />{Object.values(errors)[0]}</div>}
            <button className="btn btn--primary btn--block" onClick={submit} disabled={busy}>
              {busy ? <><span className="spinner" />Collecting endorsements…</> : <>Sign & submit transfer</>}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
