import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Magnetic } from './Reveal.jsx';
import { ArrowRight } from './icons.jsx';

/* Shared enquiry form — our markup and styling, Zoho Forms as the inbox.

   The six fields, their order and their limits mirror the Zoho "Akalka
   Product Enquiry Form" exactly (read from the live form):

     SingleLine    Your name                                   max 255
     SingleLine1   Company or site name                        max 255
     PhoneNumber   Phone (country code off, so +91 is typed)   5–15 digits
     Dropdown      Select the product you are interested in
     MultiLine     Quantities, sizes, thicknesses…             max 65535
     FileUpload    Upload drawings or BOQ                      one file

   None of the six is mandatory in Zoho, and there is no email field.

   The form posts to our own /api/enquiry (api/enquiry.js), which relays it
   to Zoho server-side — a browser cannot call Zoho directly, because Zoho
   sends no CORS headers and the page could never read the answer. The
   relay replies { ok: true } only once Zoho has recorded the enquiry, so
   the thank-you card is shown on that and nothing else; any other outcome
   is an error and the visitor's input is kept. */

const ENDPOINT = import.meta.env.VITE_ENQUIRY_ENDPOINT || '/api/enquiry';
const SUBMIT_TIMEOUT_MS = 60000;

/* Zoho's dropdown options, verbatim and in Zoho's order. */
const PRODUCT_OPTIONS = ['Doors', 'Cleanroom Panels', 'Fire-Rated Doors', 'Emergency Exit Doors', 'Other'];

/* Zoho's field limits (ZFLive.constraintJson on the live form). The file
   limit is the relay's: Vercel refuses request bodies over 4.5 MB. */
const LIMITS = { name: 255, org: 255, phoneDigits: [5, 15], msg: 65535, fileMB: 4 };

/* Prefill only — the visitor can change it. Pages that deep-link into the
   form pass the site's own category names, which map onto Zoho's list. */
function toZohoProduct(interest, meta) {
  if (/fire/i.test(meta)) return 'Fire-Rated Doors';
  if (/emergency/i.test(meta)) return 'Emergency Exit Doors';
  if (PRODUCT_OPTIONS.includes(interest)) return interest;
  return interest ? 'Other' : '';
}

/* Resolves { ok, error }. ok is true only when the relay confirms Zoho
   recorded the enquiry. */
async function sendEnquiry(fields, file) {
  const data = new FormData();
  Object.entries(fields).forEach(([k, v]) => data.append(k, v));
  if (file) data.append('FileUpload', file);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), SUBMIT_TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, { method: 'POST', body: data, signal: ctrl.signal });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.ok === true) return { ok: true };
    return { ok: false, error: body.error };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}

function makeRef() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AK-${ymd}-${rand}`;
}

export default function EnquiryForm({ defaultInterest = '', defaultAsk = '', defaultMeta = '' }) {
  const reduce = useReducedMotion();
  const [sent, setSent] = useState(null);
  const [file, setFile] = useState(null);
  const busy = useRef(false);
  const [form, setForm] = useState({
    name: '',
    org: '',
    phone: '',
    interest: toZohoProduct(defaultInterest, defaultMeta),
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
    setErrors((prev) => (prev[k] || prev.form ? { ...prev, [k]: undefined, form: undefined } : prev));
  };
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy.current) return; /* a second click while the first is in flight */
    /* Native bubbles alone leave a keyboard user stranded at the button
       with no route to the problem. Validate inline, announce once, and
       move focus to the first field that needs attention. */
    const next = {};
    const phone = form.phone.trim();
    const digits = phone.replace(/\D/g, '').length;
    if (phone && (digits < LIMITS.phoneDigits[0] || digits > LIMITS.phoneDigits[1] || !/^[\d+\-.() ]+$/.test(phone)))
      next.phone = `Phone must have ${LIMITS.phoneDigits[0]}–${LIMITS.phoneDigits[1]} digits (+ - . ( ) and spaces allowed) — e.g. +91 98765 43210.`;
    if (file && file.size > LIMITS.fileMB * 1024 * 1024)
      next.files = `That file is ${(file.size / (1024 * 1024)).toFixed(1)} MB — the limit is ${LIMITS.fileMB} MB. Please zip or compress it.`;
    /* Zoho marks no field mandatory but refuses a wholly empty record. */
    if (!form.name.trim() && !form.org.trim() && !phone && !form.interest && !form.msg.trim() && !file)
      next.form = 'Please fill in at least one field before sending.';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = ['phone', 'files', 'form'].find((k) => next[k]);
      const id = { phone: 'eq-phone', files: 'eq-files', form: 'eq-name' }[first];
      document.getElementById(id)?.focus();
      return;
    }

    const ref = makeRef();
    /* Context Zoho has no field for travels inside the message, so the
       enquiry stays one self-contained record. */
    const extra = [
      `Reference: ${ref}`,
      defaultMeta ? `Configuration: ${defaultMeta}` : null,
      defaultInterest && form.interest === 'Other' && defaultInterest !== 'Other' ? `Page interest: ${defaultInterest}` : null,
    ].filter(Boolean);
    const message = [form.msg.trim(), '', ...extra].join('\n').trim();

    busy.current = true;
    setSending(true);
    const result = await sendEnquiry(
      {
        SingleLine: form.name.trim(),
        SingleLine1: form.org.trim(),
        PhoneNumber: phone,
        Dropdown: form.interest,
        MultiLine: message,
        website: e.currentTarget.elements.website.value,
      },
      file,
    );
    busy.current = false;
    setSending(false);
    if (result.ok) setSent({ ref, fileName: file?.name || '' });
    else
      setErrors({
        form: `${result.error || 'We could not send your enquiry.'} Nothing you typed has been lost — please try again.`,
      });
  };
  const fieldError = (k, id) =>
    errors[k] ? (
      <p className="field-error" id={`${id}-error`} role="alert">
        {errors[k]}
      </p>
    ) : null;

  if (sent) {
    const first = form.name.trim().split(' ')[0] || 'there';
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
          Enquiry {sent.ref} — sent
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
        <motion.p
          className="body-sm"
          style={{ marginTop: 'var(--s3)' }}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.64, duration: 0.5 }}
        >
          Quote this reference if you follow up with us.
        </motion.p>
        <motion.div
          className="thanks-recap"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.55 }}
        >
          {form.interest && (
            <div>
              <span className="meta">Interest</span>
              <b>{form.interest}</b>
            </div>
          )}
          {form.phone.trim() && (
            <div>
              <span className="meta">Reach you</span>
              <b>{form.phone.trim()}</b>
            </div>
          )}
          {form.org.trim() && (
            <div>
              <span className="meta">Project</span>
              <b>{form.org.trim()}</b>
            </div>
          )}
          {defaultMeta && (
            <div>
              <span className="meta">Configuration</span>
              <b>{defaultMeta}</b>
            </div>
          )}
          {sent.fileName && (
            <div>
              <span className="meta">Drawings</span>
              <b>{sent.fileName}</b>
            </div>
          )}
          {form.msg.trim() && (
            <div className="wide">
              <span className="meta">Requirement</span>
              <p className="body-sm" style={{ margin: 0 }}>{msgShort}</p>
            </div>
          )}
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
          <button className="btn btn-solid" onClick={() => { setSent(null); setFile(null); }}>Send another enquiry</button>
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
         would fire first and strand the visitor at the button with no
         route to the problem. */
      noValidate
    >
      {defaultMeta && (
        <div className="chips" style={{ marginBottom: 'var(--s5)' }} aria-label="Current configuration">
          <span className="chip chip-accent">{defaultMeta}</span>
        </div>
      )}
      {/* Honeypot: off-screen and skipped by keyboards and screen readers.
          Real visitors never fill it; bots do, and the relay drops them. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <div className="form-2col">
        <div className="field">
          <label htmlFor="eq-name">Your name</label>
          <input
            id="eq-name"
            name="SingleLine"
            maxLength={LIMITS.name}
            value={form.name}
            onChange={set('name')}
            autoComplete="name"
            aria-invalid={errors.form ? 'true' : undefined}
            aria-describedby={errors.form ? 'eq-form-error' : undefined}
          />
        </div>
        <div className="field">
          <label htmlFor="eq-org">Company or site name</label>
          <input
            id="eq-org"
            name="SingleLine1"
            maxLength={LIMITS.org}
            value={form.org}
            onChange={set('org')}
            autoComplete="organization"
          />
        </div>
      </div>
      <div className="form-2col">
        <div className="field">
          <label htmlFor="eq-phone">Phone</label>
          <input
            id="eq-phone"
            name="PhoneNumber"
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
          <label htmlFor="eq-int">Select the product you are interested in</label>
          <select id="eq-int" name="Dropdown" value={form.interest} onChange={set('interest')}>
            <option value="">-Select-</option>
            {PRODUCT_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="eq-msg">Quantities, sizes, thicknesses (50 / 100 mm), finishes, site location, timeline...</label>
        <textarea
          id="eq-msg"
          name="MultiLine"
          maxLength={LIMITS.msg}
          value={form.msg}
          onChange={set('msg')}
        />
      </div>
      <div className="field">
        <label htmlFor="eq-files">Upload drawings or BOQ (PDF, DWG, ZIP, Images)</label>
        <input
          id="eq-files"
          name="FileUpload"
          type="file"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setErrors((prev) => (prev.files || prev.form ? { ...prev, files: undefined, form: undefined } : prev));
          }}
          aria-invalid={errors.files ? 'true' : undefined}
          aria-describedby={errors.files ? 'eq-files-error' : undefined}
        />
        {file && (
          <div className="chips" style={{ marginTop: 'var(--s3)' }} aria-label="Selected file">
            <span className="chip">
              {file.name} · {(file.size / 1024).toFixed(0)} KB
            </span>
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
        {errors.form && (
          <p className="field-error form-error" id="eq-form-error" role="alert">
            {errors.form}
          </p>
        )}
        <Magnetic>
          <button type="submit" className="btn btn-solid" disabled={sending} aria-busy={sending || undefined}>
            {sending ? 'Sending…' : <>Submit enquiry <ArrowRight className="arr arr-r" /></>}
          </button>
        </Magnetic>
      </div>
    </form>
  );
}
