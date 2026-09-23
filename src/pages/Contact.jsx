import { useSearchParams } from 'react-router-dom';
import { Reveal, SectionHead } from '../components/Reveal.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';

export default function Contact() {
  const [params] = useSearchParams();
  const requested = params.get('interest');

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
            <EnquiryForm defaultInterest={requested} />
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
