import React, { useState } from 'react';
import { IconShield, IconCopy, IconCheck, IconBlock, IconTransfer, IconLock, IconFile, IconUsers, IconAlert } from './Icons';
import * as f from '../lib/format';

const STATUS = {
  Verified: { cls: 'chip--ok', label: 'Verified' },
  Pending: { cls: 'chip--warn', label: 'Pending mutation' },
  Encumbered: { cls: 'chip--info', label: 'Encumbered' },
  Disputed: { cls: 'chip--bad', label: 'Disputed' },
};

export function StatusChip({ status }) {
  const s = STATUS[status] || { cls: '', label: status };
  return <span className={`chip ${s.cls}`}><i className="chip__dot" />{s.label}</span>;
}

export function UseChip({ use }) {
  return <span className={`tag tag--${(use || '').toLowerCase()}`}>{use}</span>;
}

export function Hash({ value, n = 6 }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="muted">—</span>;
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button type="button" className="hash" onClick={copy} title={value}>
      <span>{f.shortHash(value, n)}</span>
      {copied ? <IconCheck width={13} height={13} /> : <IconCopy width={13} height={13} />}
    </button>
  );
}

export function VerifiedBadge({ asset, compact }) {
  const ok = asset.status !== 'Disputed';
  return (
    <div className={`verify ${ok ? '' : 'verify--bad'} ${compact ? 'verify--compact' : ''}`}>
      <div className="verify__icon">{ok ? <IconShield width={22} height={22} /> : <IconAlert width={22} height={22} />}</div>
      <div className="verify__body">
        <strong>{ok ? 'Record anchored on-chain' : 'Record under dispute'}</strong>
        <span>
          {ok ? `Hash matches ledger state at block ${f.block(asset.lastBlock)}` : 'Mutations frozen pending tribunal order'}
          {!compact && asset.endorsedBy && <> · endorsed by {asset.endorsedBy.join(' + ')}</>}
        </span>
      </div>
    </div>
  );
}

export function Avatar({ name, size = 32, tone = 0 }) {
  const tones = ['#1F3A5F', '#2D4F3A', '#5B3A1F', '#3B2D5F', '#1F4F55'];
  const t = tones[(name.charCodeAt(0) + name.length + tone) % tones.length];
  return <span className="avatar" style={{ width: size, height: size, background: t, fontSize: size * 0.38 }}>{f.initials(name)}</span>;
}

const EV_ICON = { Registered: IconFile, Transfer: IconTransfer, 'Co-ownership': IconUsers, Encumbrance: IconLock };

export function Timeline({ events }) {
  const items = [...events].reverse();
  return (
    <ol className="timeline">
      {items.map((e, i) => {
        const Icon = EV_ICON[e.type] || IconBlock;
        return (
          <li key={e.id} className={`tl tl--${e.type.toLowerCase().replace(/[^a-z]/g, '')} ${i === 0 ? 'tl--latest' : ''}`}>
            <div className="tl__rail"><span className="tl__icon"><Icon width={15} height={15} /></span></div>
            <div className="tl__card">
              <div className="tl__head">
                <strong>{e.type === 'Co-ownership' ? 'Co-ownership recorded' : e.type === 'Encumbrance' ? 'Lien registered' : e.type === 'Registered' ? 'Parcel registered' : 'Ownership transferred'}</strong>
                {i === 0 && <span className="pill">Current</span>}
                <span className="tl__date">{f.date(e.date)}</span>
              </div>
              <div className="tl__parties">
                {e.from && <><span className="tl__from">{e.from}</span><span className="tl__arrow">→</span></>}
                <span className="tl__to">{e.to}</span>
              </div>
              {e.note && <p className="tl__note">{e.note}</p>}
              <dl className="tl__meta">
                <div><dt>Block</dt><dd className="mono">{f.block(e.block)}</dd></div>
                <div><dt>Tx</dt><dd><Hash value={e.txId} /></dd></div>
                {e.consideration ? <div><dt>{e.type === 'Encumbrance' ? 'Lien' : 'Consideration'}</dt><dd className="mono">{f.inr(e.consideration)}</dd></div> : null}
                <div><dt>Office</dt><dd>{e.officer}</dd></div>
              </dl>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function Skeleton({ h = 16, w = '100%', style }) {
  return <span className="skeleton" style={{ height: h, width: w, ...style }} />;
}

export function Field({ label, hint, error, ok, children, span }) {
  return (
    <label className={`field ${error ? 'field--error' : ''} ${ok ? 'field--ok' : ''} ${span ? `span-${span}` : ''}`}>
      <span className="field__label">{label}</span>
      {children}
      {error ? <span className="field__msg field__msg--error"><IconAlert width={13} height={13} />{error}</span>
        : hint ? <span className="field__msg">{hint}</span> : null}
    </label>
  );
}
