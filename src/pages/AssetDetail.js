import React from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import useAsync from '../lib/useAsync';
import * as f from '../lib/format';
import ParcelMap from '../components/ParcelMap';
import { StatusChip, UseChip, VerifiedBadge, Avatar, Timeline, Hash, Skeleton } from '../components/ui';
import { IconArrowLeft, IconTransfer, IconDownload, IconPin, IconBank, IconUsers, IconChevron } from '../components/Icons';

export default function AssetDetail() {
  const { id } = useParams();
  const { data: a, loading, error } = useAsync(() => api.getAsset(id), [id]);

  if (error) return <div className="page"><div className="empty empty--error"><h3>{String(error.message)}</h3><Link className="btn btn--secondary" to="/assets">Back to assets</Link></div></div>;
  if (loading || !a) return <div className="page"><Skeleton h={36} w={320} /><div style={{ height: 24 }} /><Skeleton h={420} /></div>;

  const ring = a.geometry?.coordinates?.[0] || [];
  const lastTx = a.history[a.history.length - 1];

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="crumbs"><Link to="/assets"><IconArrowLeft width={12} height={12} /> Assets</Link> <IconChevron width={12} height={12} /> {a.id}</div>
          <div className="title-row">
            <h1 className="mono-title">{a.id}</h1>
            <StatusChip status={a.status} />
            <UseChip use={a.landUse} />
          </div>
          <p className="page__sub"><IconPin width={14} height={14} /> {a.surveyNo} · {a.village}, {a.taluka} taluka, {a.district}, {a.state}</p>
        </div>
        <div className="page__actions">
          <button className="btn btn--secondary"><IconDownload width={16} height={16} />Title certificate</button>
          <Link to={`/transfer?asset=${a.id}`} className="btn btn--primary"><IconTransfer width={16} height={16} />Transfer ownership</Link>
        </div>
      </div>

      <div className="detail">
        <div className="detail__main">
          <section className="card card--flush">
            <div className="map-wrap">
              <ParcelMap geometry={a.geometry} seed={a.id} width={860} height={340} label={a.surveyNo.replace(/^(Gat No\.|S\. No\.|Sy\. No\.|R\. S\. No\.|Kh\. No\.)\s*/, '')} />
              <div className="map-legend">
                <span><i className="lg lg--parcel" />Parcel boundary</span>
                <span><i className="lg lg--road" />Road</span>
                <span><i className="lg lg--water" />Nala</span>
              </div>
            </div>
            <div className="geo-strip">
              <div><span>Area</span><strong>{f.sqm(a.areaSqm)}</strong><small>{f.acres(a.areaSqm)}</small></div>
              <div><span>Vertices</span><strong>{Math.max(ring.length - 1, 0)}</strong><small>GeoJSON Polygon</small></div>
              <div><span>Centroid</span><strong className="mono">{a.centroid ? `${a.centroid[0].toFixed(4)}°N` : '—'}</strong><small className="mono">{a.centroid ? `${a.centroid[1].toFixed(4)}°E` : ''}</small></div>
              <div><span>Boundary hash</span><strong><Hash value={a.boundaryHash || a.history[0]?.txId?.split('').reverse().join('')} /></strong><small>SHA-256 of GeoJSON</small></div>
            </div>
          </section>

          <section className="card">
            <div className="card__head">
              <div><h2>Ownership history</h2><p>Every state change for this parcel, newest first. Each entry is a committed Fabric transaction.</p></div>
              <span className="count-pill">{a.history.length} transactions</span>
            </div>
            <Timeline events={a.history} />
          </section>
        </div>

        <aside className="detail__side">
          <VerifiedBadge asset={a} />

          <section className="card">
            <div className="card__head card__head--tight"><h3><IconUsers width={16} height={16} />Current owners</h3></div>
            <ul className="owners">
              {a.owners.map((o, i) => (
                <li key={o.name}>
                  <Avatar name={o.name} size={34} tone={i} />
                  <div className="owners__body">
                    <div className="owners__row"><strong>{o.name}</strong><span className="mono">{o.share}%</span></div>
                    <div className="sharebar"><i style={{ width: `${o.share}%` }} /></div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <div className="card__head card__head--tight"><h3>Parcel details</h3></div>
            <dl className="kv">
              <div><dt>Survey / Gat no.</dt><dd>{a.surveyNo}</dd></div>
              <div><dt>Village</dt><dd>{a.village}</dd></div>
              <div><dt>Taluka</dt><dd>{a.taluka}</dd></div>
              <div><dt>District</dt><dd>{a.district}</dd></div>
              <div><dt>State</dt><dd>{a.state}</dd></div>
              <div><dt>Land use</dt><dd>{a.landUse}{a.isCommercial ? ' · commercial' : ''}</dd></div>
            </dl>
          </section>

          <section className="card">
            <div className="card__head card__head--tight"><h3><IconBank width={16} height={16} />Valuation & encumbrance</h3></div>
            <div className="valuation">
              <strong>{f.inr(a.assetValue)}</strong>
              <span>Guidance value · {f.inr(Math.round(a.assetValue / a.areaSqm))} / m²</span>
            </div>
            {a.loan ? (
              <div className="lien">
                <div><span>Active lien</span><strong>{a.loan.bank}</strong></div>
                <div className="num"><span>Outstanding</span><strong className="mono">{f.inrCompact(a.loan.amount)}</strong></div>
                <div className="sharebar sharebar--lien"><i style={{ width: `${Math.min(100, (a.loan.amount / a.assetValue) * 100)}%` }} /></div>
                <small>{Math.round((a.loan.amount / a.assetValue) * 100)}% loan-to-value</small>
              </div>
            ) : <p className="muted small">No encumbrance registered against this parcel.</p>}
          </section>

          <section className="card">
            <div className="card__head card__head--tight"><h3>Ledger metadata</h3></div>
            <dl className="kv kv--mono">
              <div><dt>Channel</dt><dd>{a.channel}</dd></div>
              <div><dt>Chaincode</dt><dd>{a.chaincode}</dd></div>
              <div><dt>Latest block</dt><dd>{f.block(a.lastBlock)}</dd></div>
              <div><dt>Latest tx</dt><dd><Hash value={lastTx?.txId} n={8} /></dd></div>
              <div><dt>Endorsers</dt><dd>{(a.endorsedBy || []).join(', ')}</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
