/* A domain term with its meaning attached.
   The catalogue speaks in codes (PUF, R-70, GMP) that a first-time
   specifier cannot decode, and decoding them in prose would bloat every
   sentence. Term carries a dictionary definition — what the WORD means,
   never what AKALKA's product achieves — visible on hover and keyboard
   focus, and announced inline to screen readers. Anything that needs a
   product-specific value (not vocabulary) stays a NeedsChip instead. */
export default function Term({ children, def }) {
  const label = typeof children === 'string' ? children : 'term';
  return (
    <span className="term" tabIndex={0} data-def={def} aria-label={`${label}: ${def}`}>
      {children}
    </span>
  );
}
