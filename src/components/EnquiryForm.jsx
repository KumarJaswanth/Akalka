import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Magnetic } from './Reveal.jsx';
import { CATEGORIES } from '../data/products.js';
import { ArrowRight } from './icons.jsx';

/* Shared enquiry form.
   Behaviour: validates inline, then queues the enquiry on this device
   (localStorage) with a reference number and — when a backend endpoint
   is configured via VITE_ENQUIRY_ENDPOINT — forwards it there too.
   No contact details are invented: direct channels stay out of the site
   until the client supplies them (data/company.js). */

/* Derived from the catalogue, so a category can never be missing from the form. */
const PRODUCT_OPTIONS = [...CATEGORIES.map((c) => c.name), 'Multiple / full system'];

const MAX_FILES_MB = 25;
const ACCEPT = '.pdf,.dwg,.dxf,.zip,.jpg,.jpeg,.png';

function makeRef() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AK-${ymd}-${rand}`;
}

export default function EnquiryForm({ defaultInterest = 'Doors', defaultAsk = '', defaultMeta = '' }) {
  const reduce = useReducedMotion();
  const [sent, setSent] = useState(null);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    name: '',
    org: '',
    phone: '',
    email: '',
    interest: PRODUCT_OPTIONS.includes(defaultInterest) ? defaultInterest : 'Doors',
    /* Arriving from a "needs confirmation" mark: the question is already
       written, so the visitor never has to remember what they wanted to
       ask before they start typing. */
    msg: defaultAsk
      ? `Please confirm: ${defaultAsk}\n\nSizes, quantities and site location: `
      : '',
  });
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    /* Clearing a field clears its error — the visitor is already fixing it. */
    setErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev));
  };
  const [errors, setErrors] = useState({});
  const submit = (e) => {
    e.preventDefault();
    /* Native bubbles alone leave a keyboard user stranded at the button
       with no route to the problem. Validate inline, announce once, and
       move focus to the first field that needs attention. */
    const next = {};
    if (!form.name.trim()) next.name = 'Please tell us your name so we know who is asking.';
    if (!form.phone.trim() && !form.email.trim())
      next.phone = 'Please leave a phone number or an email so we can reply.';
    else {
      if (form.phone.trim() && !/^[+\d][\d\s\-()]{5,}$/.test(form.phone.trim()))
        next.phone = 'That phone number does not look complete — please check it.';
      if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
        next.email = 'That email does not look complete — please check it.';
    }
    if (!form.msg.trim()) next.msg = 'Please describe the requirement — sizes, quantities or drawings.';
    const totalMB = files.reduce((s, f) => s + f.size, 0) / (1024 * 1024);
    if (totalMB > MAX_FILES_MB) next.files = `Drawings total ${totalMB.toFixed(1)} MB — please keep attachments under ${MAX_FILES_MB} MB.`;
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = ['name', 'phone', 'email', 'msg', 'files'].find((k) => next[k]);
      const id = { name: 'eq-name', phone: 'eq-phone', email: 'eq-email', msg: 'eq-msg', files: 'eq-files' }[first];
      document.getElementById(id)?.focus();
      return;
    }
    const ref = makeRef();
    const enquiry = {
      ref,
      at: new Date().toISOString(),
      ...form,
      meta: defaultMeta,
      files: files.map((f) => ({ name: f.name, size: f.size })),
    };
    let queued = false;
    try {
      const key = 'akalka-enquiries';
      const prev = JSON.parse(window.localStorage.getItem(key) || '[]');
      prev.push(enquiry);
      window.localStorage.setItem(key, JSON.stringify(prev));
      queued = true;
    } catch {
      queued = false;
    }
    /* Optional backend forward — configured at build time. Absent by
       default, in which case the enquiry waits honestly in the device
       queue instead of pretending it was delivered. */
    const endpoint = import.meta.env.VITE_ENQUIRY_ENDPOINT;
    if (endpoint) {
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(enquiry) }).catch(() => {});
    }
    setSent({ ref, queued, forwarded: Boolean(endpoint) });
  };
  const fieldError = (k, id) =>
    errors[k] ? (
      <p className="field-error" id={`${id}-error`} role="alert">
        {errors[k]}
      </p>
    ) : null;

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
          Enquiry {sent.ref} — {sent.forwarded ? 'sent' : sent.queued ? 'saved on this device' : 'ready'}
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
        {!sent.forwarded && (
          <motion.p
            className="body-sm"
            style={{ marginTop: 'var(--s3)' }}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.64, duration: 0.5 }}
          >
            {sent.queued
              ? 'Quote this reference on first contact — your enquiry is queued on this device until an inbox is connected.'
              : 'Quote this reference on first contact — your browser could not store it, so keep a copy of the text below.'}
          </motion.p>
        )}
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
            <b>{[form.phone, form.email].filter(Boolean).join('  ·  ')}</b>
          </div>
          {form.org && (
            <div>
              <span className="meta">Project</span>
              <b>{form.org}</b>
            </div>
          )}
          {defaultMeta && (
            <div>
              <span className="meta">Configuration</span>
              <b>{defaultMeta}</b>
            </div>
          )}
          {files.length > 0 && (
            <div>
              <span className="meta">Drawings</span>
              <b>{files.length} file{files.length > 1 ? 's' : ''} attached on this device</b>
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
          <button className="btn btn-solid" onClick={() => { setSent(null); setFiles([]); }}>Send another enquiry</button>
          <Link to="/products" className="btn">Browse catalogue</Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <form
      className="form"
      onSubmit={submit}
      /* Custom inline validation below owns every error — native bubbles
         would fire first on empty submit and strand the visitor at the
         button with no route to the problem. */
      noValidate
    >
      {defaultMeta && (
        <div className="chips" style={{ marginBottom: 'var(--s5)' }} aria-label="Current configuration">
          <span className="chip chip-accent">{defaultMeta}</span>
        </div>
      )}
      <div className="form-2col">
        <div className="field">
          <label htmlFor="eq-name">Full name *</label>
          <input
            id="eq-name"
            required
            value={form.name}
            onChange={set('name')}
            placeholder="Your name"
            autoComplete="name"
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'eq-name-error' : undefined}
          />
          {fieldError('name', 'eq-name')}
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
          <label htmlFor="eq-phone">Phone</label>
          <input
            id="eq-phone"
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+91 …"
            autoComplete="tel"
            aria-invalid={errors.phone ? 'true' : undefined}
            aria-describedby={errors.phone ? 'eq-phone-error' : undefined}
          />
          {fieldError('phone', 'eq-phone')}
        </div>
        <div className="field">
          <label htmlFor="eq-email">Email</label>
          <input
            id="eq-email"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'eq-email-error' : undefined}
          />
          {fieldError('email', 'eq-email')}
        </div>
      </div>
      <div className="field">
        <label htmlFor="eq-int">Product interest *</label>
        <select id="eq-int" value={form.interest} onChange={set('interest')}>
          {PRODUCT_OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="eq-msg">Requirement details *</label>
        <textarea
          id="eq-msg"
          required
          value={form.msg}
          onChange={set('msg')}
          placeholder="Quantities, sizes, thicknesses (50 / 100 mm), finishes, site location, timeline…"
          aria-invalid={errors.msg ? 'true' : undefined}
          aria-describedby={errors.msg ? 'eq-msg-error' : undefined}
        />
        {fieldError('msg', 'eq-msg')}
      </div>
      <div className="field">
        <label htmlFor="eq-files">Drawings / BOQ (PDF, DWG, ZIP, images)</label>
        <input
          id="eq-files"
          type="file"
          multiple
          accept={ACCEPT}
          onChange={(e) => {
            setFiles(Array.from(e.target.files || []));
            setErrors((prev) => (prev.files ? { ...prev, files: undefined } : prev));
          }}
          aria-describedby={errors.files ? 'eq-files-error' : undefined}
        />
        {files.length > 0 && (
          <div className="chips" style={{ marginTop: 'var(--s3)' }} aria-label="Selected files">
            {files.map((f) => (
              <span key={`${f.name}-${f.size}`} className="chip">
                {f.name} · {(f.size / 1024).toFixed(0)} KB
              </span>
            ))}
          </div>
        )}
        {fieldError('files', 'eq-files')}
      </div>
      <div>
        {/* What happens next, stated BEFORE the commitment — not after it.
           A visitor deciding whether to send a hospital-door tender to a
           stranger needs this answer before the button, not on the
           thank-you card. */}
        <ol className="form-reassure">
          <li><b>We review</b><span>Sizes, options and drawings against the confirmed range.</span></li>
          <li><b>We confirm</b><span>A specification with nothing assumed or invented.</span></li>
          <li><b>We proceed</b><span>Next steps agreed directly with you.</span></li>
        </ol>
        <Magnetic>
          <button type="submit" className="btn btn-solid">
            Submit enquiry <ArrowRight className="arr arr-r" />
          </button>
        </Magnetic>
        <p className="meta" style={{ marginTop: 'var(--s4)', color: 'var(--muted-fg)' }}>
          At least one of phone or email is needed so we can reply.
        </p>
      </div>
    </form>
  );
}
