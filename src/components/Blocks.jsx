import { useRef } from 'react';
import { useScrollVar } from './Reveal.jsx';
import { srcSetFor } from '../data/images.js';

/* Two light, self-contained scroll blocks used across the pages. They live
   apart from Scenes.jsx (the 3D room, door and panel) so the pages that only
   need these — Products, About, Contact — never download the 3D code. */

/* =================================================================
   2. Image expand — a framed photograph grows to full bleed while the
   headline parts around it, then the statement lands on the image.
   Transform-only (composited); the frame never re-lays out.
   ================================================================= */
export function ImageExpand({ img, left, right, kicker, children }) {
  const ref = useRef(null);
  useScrollVar(ref, { mode: 'pin' });
  return (
    <section className="xp" ref={ref} aria-label={`${left} ${right}`}>
      <div className="xp-pin">
        <div className="xp-frame">
          <img src={img.src} srcSet={srcSetFor(img.src)} sizes="100vw" alt={img.alt} loading="lazy" decoding="async" />
          <div className="xp-shade" aria-hidden="true" />
        </div>
        <h2 className="xp-words" aria-hidden="true">
          <span className="xp-l">{left}</span>
          <span className="xp-r font-hand">{right}</span>
        </h2>
        <div className="xp-copy wrap on-dark">
          <p className="meta">{kicker}</p>
          {children}
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   4. Process — how an order moves, with a rule that fills as the
   section crosses the viewport and lights each step in turn.
   ================================================================= */
export const PROCESS = [
  { n: '01', t: 'Choose the range', d: 'Doors, sandwich, cleanroom, partition, glass or profiles — start from the catalogue.' },
  { n: '02', t: 'Send the sizes', d: 'Drawings, opening schedules, panel layouts or a bill of quantities.' },
  { n: '03', t: 'Confirm the specification', d: 'Variant, core, thickness, finish and colour confirmed back to you. Nothing assumed.' },
  { n: '04', t: 'Manufactured to order', d: 'Produced to the confirmed specification, as one coordinated system.' },
];

export const PROCESS_STEPS = PROCESS.length;

/* `vertical` runs the steps down the page instead of across it (About). */
export function Process({ vertical = false }) {
  const ref = useRef(null);
  useScrollVar(ref, { mode: 'view' });
  return (
    <div className={`proc${vertical ? ' proc-v' : ''}`} ref={ref}>
      <div className="proc-rule" aria-hidden="true"><span /></div>
      <ol className="proc-steps">
        {PROCESS.map((s, i) => (
          <li key={s.n} style={{ '--i': i }}>
            <span className="proc-dot" aria-hidden="true" />
            <span className="meta proc-n">{s.n}</span>
            <h3 className="h3">{s.t}</h3>
            <p className="body-sm">{s.d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
