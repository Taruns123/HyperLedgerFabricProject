// Demo dataset used when REACT_APP_DEMO=1. Shapes mirror what the Fabric
// chaincode stores (id, isCommercial, isLoan, assetValue, owner, taluka,
// district) plus the richer fields the redesigned UI renders.

// Deterministic pseudo-random generator so the demo looks identical on every load.
function seeded(seed) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function fakeHash(seed, len = 64) {
  const rnd = seeded(seed);
  let out = '';
  for (let i = 0; i < len; i++) out += Math.floor(rnd() * 16).toString(16);
  return out;
}

function polygonAround(id, lat, lng, size) {
  const rnd = seeded(id + 'geo');
  const n = 4 + Math.floor(rnd() * 3);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const ang = (Math.PI * 2 * i) / n + (rnd() - 0.5) * 0.5 + Math.PI / 4;
    const r = size * 0.38 * (0.75 + rnd() * 0.45);
    pts.push([
      +(lng + (Math.cos(ang) * r) / Math.cos((lat * Math.PI) / 180)).toFixed(6),
      +(lat + Math.sin(ang) * r).toFixed(6),
    ]);
  }
  pts.push(pts[0]);
  return pts;
}

export function polygonAreaSqm(coords) {
  if (!coords || coords.length < 3) return 0;
  const lat0 = coords[0][1];
  const mx = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const my = 110540;
  let a = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[i + 1];
    a += x1 * mx * (y2 * my) - x2 * mx * (y1 * my);
  }
  return Math.round(Math.abs(a) / 2);
}

// [id, state, district, taluka, village, surveyNo, lat, lng, size, landUse, status, valuationINR, loan, chain]
// chain = list of owner-sets over time; each owner-set is [name, share%][]
const SPEC = [
  ['MH-PUN-0412', 'Maharashtra', 'Pune', 'Haveli', 'Wagholi', 'Gat No. 412/2A', 18.5793, 73.9822, 0.0011, 'Residential', 'Verified', 18400000, null,
    [[['Rajesh Kulkarni', 100]], [['Sunita Deshmukh', 100]], [['Anand Patil', 60], ['Meera Patil', 40]]]],
  ['MH-PUN-0977', 'Maharashtra', 'Pune', 'Mulshi', 'Pirangut', 'S. No. 97/7', 18.5106, 73.6741, 0.0019, 'Agricultural', 'Verified', 9650000, null,
    [[['Yashwant Gaikwad', 100]], [['Kavita Pawar', 50], ['Mahesh Jadhav', 50]]]],
  ['MH-PUN-1204', 'Maharashtra', 'Pune', 'Maval', 'Talegaon', 'Gat No. 1204', 18.7351, 73.6755, 0.0016, 'Industrial', 'Encumbered', 42500000, { bank: 'Bank of Maharashtra', amount: 21000000 },
    [[['Shinde Agro Pvt Ltd', 100]], [['Vikram Shinde', 100]]]],
  ['MH-NSK-0318', 'Maharashtra', 'Nashik', 'Niphad', 'Pimpalgaon Baswant', 'Gat No. 318/1', 20.1702, 73.9879, 0.0024, 'Agricultural', 'Verified', 6200000, null,
    [[['Ganesh Naik', 100]], [['Ganesh Naik', 50], ['Prakash Naik', 50]]]],
  ['MH-THN-0560', 'Maharashtra', 'Thane', 'Bhiwandi', 'Kalher', 'S. No. 56/3B', 19.2443, 73.0326, 0.0009, 'Commercial', 'Pending', 31800000, null,
    [[['Farhan Shaikh', 100]], [['Ritu Agarwal', 100]]]],
  ['MH-RGD-0221', 'Maharashtra', 'Raigad', 'Panvel', 'Karanjade', 'S. No. 22/1', 18.9894, 73.1175, 0.0012, 'Residential', 'Verified', 14750000, { bank: 'State Bank of India', amount: 6500000 },
    [[['Deepa Shetty', 100]]]],
  ['MH-KOP-0743', 'Maharashtra', 'Kolhapur', 'Karvir', 'Uchgaon', 'R. S. No. 743', 16.6829, 74.2662, 0.0014, 'Agricultural', 'Disputed', 5300000, null,
    [[['Shankar Mane', 100]], [['Sujata Mane', 34], ['Rohit Mane', 33], ['Pooja Mane', 33]]]],
  ['MH-NGP-0189', 'Maharashtra', 'Nagpur', 'Hingna', 'Wanadongri', 'Kh. No. 189', 21.0965, 78.9732, 0.0013, 'Residential', 'Verified', 8900000, null,
    [[['Sanjay Wankhede', 100]], [['Arjun Rao', 100]]]],
  ['KA-BLR-1102', 'Karnataka', 'Bengaluru Urban', 'Anekal', 'Chandapura', 'Sy. No. 110/2', 12.8015, 77.7081, 0.001, 'Residential', 'Verified', 22600000, { bank: 'Canara Bank', amount: 9800000 },
    [[['Lakshmi Gowda', 100]], [['Kiran Hegde', 70], ['Shalini Hegde', 30]]]],
  ['KA-BLR-0458', 'Karnataka', 'Bengaluru Urban', 'Yelahanka', 'Jakkur', 'Sy. No. 45/8', 13.0786, 77.6088, 0.0008, 'Commercial', 'Pending', 56300000, null,
    [[['Suresh Reddy', 100]], [['Ananya Murthy', 100]]]],
  ['KA-MYS-0634', 'Karnataka', 'Mysuru', 'Mysuru', 'Bogadi', 'Sy. No. 63/4', 12.3131, 76.6107, 0.0015, 'Residential', 'Verified', 11200000, null,
    [[['Prakash Kamath', 100]], [['Nikhil Bhat', 100]]]],
  ['KA-BGM-0271', 'Karnataka', 'Belagavi', 'Belagavi', 'Udyambag', 'R. S. No. 27/1', 15.8227, 74.4889, 0.0017, 'Industrial', 'Verified', 33400000, { bank: 'Karnataka Bank', amount: 15000000 },
    [[['Belgaum Castings LLP', 100]]]],
  ['KA-DWD-0905', 'Karnataka', 'Dharwad', 'Hubballi', 'Gokul', 'Sy. No. 90/5', 15.3739, 75.1012, 0.0013, 'Commercial', 'Encumbered', 19800000, { bank: 'HDFC Bank', amount: 12000000 },
    [[['Mahantesh Patil', 100]], [['Shreya Kulkarni', 100]]]],
  ['KA-UDP-0332', 'Karnataka', 'Udupi', 'Udupi', 'Manipal', 'Sy. No. 33/2', 13.3523, 74.7869, 0.0009, 'Residential', 'Verified', 12900000, null,
    [[['Sadashiva Acharya', 100]], [['Vinaya Pai', 50], ['Harish Pai', 50]]]],
];

function buildHistory(id, state, taluka, chain, valuation, loan) {
  const rnd = seeded(id + 'hist');
  const events = [];
  const span = chain.length + (loan ? 1 : 0);
  // spread events so the most recent one lands in 2025–2026
  let date = new Date(2026 - span * 1.6 - rnd(), Math.floor(rnd() * 12), 1 + Math.floor(rnd() * 27));
  const officers = [`Sub-Registrar, ${taluka}`, `Sub-Registrar, ${taluka}-II`, `Tehsildar Office, ${taluka}`];
  const ownersLabel = (set) => set.map(([n]) => n).join(', ');

  chain.forEach((set, i) => {
    const officer = officers[Math.floor(rnd() * officers.length)];
    if (i === 0) {
      events.push({ type: 'Registered', date: date.toISOString(), to: ownersLabel(set), officer,
        note: 'Parcel boundary digitised from survey sketch and anchored on-chain.' });
    } else {
      const prev = chain[i - 1];
      const isPartition = set.length > 1 && prev.length === 1 && set.some(([n]) => n === prev[0][0]);
      events.push({
        type: isPartition ? 'Co-ownership' : 'Transfer', date: date.toISOString(),
        from: ownersLabel(prev), to: set.map(([n, s]) => (set.length > 1 ? `${n} (${s}%)` : n)).join(', '),
        consideration: isPartition ? null : Math.round((valuation * (0.55 + i * 0.12 + rnd() * 0.1)) / 10000) * 10000,
        officer,
        note: isPartition ? 'Undivided share added to the 7/12 extract.' : 'Sale deed registered; stamp duty paid.',
      });
    }
    date = new Date(date.getTime() + (420 + rnd() * 380) * 86400000);
  });

  if (loan) {
    events.push({ type: 'Encumbrance', date: date.toISOString(), to: loan.bank, officer: officers[0],
      consideration: loan.amount, note: `Mortgage lien recorded in favour of ${loan.bank}.` });
    date = new Date(date.getTime() + 200 * 86400000);
  }

  // assign block numbers + tx ids in chronological order
  let b = 1200 + Math.floor(seeded(id)() * 900);
  return events.map((e, i) => {
    b += 1800 + Math.floor(rnd() * 8000);
    return { ...e, id: `${id}-ev${i}`, block: b, txId: fakeHash(id + i) };
  });
}

export function buildDemoAssets() {
  return SPEC.map(([id, state, district, taluka, village, surveyNo, lat, lng, size, landUse, status, valuation, loan, chain]) => {
    const geometry = { type: 'Polygon', coordinates: [polygonAround(id, lat, lng, size)] };
    const owners = chain[chain.length - 1].map(([name, share]) => ({ name, share }));
    const history = buildHistory(id, state, taluka, chain, valuation, loan);
    const last = history[history.length - 1];
    return {
      id, state, district, taluka, village, surveyNo, landUse, status,
      isCommercial: landUse === 'Commercial' || landUse === 'Industrial',
      isLoan: !!loan, loan,
      assetValue: valuation,
      owners,
      geometry,
      centroid: [lat, lng],
      areaSqm: polygonAreaSqm(geometry.coordinates[0]),
      history,
      lastUpdated: last.date,
      lastBlock: last.block,
      channel: 'landchannel',
      chaincode: 'landreg v2.1',
      endorsedBy: state === 'Maharashtra' ? ['RevenueMH-MSP', 'RegistrarOrg-MSP'] : ['RevenueKA-MSP', 'RegistrarOrg-MSP'],
    };
  });
}

export const DISTRICTS = {
  Maharashtra: { Pune: ['Haveli', 'Mulshi', 'Maval'], Nashik: ['Niphad'], Thane: ['Bhiwandi'], Raigad: ['Panvel'], Kolhapur: ['Karvir'], Nagpur: ['Hingna'] },
  Karnataka: { 'Bengaluru Urban': ['Anekal', 'Yelahanka'], Mysuru: ['Mysuru'], Belagavi: ['Belagavi'], Dharwad: ['Hubballi'], Udupi: ['Udupi'] },
};
