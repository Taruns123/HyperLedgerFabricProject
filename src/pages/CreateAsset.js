import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { DISTRICTS, polygonAreaSqm } from '../data/mockData';
import * as f from '../lib/format';
import ParcelMap from '../components/ParcelMap';
import { Field, Hash } from '../components/ui';
import { IconChevron, IconCheck, IconPlus, IconClose, IconShield, IconSpark, IconArrowRight, IconAlert } from '../components/Icons';

const USES = [
  { v: 'Agricultural', d: '7/12 extract, NA not granted' },
  { v: 'Residential', d: 'NA order for housing' },
  { v: 'Commercial', d: 'Shops, offices, hospitality' },
  { v: 'Industrial', d: 'MIDC / KIADB or NA industrial' },
];

const SAMPLE = {
  id: 'MH-PUN-1530', surveyNo: 'Gat No. 153/4', landUse: 'Residential',
  state: 'Maharashtra', district: 'Pune', taluka: 'Haveli', village: 'Kesnand',
  geojson: `{
  "type": "Polygon",
  "coordinates": [[
    [73.967757, 18.598092],
    [73.968441, 18.598282],
    [73.968745, 18.597712],
    [73.968251, 18.597256],
    [73.967605, 18.59756],
    [73.967757, 18.598092]
  ]]
}`,
  owners: [{ name: 'Rohan Deshpande', share: 100 }],
  assetValue: '16500000', hasLoan: true, bank: 'State Bank of India', loanAmount: '7500000', confirm: false,
};

const EMPTY = { id: '', surveyNo: '', landUse: '', state: '', district: '', taluka: '', village: '', geojson: '', owners: [{ name: '', share: 100 }], assetValue: '', hasLoan: false, bank: '', loanAmount: '', confirm: false };

function parseGeo(text) {
  if (!text.trim()) return { error: 'Paste the parcel boundary as a GeoJSON Polygon' };
  try {
    let g = JSON.parse(text);
    if (g.type === 'Feature') g = g.geometry;
    if (g?.type !== 'Polygon') return { error: 'Geometry must be a GeoJSON Polygon' };
    const ring = g.coordinates?.[0];
    if (!Array.isArray(ring) || ring.length < 4) return { error: 'A polygon needs at least 3 vertices plus closing point' };
    const [a, b] = [ring[0], ring[ring.length - 1]];
    if (a[0] !== b[0] || a[1] !== b[1]) return { error: 'Ring is not closed — last point must equal the first' };
    return { geometry: g, area: polygonAreaSqm(ring) };
  } catch (e) {
    return { error: 'Invalid JSON — check brackets and commas' };
  }
}

export function validate(v) {
  const e = {};
  if (!/^(MH|KA)-[A-Z]{3}-\d{4}$/.test(v.id)) e.id = 'Use the format MH-PUN-0412 (state-district-number)';
  if (!v.surveyNo.trim()) e.surveyNo = 'Survey / Gat number is required';
  if (!v.landUse) e.landUse = 'Choose a land use';
  if (!v.state) e.state = 'Select a state';
  if (!v.district) e.district = 'Select a district';
  if (!v.taluka) e.taluka = 'Select a taluka';
  if (!v.village.trim()) e.village = 'Village is required';
  const g = parseGeo(v.geojson);
  if (g.error) e.geojson = g.error;
  const names = v.owners.map((o) => o.name.trim());
  if (names.some((n) => n.length < 3)) e.owners = 'Every owner needs a full name';
  const total = v.owners.reduce((s, o) => s + Number(o.share || 0), 0);
  if (total !== 100) e.shares = `Shares total ${total}% — they must add up to 100%`;
  if (!(Number(v.assetValue) > 0)) e.assetValue = 'Enter the guidance value in rupees';
  if (v.hasLoan) {
    if (!v.bank.trim()) e.bank = 'Lender name is required';
    if (!(Number(v.loanAmount) > 0)) e.loanAmount = 'Enter the sanctioned amount';
    else if (Number(v.loanAmount) > Number(v.assetValue)) e.loanAmount = 'Lien cannot exceed the asset value';
  }
  if (!v.confirm) e.confirm = 'Confirm the details before submitting';
  return { errors: e, geo: g };
}

export default function CreateAsset() {
  const [v, setV] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  const { errors, geo } = useMemo(() => validate(v), [v]);
  const show = (k) => (submitted || touched[k]) && errors[k];
  const ok = (k) => (submitted || touched[k]) && !errors[k];
  const set = (k) => (e) => { const val = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e; setV((s) => ({ ...s, [k]: val })); setTouched((t) => ({ ...t, [k]: true })); };
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const districts = v.state ? Object.keys(DISTRICTS[v.state]) : [];
  const talukas = v.state && v.district ? DISTRICTS[v.state][v.district] || [] : [];
  const shareTotal = v.owners.reduce((s, o) => s + Number(o.share || 0), 0);

  const steps = [
    { k: 'Parcel identity', done: !errors.id && !errors.surveyNo && !errors.landUse },
    { k: 'Location', done: !errors.state && !errors.district && !errors.taluka && !errors.village },
    { k: 'Boundary', done: !errors.geojson },
    { k: 'Ownership', done: !errors.owners && !errors.shares },
    { k: 'Valuation & lien', done: !errors.assetValue && !errors.bank && !errors.loanAmount },
  ];

  const loadSample = () => { setV(SAMPLE); setTouched(Object.fromEntries(Object.keys(SAMPLE).filter((k) => k !== 'confirm').map((k) => [k, true]))); setSubmitted(false); };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) return;
    setBusy(true); setApiError(null);
    try {
      const r = await api.createAsset({
        id: v.id, surveyNo: v.surveyNo, landUse: v.landUse, state: v.state, district: v.district, taluka: v.taluka, village: v.village,
        geometry: geo.geometry, centroid: null, areaSqm: geo.area, owners: v.owners.map((o) => ({ name: o.name.trim(), share: Number(o.share) })),
        assetValue: Number(v.assetValue), loan: v.hasLoan ? { bank: v.bank, amount: Number(v.loanAmount) } : null,
      });
      setResult(r);
    } catch (err) { setApiError(err.message); } finally { setBusy(false); }
  };

  if (result) {
    return (
      <div className="page page--narrow">
        <div className="card success">
          <span className="success__ico"><IconCheck width={28} height={28} /></span>
          <h1>Parcel submitted for endorsement</h1>
          <p>{v.id} · {v.surveyNo} has been proposed to <span className="mono">landchannel</span>. It will show as <b>Pending mutation</b> until both organisations endorse.</p>
          <dl className="kv kv--mono"><div><dt>Transaction</dt><dd><Hash value={result.txId} n={10} /></dd></div><div><dt>Block</dt><dd>{f.block(result.block)}</dd></div></dl>
          <div className="success__actions">
            <Link className="btn btn--primary" to={`/assets/${v.id}`}>View parcel <IconArrowRight width={16} height={16} /></Link>
            <button className="btn btn--secondary" onClick={() => { setV(EMPTY); setTouched({}); setSubmitted(false); setResult(null); }}>Register another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="crumbs"><Link to="/assets">Assets</Link> <IconChevron width={12} height={12} /> New parcel</div>
          <h1>Register a parcel</h1>
          <p className="page__sub">Creates a new asset in the world state. Requires endorsement from the revenue department and registrar.</p>
        </div>
        <div className="page__actions">
          <button type="button" className="btn btn--secondary" onClick={loadSample} data-testid="sample"><IconSpark width={16} height={16} />Use sample parcel</button>
        </div>
      </div>

      <form className="form-layout" onSubmit={submit} noValidate>
        <div className="form-main">
          <section className="card form-section">
            <header><span className="form-section__n">1</span><div><h2>Parcel identity</h2><p>How the parcel is identified in the revenue record.</p></div></header>
            <div className="grid-2">
              <Field label="Asset ID" hint="Format: MH-PUN-0412" error={show('id')} ok={ok('id')}>
                <input name="id" className="mono-input" value={v.id} onChange={(e) => set('id')(e.target.value.toUpperCase())} onBlur={blur('id')} placeholder="MH-PUN-0000" />
              </Field>
              <Field label="Survey / Gat number" error={show('surveyNo')} ok={ok('surveyNo')}>
                <input name="surveyNo" value={v.surveyNo} onChange={set('surveyNo')} onBlur={blur('surveyNo')} placeholder="Gat No. 412/2A" />
              </Field>
            </div>
            <div className="field">
              <span className="field__label">Land use</span>
              <div className="radio-cards">
                {USES.map((u) => (
                  <button type="button" key={u.v} className={`radio-card ${v.landUse === u.v ? 'is-on' : ''}`} onClick={() => set('landUse')(u.v)}>
                    <strong>{u.v}</strong><small>{u.d}</small><i className="radio-card__dot" />
                  </button>
                ))}
              </div>
              {show('landUse') && <span className="field__msg field__msg--error"><IconAlert width={13} height={13} />{errors.landUse}</span>}
            </div>
          </section>

          <section className="card form-section">
            <header><span className="form-section__n">2</span><div><h2>Location</h2><p>Administrative hierarchy used by the sub-registrar office.</p></div></header>
            <div className="grid-2">
              <Field label="State" error={show('state')} ok={ok('state')}>
                <select value={v.state} onChange={(e) => { setV((s) => ({ ...s, state: e.target.value, district: '', taluka: '' })); blur('state')(); }}>
                  <option value="">Select state</option>{Object.keys(DISTRICTS).map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="District" error={show('district')} ok={ok('district')}>
                <select value={v.district} disabled={!v.state} onChange={(e) => { setV((s) => ({ ...s, district: e.target.value, taluka: '' })); blur('district')(); }}>
                  <option value="">{v.state ? 'Select district' : 'Choose a state first'}</option>{districts.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Taluka" error={show('taluka')} ok={ok('taluka')}>
                <select value={v.taluka} disabled={!v.district} onChange={set('taluka')}>
                  <option value="">{v.district ? 'Select taluka' : 'Choose a district first'}</option>{talukas.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Village" error={show('village')} ok={ok('village')}>
                <input value={v.village} onChange={set('village')} onBlur={blur('village')} placeholder="e.g. Wagholi" />
              </Field>
            </div>
          </section>

          <section className="card form-section">
            <header><span className="form-section__n">3</span><div><h2>Boundary</h2><p>Paste the surveyed boundary as GeoJSON (WGS84, longitude first).</p></div></header>
            <div className="geo-input">
              <Field label="GeoJSON polygon" error={show('geojson')} ok={ok('geojson')} hint={geo.area ? `${f.sqm(geo.area)} · ${f.acres(geo.area)}` : 'Feature or bare Polygon accepted'}>
                <textarea className="mono-input" rows={9} value={v.geojson} onChange={set('geojson')} onBlur={blur('geojson')} placeholder='{ "type": "Polygon", "coordinates": [[[73.98, 18.57], …]] }' />
              </Field>
              <div className={`geo-preview ${geo.geometry ? '' : 'geo-preview--empty'}`}>
                {geo.geometry ? <ParcelMap geometry={geo.geometry} seed={v.id || 'new'} width={360} height={250} /> : <span>Boundary preview appears here</span>}
              </div>
            </div>
          </section>

          <section className="card form-section">
            <header><span className="form-section__n">4</span><div><h2>Ownership</h2><p>Add co-owners for undivided shares. Shares must total 100%.</p></div></header>
            <div className="owners-edit">
              {v.owners.map((o, i) => (
                <div className="owner-row" key={i}>
                  <Field label={i === 0 ? 'Owner name' : `Co-owner ${i}`} error={show('owners') && o.name.trim().length < 3 ? 'Full name required' : null} ok={ok('owners') && o.name.trim().length >= 3}>
                    <input value={o.name} placeholder="Full name as on Aadhaar" onChange={(e) => { const owners = v.owners.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)); set('owners')(owners); }} />
                  </Field>
                  <Field label="Share %">
                    <input type="number" min="1" max="100" className="mono-input" value={o.share} onChange={(e) => { const owners = v.owners.map((x, j) => (j === i ? { ...x, share: e.target.value } : x)); set('owners')(owners); }} />
                  </Field>
                  {v.owners.length > 1 && <button type="button" className="icon-btn" aria-label="Remove owner" onClick={() => set('owners')(v.owners.filter((_, j) => j !== i))}><IconClose width={16} height={16} /></button>}
                </div>
              ))}
              <div className="owners-edit__foot">
                <button type="button" className="btn btn--text" onClick={() => set('owners')([...v.owners, { name: '', share: 0 }])}><IconPlus width={15} height={15} />Add co-owner</button>
                <span className={`share-total ${shareTotal === 100 ? 'is-ok' : 'is-bad'}`}>Total {shareTotal}%</span>
              </div>
              {show('shares') && <span className="field__msg field__msg--error"><IconAlert width={13} height={13} />{errors.shares}</span>}
            </div>
          </section>

          <section className="card form-section">
            <header><span className="form-section__n">5</span><div><h2>Valuation & encumbrance</h2><p>Guidance value per the ready reckoner, and any registered loan.</p></div></header>
            <div className="grid-2">
              <Field label="Asset value (₹)" error={show('assetValue')} ok={ok('assetValue')} hint={Number(v.assetValue) > 0 ? f.inrCompact(Number(v.assetValue)) : 'Whole rupees'}>
                <div className="prefix-input"><span>₹</span><input inputMode="numeric" className="mono-input" value={v.assetValue} onChange={(e) => set('assetValue')(e.target.value.replace(/\D/g, ''))} onBlur={blur('assetValue')} placeholder="0" /></div>
              </Field>
              <div className="field">
                <span className="field__label">Loan against parcel</span>
                <div className="toggle-row">
                  <button type="button" className={`switch ${v.hasLoan ? 'is-on' : ''}`} onClick={() => set('hasLoan')(!v.hasLoan)} aria-pressed={v.hasLoan}><i /></button>
                  <span>{v.hasLoan ? 'Yes — register a lien' : 'No active loan'}</span>
                </div>
              </div>
              {v.hasLoan && <>
                <Field label="Lender" error={show('bank')} ok={ok('bank')}>
                  <input value={v.bank} onChange={set('bank')} onBlur={blur('bank')} placeholder="e.g. State Bank of India" />
                </Field>
                <Field label="Sanctioned amount (₹)" error={show('loanAmount')} ok={ok('loanAmount')} hint={Number(v.loanAmount) > 0 && Number(v.assetValue) > 0 ? `${Math.round((v.loanAmount / v.assetValue) * 100)}% loan-to-value` : null}>
                  <div className="prefix-input"><span>₹</span><input inputMode="numeric" className="mono-input" value={v.loanAmount} onChange={(e) => set('loanAmount')(e.target.value.replace(/\D/g, ''))} onBlur={blur('loanAmount')} placeholder="0" /></div>
                </Field>
              </>}
            </div>
          </section>
        </div>

        <aside className="form-side">
          <div className="card sticky">
            <h3>Submission checklist</h3>
            <ol className="checklist">
              {steps.map((s, i) => (
                <li key={s.k} className={s.done ? 'is-done' : ''}><span>{s.done ? <IconCheck width={13} height={13} /> : i + 1}</span>{s.k}</li>
              ))}
            </ol>
            <div className="side-summary">
              <div><span>Asset</span><strong className="mono">{v.id || '—'}</strong></div>
              <div><span>Area</span><strong>{geo.area ? f.sqm(geo.area) : '—'}</strong></div>
              <div><span>Value</span><strong>{Number(v.assetValue) > 0 ? f.inrCompact(Number(v.assetValue)) : '—'}</strong></div>
              <div><span>Owners</span><strong>{v.owners.filter((o) => o.name.trim()).length || '—'}</strong></div>
            </div>
            <label className={`confirm ${show('confirm') ? 'confirm--error' : ''}`}>
              <input type="checkbox" checked={v.confirm} onChange={set('confirm')} />
              <span>I confirm these details match the registered sale deed and survey sketch.</span>
            </label>
            {apiError && <div className="alert alert--error"><IconAlert width={15} height={15} />{apiError}</div>}
            <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
              {busy ? <><span className="spinner" />Submitting to peers…</> : <><IconShield width={16} height={16} />Submit for endorsement</>}
            </button>
            <p className="fineprint">Signed with your Fabric CA identity <span className="mono">registrar@haveli2</span>.</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
