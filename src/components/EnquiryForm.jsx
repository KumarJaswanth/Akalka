import { useState } from 'react';
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
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    org: '',
    phone: '',
    interest: PRODUCT_OPTIONS.includes(defaultInterest) ? defaultInterest : 'Doors',
    msg: '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (sent) {
    return (
      <div className="sent-card">
        <p className="meta" style={{ color: 'var(--ink)', marginBottom: 12 }}>Enquiry noted</p>
        <h2 className="h2" style={{ fontSize: '2rem' }}>
          Thank you, {form.name.split(' ')[0] || 'there'}. We will confirm shortly.
        </h2>
        <p className="body-sm" style={{ marginTop: 12 }}>
          Your enquiry about <b>{form.interest}</b> has been recorded in this demo.
          Connect this form to your email or CRM to receive live enquiries.
        </p>
        <button className="btn" style={{ marginTop: 22 }} onClick={() => setSent(false)}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
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
