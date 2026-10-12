import { Link } from 'react-router-dom';
import { Magnetic } from '../components/Reveal.jsx';
import { ArrowRight, ArrowUpRight } from '../components/icons.jsx';

/* Any address the router does not know. A real "not found" page instead of
   quietly showing Home under a wrong URL, with the two ways forward. */
export default function NotFound() {
  return (
    <div className="page">
      <section className="page-hero">
        <div className="wrap">
          <p className="meta" style={{ color: 'var(--datum)', marginBottom: 'var(--s5)' }}>404</p>
          <h1 className="display">
            <span className="mask"><span>This page</span></span>
            <span className="mask"><span style={{ animationDelay: '0.12s' }}><span className="font-hand" style={{ color: 'var(--datum)' }}>isn’t here.</span></span></span>
          </h1>
          <p className="lede" style={{ color: 'var(--on-dark-muted)', marginTop: 'var(--s6)' }}>
            The link may be old or mistyped. The catalogue and the enquiry form are one click away.
          </p>
          <div className="cta-row" style={{ marginTop: 'var(--s8)' }}>
            <Magnetic><Link to="/products" className="btn btn-light">Open the catalogue <ArrowRight className="arr arr-r" /></Link></Magnetic>
            <Magnetic><Link to="/" className="btn btn-accent">Back to Home <ArrowUpRight className="arr arr-up" /></Link></Magnetic>
          </div>
        </div>
      </section>
    </div>
  );
}
