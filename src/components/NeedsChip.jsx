import { Link } from 'react-router-dom';

/* An unconfirmed specification.
   AKALKA's position is that it marks what it does not know rather than
   inventing it. A mark on its own reads as a gap; a mark that opens a
   pre-filled enquiry reads as rigour. So every "needs confirmation" chip
   on the site is this component, and each one carries the exact question
   to the form. */
export default function NeedsChip({ children, term, interest, style }) {
  const q = new URLSearchParams();
  if (interest) q.set('interest', interest);
  if (term) q.set('ask', term);
  const subject = term || String(children);

  return (
    <Link
      to={`/contact?${q.toString()}`}
      className="chip needs"
      style={style}
      aria-label={`Not yet confirmed. Ask AKALKA to confirm: ${subject}`}
    >
      {children}
    </Link>
  );
}
