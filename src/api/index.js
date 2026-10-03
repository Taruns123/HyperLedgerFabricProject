// Single API module for the app.
//
// REACT_APP_DEMO=1  -> in-memory demo ledger (no Fabric network / Express backend needed)
// otherwise         -> the original Express gateway (Backend-Chainify), base URL from
//                      REACT_APP_API_URL (defaults to http://localhost:4000)
import { buildDemoAssets, fakeHash, polygonAreaSqm } from '../data/mockData';

export const DEMO = process.env.REACT_APP_DEMO === '1';
const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:4000').replace(/\/$/, '');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ demo */
let store = null;
const demoStore = () => (store ||= buildDemoAssets());
const nextBlock = () => Math.max(...demoStore().map((a) => a.lastBlock)) + 1 + Math.floor(Math.random() * 40);

const demo = {
  async listAssets() {
    await wait(220);
    return demoStore().map((a) => ({ ...a }));
  },
  async getAsset(id) {
    await wait(160);
    const a = demoStore().find((x) => x.id === id);
    if (!a) throw new Error(`Asset ${id} not found on ledger`);
    return { ...a };
  },
  async createAsset(input) {
    await wait(900);
    if (demoStore().some((a) => a.id === input.id)) throw new Error(`Asset ${input.id} already exists`);
    const block = nextBlock();
    const now = new Date().toISOString();
    const asset = {
      ...input,
      isCommercial: input.landUse === 'Commercial' || input.landUse === 'Industrial',
      isLoan: !!input.loan,
      areaSqm: input.geometry ? polygonAreaSqm(input.geometry.coordinates[0]) : input.areaSqm,
      status: 'Pending',
      lastUpdated: now,
      lastBlock: block,
      channel: 'landchannel',
      chaincode: 'landreg v2.1',
      endorsedBy: ['RegistrarOrg-MSP'],
      history: [{ id: `${input.id}-ev0`, type: 'Registered', date: now, to: input.owners.map((o) => o.name).join(', '),
        officer: 'Sub-Registrar (demo)', block, txId: fakeHash(input.id + now), note: 'Submitted for endorsement.' }],
    };
    demoStore().unshift(asset);
    return { txId: asset.history[0].txId, block };
  },
  async transferOwnership(id, newOwners, consideration) {
    await wait(1100);
    const a = demoStore().find((x) => x.id === id);
    if (!a) throw new Error(`Asset ${id} not found`);
    const block = nextBlock();
    const now = new Date().toISOString();
    const ev = { id: `${id}-ev${a.history.length}`, type: newOwners.length > 1 ? 'Co-ownership' : 'Transfer', date: now,
      from: a.owners.map((o) => o.name).join(', '), to: newOwners.map((o) => (newOwners.length > 1 ? `${o.name} (${o.share}%)` : o.name)).join(', '),
      consideration: consideration || null, officer: 'Sub-Registrar (demo)', block, txId: fakeHash(id + now), note: 'Mutation entry submitted.' };
    a.owners = newOwners;
    a.history = [...a.history, ev];
    a.lastBlock = block;
    a.lastUpdated = now;
    a.status = 'Pending';
    return { txId: ev.txId, block };
  },
};

/* ------------------------------------------------------------------ live */
// The backend returns fabcar-style rows: [{ Key, Record: {...} }]
function fromRecord(row) {
  const r = row.Record || row;
  const owners = String(r.owner || r.ownerName || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  return {
    id: row.Key || r.id,
    state: r.state || '—', district: r.district || '—', taluka: r.taluka || '—', village: r.village || '—',
    surveyNo: r.surveyNo || row.Key,
    landUse: String(r.isCommercial) === 'true' || r.isCommercial === 'yes' ? 'Commercial' : 'Residential',
    isCommercial: String(r.isCommercial) === 'true' || r.isCommercial === 'yes',
    isLoan: String(r.isLoan) === 'true' || r.isLoan === 'yes',
    loan: null,
    assetValue: Number(r.assetValue || r.AssetValue || 0),
    owners: owners.map((name) => ({ name, share: Math.round(100 / owners.length) })),
    status: 'Verified', geometry: null, areaSqm: null, history: [], lastBlock: null, lastUpdated: null,
  };
}

const enc = encodeURIComponent;
const live = {
  async listAssets() {
    const res = await fetch(`${API_URL}/getQuery/`);
    if (!res.ok) throw new Error(`Gateway responded ${res.status}`);
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map(fromRecord);
  },
  async getAsset(id) {
    const all = await live.listAssets();
    const a = all.find((x) => x.id === id);
    if (!a) throw new Error(`Asset ${id} not found on ledger`);
    return a;
  },
  async createAsset(i) {
    const owner = i.owners.map((o) => o.name).join(' , ');
    const url = `${API_URL}/create/${enc(i.id)}/${i.isCommercial ? 'yes' : 'no'}/${i.loan ? 'yes' : 'no'}/${enc(i.assetValue)}/${enc(owner)}/${enc(i.taluka)}/${enc(i.district)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Gateway responded ${res.status}`);
    return { txId: null, block: null };
  },
  async transferOwnership(id, newOwners) {
    const res = await fetch(`${API_URL}/changeOwner/${enc(id)}/${enc(newOwners.map((o) => o.name).join(' , '))}/`);
    if (!res.ok) throw new Error(`Gateway responded ${res.status}`);
    return { txId: null, block: null };
  },
};

const api = DEMO ? demo : live;
export default api;
