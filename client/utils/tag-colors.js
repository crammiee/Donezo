const PALETTE = [
  { bg: 'rgba(37,99,235,0.10)',  text: '#2563eb' },
  { bg: 'rgba(16,185,129,0.10)', text: '#059669' },
  { bg: 'rgba(245,158,11,0.10)', text: '#d97706' },
  { bg: 'rgba(239,68,68,0.10)',  text: '#dc2626' },
  { bg: 'rgba(139,92,246,0.10)', text: '#7c3aed' },
  { bg: 'rgba(236,72,153,0.10)', text: '#db2777' },
  { bg: 'rgba(20,184,166,0.10)', text: '#0d9488' },
  { bg: 'rgba(249,115,22,0.10)', text: '#ea580c' },
];

export function getTagColor(tagName) {
  let hash = 0;
  for (const ch of tagName) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
