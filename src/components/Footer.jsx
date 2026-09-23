import { Link } from 'react-router-dom';
import { Reveal, Materialize, Magnetic } from './Reveal.jsx';
import { ArrowRight, ArrowUpRight } from './icons.jsx';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div style={{ paddingTop: 56 }}>
          <Materialize>
            <h2 className="h2" style={{ maxWidth: '16ch' }}>
              Specify the system. We manufacture it.
            </h2>
          </Materialize>
          <Reveal>
            <div className="cta-row">
              <Magnetic>
                <Link to="/products" className="btn btn-light">Explore products <ArrowUpRight className="arr arr-up" /></Link>
              </Magnetic>
              <Magnetic>
                <Link to="/contact" className="btn btn-accent">
                  Start an enquiry <ArrowRight className="arr arr-r" />
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>

        <div className="foot-grid">
          <div>
            <Logo height={62} big />
            <p style={{ marginTop: 20, fontWeight: 300, fontSize: '0.9rem', color: 'var(--on-dark-muted)', maxWidth: '34ch' }}>
              A product-focused manufacturer of doors, wall systems and the profiles that join them.
            </p>
          </div>
          <div>
            <h4>Products</h4>
            <ul>
              <li><Link to="/products#doors">Doors</Link></li>
              <li><Link to="/products#sandwich">Sandwich Panels</Link></li>
              <li><Link to="/products#cleanroom">Cleanroom Panels</Link></li>
              <li><Link to="/products#partition">Partition Panels</Link></li>
              <li><Link to="/products#profiles">Profiles &amp; Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/products">Full catalogue</Link></li>
            </ul>
          </div>
          <div>
            <h4>Enquiries</h4>
            <ul>
              <li>Contact details: to be confirmed</li>
              <li>Location: to be confirmed</li>
              <li><Link to="/contact">Request specifications</Link></li>
            </ul>
          </div>
        </div>

        <div className="foot-crafted" aria-hidden="true">Crafted <em>with care.</em></div>

        <div className="foot-giant" aria-hidden="true">akalka</div>

        <div className="foot-base">
          <span>© {new Date().getFullYear()} AKALKA Doors &amp; Panels</span>
          <span>Manufacturing identity v1.2</span>
          <span>Specifications on request</span>
          <span>Photography: Unsplash</span>
        </div>
      </div>
    </footer>
  );
}
