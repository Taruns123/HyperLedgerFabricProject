import React from 'react';

const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const mk = (paths) => (props) => <svg {...base} {...props} aria-hidden="true">{paths}</svg>;

export const IconLogo = (props) => (
  <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" {...props}>
    <rect x="1" y="1" width="30" height="30" rx="8" fill="var(--accent)" />
    <path d="M9 11.5 16 8l7 3.5v9L16 24l-7-3.5z" fill="none" stroke="var(--ink-900)" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M9 11.5 16 15l7-3.5M16 15v9" fill="none" stroke="var(--ink-900)" strokeWidth="2.2" strokeLinejoin="round" />
  </svg>
);
export const IconSearch = mk(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);
export const IconShield = mk(<><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z" /><path d="m8.8 12 2.2 2.2 4.4-4.4" /></>);
export const IconArrowRight = mk(<path d="M5 12h14m-6-6 6 6-6 6" />);
export const IconArrowLeft = mk(<path d="M19 12H5m6 6-6-6 6-6" />);
export const IconPlus = mk(<path d="M12 5v14M5 12h14" />);
export const IconTransfer = mk(<><path d="M4 8h13l-3.5-3.5" /><path d="M20 16H7l3.5 3.5" /></>);
export const IconUsers = mk(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.5 3.2-5.5 6.5-5.5s5.9 2 6.5 5.5" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .6 3.2 2.4 3.5 5.2" /></>);
export const IconGrid = mk(<><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>);
export const IconBlock = mk(<><path d="M12 2.8 20 7.4v9.2l-8 4.6-8-4.6V7.4z" /><path d="m4 7.4 8 4.6 8-4.6M12 12v9.2" /></>);
export const IconMap = mk(<><path d="m9 4-5.5 2v14L9 18l6 2 5.5-2V4L15 6z" /><path d="M9 4v14m6-12v14" /></>);
export const IconCheck = mk(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const IconCopy = mk(<><rect x="8.5" y="8.5" width="12" height="12" rx="2" /><path d="M15.5 8.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v9A1.5 1.5 0 0 0 5 15.5h3.5" /></>);
export const IconFilter = mk(<path d="M4 5h16l-6 7.5V19l-4 1.5v-8z" />);
export const IconDownload = mk(<><path d="M12 4v11m-5-5 5 5 5-5" /><path d="M4.5 19.5h15" /></>);
export const IconFile = mk(<><path d="M14 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z" /><path d="M14 3.5V8h4.5M9 13h6m-6 3.5h4" /></>);
export const IconLock = mk(<><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>);
export const IconBank = mk(<><path d="M3.5 9.5 12 4l8.5 5.5z" /><path d="M5.5 10v7.5m4.3-7.5v7.5m4.4-7.5v7.5m4.3-7.5v7.5M3.5 20.5h17" /></>);
export const IconMenu = mk(<path d="M4 7h16M4 12h16M4 17h16" />);
export const IconClose = mk(<path d="m6 6 12 12M18 6 6 18" />);
export const IconAlert = mk(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v5.5m0 3.3v.2" /></>);
export const IconPin = mk(<><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></>);
export const IconRupee = mk(<path d="M7 4.5h10M7 9h10M7 4.5h3.5a4.5 4.5 0 0 1 0 9H7l7.5 7" />);
export const IconChevron = mk(<path d="m9 6 6 6-6 6" />);
export const IconSpark = mk(<path d="M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18M6 18l2.5-2.5m7-7L18 6" />);
