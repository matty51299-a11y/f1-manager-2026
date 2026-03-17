/* TEAM BADGES (SVG) */
function TeamBadge({ teamId, size = 22 }) {
  const s = size;
  const b = {
    mclaren: (<svg viewBox="0 0 40 40" width={s} height={s}><circle cx="20" cy="20" r="18" fill="#FF8000"/><path d="M12 26 L16 14 L20 22 L24 14 L28 26" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>),
    ferrari: (<svg viewBox="0 0 40 40" width={s} height={s}><rect x="4" y="4" width="32" height="32" rx="3" fill="#DC2626"/><text x="20" y="28" textAnchor="middle" fill="#FFD700" fontSize="22" fontWeight="900" fontFamily="serif">F</text></svg>),
    redbull: (<svg viewBox="0 0 40 40" width={s} height={s}><circle cx="20" cy="20" r="18" fill="#1E3A8A"/><path d="M12 22 Q16 12 20 18 Q24 12 28 22" stroke="#E2B53A" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="20" cy="14" r="2" fill="#DC2626"/></svg>),
    mercedes: (<svg viewBox="0 0 40 40" width={s} height={s}><circle cx="20" cy="20" r="18" fill="#00D2BE"/><circle cx="20" cy="20" r="12" fill="none" stroke="#fff" strokeWidth="1.5"/><line x1="20" y1="8" x2="20" y2="20" stroke="#fff" strokeWidth="2"/><line x1="20" y1="20" x2="10" y2="30" stroke="#fff" strokeWidth="2"/><line x1="20" y1="20" x2="30" y2="30" stroke="#fff" strokeWidth="2"/></svg>),
    aston: (<svg viewBox="0 0 40 40" width={s} height={s}><polygon points="20,4 36,20 20,36 4,20" fill="#166534"/><text x="20" y="25" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900" fontFamily="sans-serif">AM</text></svg>),
    alpine: (<svg viewBox="0 0 40 40" width={s} height={s}><circle cx="20" cy="20" r="18" fill="#2563EB"/><path d="M14 28 L20 12 L26 28" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="23" x2="24" y2="23" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>),
    williams: (<svg viewBox="0 0 40 40" width={s} height={s}><rect x="4" y="4" width="32" height="32" rx="3" fill="#1D4ED8"/><text x="20" y="28" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="900" fontFamily="sans-serif">W</text></svg>),
    haas: (<svg viewBox="0 0 40 40" width={s} height={s}><rect x="4" y="4" width="32" height="32" rx="3" fill="#B91C1C"/><text x="20" y="28" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="900" fontFamily="sans-serif">H</text></svg>),
    audi: (<svg viewBox="0 0 40 40" width={s} height={s}><rect x="4" y="4" width="32" height="32" rx="16" fill="#374151"/><circle cx="11" cy="22" r="5" fill="none" stroke="#fff" strokeWidth="1.3"/><circle cx="17" cy="22" r="5" fill="none" stroke="#fff" strokeWidth="1.3"/><circle cx="23" cy="22" r="5" fill="none" stroke="#fff" strokeWidth="1.3"/><circle cx="29" cy="22" r="5" fill="none" stroke="#fff" strokeWidth="1.3"/></svg>),
    racingbulls: (<svg viewBox="0 0 40 40" width={s} height={s}><circle cx="20" cy="20" r="18" fill="#1E40AF"/><text x="20" y="26" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900" fontFamily="sans-serif">RB</text></svg>),
    cadillac: (<svg viewBox="0 0 40 40" width={s} height={s}><rect x="4" y="8" width="32" height="24" rx="3" fill="#78716C"/><polygon points="20,12 24,18 20,16 16,18" fill="#E2B53A"/><rect x="14" y="20" width="12" height="2" fill="#E2B53A" rx="1"/><rect x="16" y="24" width="8" height="2" fill="#E2B53A" rx="1"/></svg>),
  };
  return b[teamId] || <span style={{ width: s, height: s, borderRadius: "50%", background: "#555", display: "inline-block" }} />;
}

export default TeamBadge;
