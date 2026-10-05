import React from 'react';
import { Link } from 'react-router-dom';
import ParcelMap from '../components/ParcelMap';
import { Avatar } from '../components/ui';
import { IconArrowRight, IconShield, IconTransfer, IconUsers, IconLock, IconBlock, IconFile, IconCheck, IconBank } from '../components/Icons';

const heroGeometry = { type: 'Polygon', coordinates: [[[73.9812, 18.5803], [73.9834, 18.5806], [73.9839, 18.5788], [73.9822, 18.5779], [73.9806, 18.5787], [73.9812, 18.5803]]] };

export default function Landing() {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero__grid" aria-hidden="true" />
        <div className="hero__inner">
          <div className="hero__copy">
            <span className="eyebrow eyebrow--dark"><IconBlock width={14} height={14} />Permissioned land registry · Hyperledger Fabric</span>
            <h1>Every parcel, every owner, <span>one verifiable record.</span></h1>
            <p className="hero__lead">
              We believe in a world where barriers to real estate are removed. Chainify anchors land titles,
              transfers and liens on a shared ledger that revenue departments, sub-registrars and banks can all verify — in seconds, not months.
            </p>
            <div className="hero__cta">
              <Link to="/assets" className="btn btn--accent btn--lg">Open the registry <IconArrowRight width={16} height={16} /></Link>
              <Link to="/assets/new" className="btn btn--ghost-dark btn--lg">Register a parcel</Link>
            </div>
            <ul className="hero__trust">
              <li><IconCheck width={14} height={14} />Dual-org endorsement policy</li>
              <li><IconCheck width={14} height={14} />GeoJSON boundaries</li>
              <li><IconCheck width={14} height={14} />Full audit trail</li>
            </ul>
          </div>

          <div className="hero__visual">
            <div className="hv-map">
              <ParcelMap geometry={heroGeometry} seed="hero" width={560} height={440} north={false} label="Gat 412/2A" />
            </div>
            <div className="hv-card hv-card--title">
              <div className="hv-card__row">
                <span className="hv-ico hv-ico--ok"><IconShield width={18} height={18} /></span>
                <div>
                  <strong>Title verified</strong>
                  <small>MH-PUN-0412 · block #41,962</small>
                </div>
              </div>
              <div className="hv-owners">
                <Avatar name="Anand Patil" size={26} /><Avatar name="Meera Patil" size={26} tone={2} />
                <span>Anand Patil <b>60%</b> · Meera Patil <b>40%</b></span>
              </div>
            </div>
            <div className="hv-card hv-card--tx">
              <span className="hv-ico"><IconTransfer width={16} height={16} /></span>
              <div>
                <strong>Transfer endorsed</strong>
                <small>RevenueMH · RegistrarOrg · tx 9f3c1a…e04b</small>
              </div>
              <span className="hv-time">2.4s</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stats__inner">
          <div><strong>2.4 s</strong><span>median time to finality for a mutation entry</span></div>
          <div><strong>0</strong><span>duplicate titles — every survey number is unique on-ledger</span></div>
          <div><strong>2 orgs</strong><span>revenue and registrar must both endorse a transfer before commit</span></div>
          <div><strong>100%</strong><span>of ownership changes carry a block number and tx hash</span></div>
        </div>
      </section>

      <section className="features">
        <div className="section-head">
          <span className="eyebrow">What it does</span>
          <h2>Built for the people who keep the land record honest</h2>
          <p>Registrars, revenue officers and lenders work from the same state — no reconciling paper 7/12 extracts against bank files.</p>
        </div>
        <div className="features__grid">
          <article className="feature">
            <span className="feature__ico"><IconFile /></span>
            <h3>Tamper-evident titles</h3>
            <p>Each parcel is stored with its survey number, GeoJSON boundary, valuation and owners. Any change produces a new, signed ledger entry.</p>
          </article>
          <article className="feature">
            <span className="feature__ico"><IconTransfer /></span>
            <h3>Endorsed transfers</h3>
            <p>Ownership moves only after the revenue department and the registrar both endorse the transaction — the history is permanent and queryable.</p>
          </article>
          <article className="feature">
            <span className="feature__ico"><IconUsers /></span>
            <h3>Co-ownership & shares</h3>
            <p>Record undivided shares between family members or partners, with share percentages enforced to always total 100%.</p>
          </article>
          <article className="feature">
            <span className="feature__ico"><IconBank /></span>
            <h3>Liens lenders can trust</h3>
            <p>Banks register mortgages against a parcel, so encumbrances are visible to every buyer before a sale deed is drawn.</p>
          </article>
        </div>
      </section>

      <section className="how">
        <div className="how__inner">
          <div className="section-head section-head--left">
            <span className="eyebrow">How a transfer works</span>
            <h2>From sale deed to settled title in four steps</h2>
          </div>
          <ol className="how__steps">
            <li><span>01</span><h4>Initiate</h4><p>Registrar selects the parcel and enters the buyer, consideration and stamp duty reference.</p></li>
            <li><span>02</span><h4>Endorse</h4><p>Revenue and registrar peers simulate the chaincode and sign the proposal.</p></li>
            <li><span>03</span><h4>Commit</h4><p>The ordering service cuts a block; every peer validates and commits the new state.</p></li>
            <li><span>04</span><h4>Verify</h4><p>Anyone with access can verify the title against the block hash — instantly.</p></li>
          </ol>
        </div>
      </section>

      <section className="cta-band">
        <div>
          <h2>See the live registry</h2>
          <p>Browse 14 demo parcels across Maharashtra and Karnataka, with full ownership history.</p>
        </div>
        <Link to="/assets" className="btn btn--accent btn--lg">Browse assets <IconArrowRight width={16} height={16} /></Link>
        <span className="cta-band__lock"><IconLock width={14} height={14} />Role-based access via Fabric CA identities</span>
      </section>
    </div>
  );
}
