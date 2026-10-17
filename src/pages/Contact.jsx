import { useSearchParams } from 'react-router-dom';
import { Reveal, Materialize, SectionHead } from '../components/Reveal.jsx';
import { Plus } from '../components/icons.jsx';
import { Process, PROCESS_STEPS } from '../components/Blocks.jsx';
import { word } from '../data/products.js';
import { CONTACT, hasChannels, telHref, ZOHO_FORM_URL } from '../data/company.js';
import EnquiryForm from '../components/EnquiryForm.jsx';
import Term from '../components/Term.jsx';
import Landscape from '../components/Landscape.jsx';
import { FAQ } from '../data/faq.js';

/* Zoho's own "Access Form" integration: the hosted form opened in a centred
   popup window, sized as Zoho's snippet specifies. It sits beside the branded
   form as an alternative route to the same inbox. The anchor keeps its real
   href and target, so with JavaScript off — or on a browser that blocks the
   popup — it still opens the form instead of doing nothing. */
const ZOHO_POPUP = { width: 700, height: 648 };

function openZohoForm(event) {
  const { width, height } = ZOHO_POPUP;
  /* Centre on the window the visitor is using, not the primary screen —
     on a second monitor screen.width would throw the popup elsewhere. */
  const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
  const top = Math.round(window.screenY + (window.outerHeight - height) / 2);
  const popup = window.open(
    ZOHO_FORM_URL,
    'akalka-zoho-form',
    `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,status=1,scrollbars=1,resizable=1`,
  );
  /* Only cancel the link once the popup has actually opened; if it was
     blocked, the anchor's own target="_blank" takes over. */
  if (popup) event.preventDefault();
}

export default function Contact() {
  const [params] = useSearchParams();
  const requested = params.get('interest');
  const asked = params.get('ask');
  const meta = params.get('meta') || '';

  return (
    <div className="page">
      <section className="page-hero">
        <div className="wrap">
          <h1 className="display">
            <span className="mask"><span>Send the sizes.</span></span>
            <span className="mask"><span style={{ animationDelay: '0.12s' }}><span className="font-hand" style={{ color: 'var(--datum)' }}>We confirm the rest.</span></span></span>
          </h1>
          <p className="lede" style={{ color: 'var(--on-dark-muted)', marginTop: 'var(--s6)' }}>
            Doors, panels and profiles are manufactured to order. Share drawings,
            dimensions or a bill of quantities and receive a confirmed specification.
          </p>
        </div>
      </section>

      <section className="section has-ls">
        <Landscape seed={11} />
        <div className="wrap contact-grid">
          <div>
            <SectionHead index="Form" label="Enquiry form" />
            <EnquiryForm defaultInterest={requested} defaultAsk={asked} defaultMeta={meta} />
            <Reveal delay={0.06}>
              <div className="form-alt">
                <span className="meta">Prefer more room?</span>
                <a
                  href={ZOHO_FORM_URL}
                  onClick={openZohoForm}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Akalka Product Enquiry Form"
                  className="link-line"
                >
                  Open the enquiry form in its own window
                </a>
              </div>
            </Reveal>
          </div>
          <div>
            <SectionHead index={hasChannels ? 'Channels' : 'Send'} label={hasChannels ? 'Direct channels' : 'What to send'} />
            <Reveal>
              {/* Only details the client has supplied are shown (data/company.js). */}
              <div className="info-rows">
                {CONTACT.phone && <div className="info-row"><span className="meta">Phone</span><a href={telHref(CONTACT.phone)}>{CONTACT.phone}</a></div>}
                {CONTACT.email && <div className="info-row"><span className="meta">Email</span><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></div>}
                {CONTACT.address && <div className="info-row"><span className="meta">Works / office</span><span>{CONTACT.address}</span></div>}
                {CONTACT.hours && <div className="info-row"><span className="meta">Hours</span><span>{CONTACT.hours}</span></div>}
                <div className="info-row"><span className="meta">Include</span><span>Drawings, opening schedules, panel layouts, thicknesses, finishes. Anything specified beats anything described.</span></div>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="cta-band on-dark" style={{ marginTop: 'var(--s8)', padding: 'var(--s9) var(--s8)' }}>
                <h2 style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: '1.5rem' }}>Specify first, then enquire.</h2>
                <div className="chips" style={{ marginTop: 'var(--s4)' }}>
                  <span className="chip">Single / double</span>
                  <span className="chip">50 / 100 mm</span>
                  <span className="chip"><Term def="Coating option code in this catalogue — its exact specification is confirmed on enquiry">R-70 / R-90</Term></span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead index="Next" label="What happens next" hint={`${word(PROCESS_STEPS)} steps`} />
          <Materialize>
            <h2 className="h2" style={{ maxWidth: '18ch', marginBottom: 'var(--s12)' }}>From your message <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>to a made product.</span></h2>
          </Materialize>
          <Process />
        </div>
      </section>

      <section className="section">
        <div className="wrap faq-grid">
          <div>
            <SectionHead index="FAQ" label="Before you send" hint="Plain answers" />
            <Materialize>
              <h2 className="h2" style={{ maxWidth: '12ch' }}>Questions, <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>answered straight.</span></h2>
            </Materialize>
          </div>
          <div className="faq">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delay={Math.min(i * 0.05, 0.2)}>
                <details className="faq-item">
                  <summary>
                    <span className="meta">{String(i + 1).padStart(2, '0')}</span>
                    <span className="faq-q">{f.q}</span>
                    <span className="plus" aria-hidden="true"><Plus /></span>
                  </summary>
                  <p className="body-sm">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
