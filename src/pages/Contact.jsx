import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Reveal, SectionHead, Magnetic } from '../components/Reveal.jsx';
import { ArrowRight } from '../components/icons.jsx';

const PRODUCT_OPTIONS = ['Doors', 'Sandwich Panels', 'Cleanroom Panels', 'Partition / Wall Panels', 'Profiles & Accessories', 'Multiple / full system'];

export default function Contact() {
  const [params] = useSearchParams();
  const requested = params.get('interest');
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    org: '',
    phone: '',
    interest: PRODUCT_OPTIONS.includes(requested) ? requested : 'Doors',
    msg: '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="page">
      <section className="page-hero">
        <div className="wrap">
          <h1 className="display">
            <span className="mask"><span>Send the sizes.</span></span>
            <span className="mask"><span style={{ animationDelay: '0.12s' }}>We confirm the rest.</span></span>
          </h1>
          <p className="lede" style={{ color: 'var(--on-dark-muted)', marginTop: 22 }}>
            Doors, panels and profiles are manufactured to order. Share drawings,
            dimensions or a bill of quantities and receive a confirmed specification.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap contact-grid">
          <div>
            <SectionHead index="Form" label="Enquiry form" hint="Response: TBC" />
            {sent ? (
              <Reveal>
                <div className="sent-card">
                  <p className="meta" style={{ color: 'var(--ink)', marginBottom: 12 }}>Enquiry noted</p>
                  <h2 className="h2" style={{ fontSize: '2rem' }}>Thank you, {form.name.split(' ')[0] || 'there'}. We will confirm shortly.</h2>
                  <p className="body-sm" style={{ marginTop: 12 }}>
                    Your enquiry about <b>{form.interest}</b> has been recorded in this demo.
                    Connect this form to your email or CRM to receive live enquiries.
                  </p>
                  <button className="btn" style={{ marginTop: 22 }} onClick={() => setSent(false)}>Send another enquiry</button>
                </div>
              </Reveal>
            ) : (
              <form className="form" onSubmit={(e) => { e.preventDefault(); setSent(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <div className="form-2col">
                  <div className="field">
                    <label htmlFor="cf-name">Full name *</label>
                    <input id="cf-name" required value={form.name} onChange={set('name')} placeholder="e.g. Project Engineer" autoComplete="name" />
                  </div>
                  <div className="field">
                    <label htmlFor="cf-org">Company / project</label>
                    <input id="cf-org" value={form.org} onChange={set('org')} placeholder="Company or site name" autoComplete="organization" />
                  </div>
                </div>
                <div className="form-2col">
                  <div className="field">
                    <label htmlFor="cf-phone">Phone / email *</label>
                    <input id="cf-phone" required value={form.phone} onChange={set('phone')} placeholder="How do we reach you?" autoComplete="tel" />
                  </div>
                  <div className="field">
                    <label htmlFor="cf-int">Product interest *</label>
                    <select id="cf-int" value={form.interest} onChange={set('interest')}>
                      {PRODUCT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="cf-msg">Requirement details *</label>
                  <textarea id="cf-msg" required value={form.msg} onChange={set('msg')}
                    placeholder="Quantities, sizes, thicknesses (50 / 100 mm), finishes, site location, timeline…" />
                </div>
                <div>
                  <Magnetic>
                    <button type="submit" className="btn btn-solid">Submit enquiry <ArrowRight className="arr arr-r" /></button>
                  </Magnetic>
                  <p className="meta" style={{ marginTop: 14, color: 'var(--muted-fg)' }}>Drawings can be attached after first contact (TBC).</p>
                </div>
              </form>
            )}
          </div>
          <div>
            <SectionHead index="Channels" label="Direct channels" hint="Details: TBC" />
            <Reveal>
              <div className="info-rows">
                <div className="info-row"><span className="meta">Phone</span><span>To be confirmed (placeholder only)</span></div>
                <div className="info-row"><span className="meta">Email</span><span>To be confirmed (placeholder only)</span></div>
                <div className="info-row"><span className="meta">Works / office</span><span>Location to be confirmed</span></div>
                <div className="info-row"><span className="meta">Hours</span><span>To be confirmed</span></div>
                <div className="info-row"><span className="meta">What to send</span><span>Drawings, opening schedules, panel layouts, thicknesses, finishes. Anything specified beats anything described.</span></div>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="cta-band on-dark" style={{ marginTop: 30, padding: '36px 30px' }}>
                <p style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: '1.5rem' }}>Specify first, then enquire.</p>
                <div className="chips" style={{ marginTop: 16 }}>
                  <span className="chip">DR-S / DR-D</span>
                  <span className="chip">50 / 100 mm</span>
                  <span className="chip">R-70 / R-90</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
