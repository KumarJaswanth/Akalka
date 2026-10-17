/* A small pill that says where you are: an optional lime number badge and a
   label. Styled in pages.css (.eyebrow), shared by the Products and About pages. */
export default function Eyebrow({ n, children }) {
  return (
    <p className="eyebrow">
      {n && <b>{n}</b>}
      <span>{children}</span>
    </p>
  );
}
