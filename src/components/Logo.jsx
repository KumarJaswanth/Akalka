import { useState } from 'react';

/* Door mark drawn from the AKALKA logo: charcoal door slab,
   lime frame + handle, white rounded badge. */
export function DoorMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
      <rect x="2.5" y="2.5" width="35" height="35" rx="10" fill="#fff" stroke="#42474D" strokeWidth="2.5" />
      <path d="M10 32V9l9 4v19z" fill="#42474D" />
      <path d="M21 11.5h8.5a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H21" stroke="#7DB200" strokeWidth="2.5" />
      <circle cx="15" cy="21" r="2.4" fill="#7DB200" />
    </svg>
  );
}

/* Uses the official logo file when present (public/akalka-logo.png),
   otherwise falls back to a drawn lockup echoing the brand. */
export default function Logo({ height = 42, big = false }) {
  const [real, setReal] = useState(true);
  if (real) {
    return (
      <img
        src="/akalka-logo.png"
        alt="AKALKA Doors and Panels — crafted with care"
        height={height}
        className={big ? 'logo-img big' : 'logo-img'}
        onError={() => setReal(false)}
      />
    );
  }
  return (
    <span className="logo-fallback" role="img" aria-label="AKALKA Doors and Panels">
      <DoorMark size={Math.round(height)} />
      <span className="logo-word">akalka</span>
      <span className="logo-sub">Doors / Panels</span>
    </span>
  );
}
