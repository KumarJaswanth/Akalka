import { useState } from 'react';

/* Official AKALKA lockup — the vector artwork (public/akalka-logo.svg),
   sharp at every size and screen density. Should the file ever fail to
   load, the symbol is drawn inline beside the wordmark, so the brand never
   disappears. */

const LOGO_RATIO = 1600 / 534;

function Symbol({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="36 101 286 290" aria-hidden="true" focusable="false">
      <path fill="#5d5d5d" d="M268 105L317.2 105L317.2 371.9L268 371.9L268 340.2A137.2 137.2 0 0 1 201 371.9L201 325.5C248.8 309.4 268 272 268 248L268 211A96 96 0 0 0 83 247L83 347.6A139 139 0 0 1 268 140.5Z" />
      <path fill="#fe7219" d="M162.5 175L194.4 175A60 60 0 0 1 254.4 235L254.4 239.9A44 44 0 0 1 210.4 283.9L156 283.9A73.6 73.6 0 0 0 101.5 311L101.5 236A61 61 0 0 1 162.5 175ZM102 333.2L102 326.5A61.4 61.4 0 0 1 155.7 291.1L155.7 386.9A53.7 53.7 0 0 1 102 333.2Z" />
    </svg>
  );
}

export default function Logo({ height = 42, big = false }) {
  const [failed, setFailed] = useState(false);
  const cls = big ? 'logo-img big' : 'logo-img';
  if (!failed) {
    return (
      <img
        /* BASE_URL keeps the mark working under the /Akalka/ subpath. */
        src={`${import.meta.env.BASE_URL}akalka-logo.svg`}
        alt="AKALKA Doors and Panels — crafted with care"
        width={Math.round(height * LOGO_RATIO)}
        height={height}
        decoding="async"
        className={cls}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span className="logo-fallback" role="img" aria-label="AKALKA Doors and Panels">
      <Symbol size={Math.round(height)} />
      <span className="logo-word">akalka</span>
      <span className="logo-sub">Doors / Panels</span>
    </span>
  );
}
