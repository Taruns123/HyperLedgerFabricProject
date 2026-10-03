import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { IconLogo, IconGrid, IconPlus, IconTransfer, IconUsers, IconMenu, IconClose } from './Icons';
import { DEMO } from '../api';

const NAV = [
  { to: '/assets', label: 'Assets', icon: IconGrid, end: true },
  { to: '/assets/new', label: 'Create asset', icon: IconPlus },
  { to: '/transfer', label: 'Transfer ownership', icon: IconTransfer },
  { to: '/co-ownership', label: 'Multiple ownership', icon: IconUsers },
];

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const landing = pathname === '/';
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className={`shell ${landing ? 'shell--landing' : ''}`}>
      <header className="topbar">
        <div className="topbar__inner">
          <Link to="/" className="brand">
            <IconLogo />
            <span className="brand__name">Chainify<small>Land Registry</small></span>
          </Link>
          <nav className={`nav ${open ? 'nav--open' : ''}`}>
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}>
                <Icon width={16} height={16} />{label}
              </NavLink>
            ))}
          </nav>
          <div className="topbar__right">
            <span className="netpill" title="Hyperledger Fabric channel">
              <i className="netpill__dot" />landchannel{DEMO && <em>demo</em>}
            </span>
            <span className="user">
              <span className="user__avatar">SR</span>
              <span className="user__meta"><strong>S. Rao</strong><small>Sub-Registrar · Haveli-II</small></span>
            </span>
            <button className="menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Toggle navigation">
              {open ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">
        <div className="footer__inner">
          <span>© 2026 Chainify · Permissioned land registry on Hyperledger Fabric 2.5</span>
          <span className="footer__links"><span>Status: all peers healthy</span><span>Docs</span><span>Audit API</span></span>
        </div>
      </footer>
    </div>
  );
}
