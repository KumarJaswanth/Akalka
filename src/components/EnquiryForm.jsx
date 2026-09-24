import { useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Magnetic } from './Reveal.jsx';
import { ArrowRight } from './icons.jsx';

/* Shared enquiry form (demo submit until the email backend lands).
   Used on Home and Contact with identical behaviour. */

export const PRODUCT_OPTIONS = [
  'Doors',
  'Sandwich Panels',
  'Cleanroom Panels',
  'Partition / Wall Panels',
  'Profiles & Accessories',
  'Multiple / full system',
];

export default function EnquiryForm({ defaultInterest = 'Doors' }) {
  const reduce = useReducedMotion();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    org: '',
    phone: '',
    interest: PRODUCT_OPTIONS.includes(defaultInterest) ? defaultInterest : 'Doors',
    msg: '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    setSent(true);
  };
  /* One deterministic burst — same particles every render. */
  const burst = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const ang = (i / 16) * Math.PI * 2 + 0.2;
        const dist = 90 + ((i * 37) % 70);
        return {
          x: Math.cos(ang) * dist,
          y: Math.sin(ang) * dist,
          s: 5 + ((i * 13) % 5),
          d: 0.5 + (i % 4) * 0.09,
        };
      }),
    []
  );

  if (sent) {
    const first = form.name.split(' ')[0] || 'there';
    const msgShort =
      form.msg.length > 140 ? `${form.msg.slice(0, 140).trimEnd()}…` : form.msg;
    return (
      <motion.div
        className="sent-card thanks-v2"
        initial={reduce ? false : { opacity: 0, y: 34, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="thanks-burst" aria-hidden="true">
          {burst.map((p, i) => (
            <motion.i
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={
                reduce
                  ? { opacity: 0 }
                  : { x: p.x, y: p.y, opacity: 0, scale: 0.4 }
              }
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.45 + p.d * 0.3 }}
              style={{ width: p.s, height: p.s }}
            />
          ))}
        </span>
        <motion.span
          className="thanks-check big"
          aria-hidden="true"
          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        >
          <svg viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="29" stroke="currentColor" strokeWidth="2.5" className="ring" />
            <path d="M21 33.5 28.5 41 43 25.5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="tick" />
          </svg>
        </motion.span>
        <motion.p
          className="meta"
          style={{ color: 'var(--datum-ink)' }}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Enquiry received
        </motion.p>
        <motion.h2
          className="h2"
          style={{ fontSize: 'clamp(2rem, 4vw, 2.9rem)', textWrap: 'balance' }}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58, duration: 0.55 }}
        >
          Thank you, {first} — it&apos;s with us.
        </motion.h2>
        <motion.div
          className="thanks-recap"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.55 }}
        >
          <div>
            <span className="meta">Interest</span>
            <b>{form.interest}</b>
          </div>
          <div>
            <span className="meta">Reach you</span>
            <b>{form.phone}</b>
          </div>
          {form.org && (
            <div>
              <span className="meta">Project</span>
              <b>{form.org}</b>
            </div>
          )}
          <div className="wide">
            <span className="meta">Requirement</span>
            <p className="body-sm" style={{ margin: 0 }}>{msgShort}</p>
          </div>
        </motion.div>
        <motion.div
          className="thanks-steps"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {[
            ['01', 'We review', 'Sizes, options and drawings against the confirmed range.'],
            ['02', 'We confirm', 'A specification with nothing assumed or invented.'],
            ['03', 'We proceed', 'Next steps agreed directly with you.'],
          ].map((s) => (
            <div key={s[0]}>
              <span className="meta">{s[0]}</span>
              <b>{s[1]}</b>
              <p className="body-sm">{s[2]}</p>
            </div>
          ))}
        </motion.div>
        <motion.div
          className="thanks-actions"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.5 }}
        >
          <button className="btn btn-solid" onClick={() => setSent(false)}>Send another enquiry</button>
          <Link to="/products" className="btn">Browse catalogue</Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <form
      className="form"
      onSubmit={submit}
    >
      <div className="form-2col">
        <div className="field">
          <label htmlFor="eq-name">Full name *</label>
          <input
            id="eq-name"
            required
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Project Engineer"
            autoComplete="name"
          />
        </div>
        <div className="field">
          <label htmlFor="eq-org">Company / project</label>
          <input
            id="eq-org"
            value={form.org}
            onChange={set('org')}
            placeholder="Company or site name"
            autoComplete="organization"
          />
        </div>
      </div>
      <div className="form-2col">
        <div className="field">
          <label htmlFor="eq-phone">Phone / email *</label>
          <input
            id="eq-phone"
            required
            value={form.phone}
            onChange={set('phone')}
            placeholder="How do we reach you?"
            autoComplete="tel"
          />
        </div>
        <div className="field">
          <label htmlFor="eq-int">Product interest *</label>
          <select id="eq-int" value={form.interest} onChange={set('interest')}>
            {PRODUCT_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="eq-msg">Requirement details *</label>
        <textarea
          id="eq-msg"
          required
          value={form.msg}
          onChange={set('msg')}
          placeholder="Quantities, sizes, thicknesses (50 / 100 mm), finishes, site location, timeline…"
        />
      </div>
      <div>
        <Magnetic>
          <button type="submit" className="btn btn-solid">
            Submit enquiry <ArrowRight className="arr arr-r" />
          </button>
        </Magnetic>
        <p className="meta" style={{ marginTop: 14, color: 'var(--muted-fg)' }}>
          Drawings can be attached after first contact (TBC).
        </p>
      </div>
    </form>
  );
}
