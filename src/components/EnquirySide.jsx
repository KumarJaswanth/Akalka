import { CONTACT, telHref, waHref } from '../data/company.js';

/* What sits beside the enquiry form, on the contact page and on Home:
   the ways to reach AKALKA directly, and what happens after you send. Both
   used to live inside the form and made it long; beside it, the form stays
   short and the answers stay in view while you type. Only the details in
   data/company.js are shown — an empty one is simply left out. */

const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="3" {...line} />
    <path d="m4 7.5 8 6 8-6" {...line} />
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M6.6 4h2.3l1.3 3.6-1.7 1.4a11 11 0 0 0 5.5 5.5l1.4-1.7 3.6 1.3v2.3a2 2 0 0 1-2.2 2A15 15 0 0 1 4.6 6.2 2 2 0 0 1 6.6 4Z" {...line} />
  </svg>
);
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.9L3.6 20.4l4.1-1.1A8.5 8.5 0 1 0 12 3.5Z" {...line} />
    <path d="M9 8.8c.3 2.6 2.7 5 5.4 5.4l1.1-1.3-2-1-.9.8a4.6 4.6 0 0 1-2-2l.8-.9-1-2Z" {...line} />
  </svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0C5.5 15.4 12 21 12 21Z" {...line} />
    <circle cx="12" cy="10" r="2.4" {...line} />
  </svg>
);

const mapsHref = (place) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

export function EnquiryChannels() {
  const rows = [
    CONTACT.email && { k: 'Email', icon: <MailIcon />, text: CONTACT.email, href: `mailto:${CONTACT.email}` },
    CONTACT.phone && { k: 'Mobile', icon: <PhoneIcon />, text: CONTACT.phone, href: telHref(CONTACT.phone) },
    CONTACT.whatsapp && { k: 'WhatsApp', icon: <ChatIcon />, text: CONTACT.whatsapp, href: waHref(CONTACT.whatsapp), external: true },
    CONTACT.address && { k: 'Location', icon: <PinIcon />, text: CONTACT.address, href: mapsHref(CONTACT.address), external: true },
  ].filter(Boolean);
  if (!rows.length) return null;
  return (
    <div className="es-card bz">
      <div className="bz-in es-in">
        <p className="meta es-k">Reach us directly</p>
        <ul className="es-rows">
          {rows.map((r) => (
            <li key={r.k}>
              <a
                href={r.href}
                {...(r.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                aria-label={`${r.k}: ${r.text}`}
              >
                <span className="es-ico">{r.icon}</span>
                <span className="es-txt">
                  <span className="meta">{r.k}</span>
                  <b>{r.text}</b>
                </span>
              </a>
            </li>
          ))}
        </ul>
        {CONTACT.hours && <p className="meta es-hours">{CONTACT.hours}</p>}
      </div>
    </div>
  );
}

const STEPS = [
  ['01', 'We review', 'Sizes, options and drawings against the confirmed range.'],
  ['02', 'We confirm', 'A specification with nothing assumed or invented.'],
  ['03', 'We proceed', 'Next steps agreed directly with you.'],
];

export function EnquirySteps() {
  return (
    <div className="es-card bz">
      <div className="bz-in es-in">
        <p className="meta es-k">What happens after you send</p>
        <ol className="es-steps">
          {STEPS.map(([n, t, d]) => (
            <li key={n}>
              <b className="es-n">{n}</b>
              <span>
                <b>{t}</b>
                <span>{d}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="body-sm es-note">
          <b>Include:</b> drawings, opening schedules or panel layouts, the range you need, thicknesses, finishes, and the site and quantities.
        </p>
      </div>
    </div>
  );
}
