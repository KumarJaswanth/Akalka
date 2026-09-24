import React from 'react';

/* Safety net: a component crash must never produce a blank page again. */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', background: '#2B3036', color: '#FFFFFF', padding: 32, textAlign: 'center' }}>
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', color: '#7DB200', marginBottom: 16 }}>AKALKA / INTERRUPTED</p>
          <p style={{ fontFamily: "'Nunito', 'DM Sans', sans-serif", fontWeight: 800, fontSize: 'clamp(1.7rem,4vw,2.8rem)', lineHeight: 1.15, marginBottom: 12 }}>Something failed to render.</p>
          <p style={{ opacity: 0.65, marginBottom: 28 }}>Reload the page to recover the experience.</p>
          <button onClick={() => window.location.reload()} style={{ border: '1px solid #FFFFFF', background: 'none', color: '#FFFFFF', padding: '14px 28px', fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.16em', cursor: 'pointer' }}>
            RELOAD
          </button>
        </div>
      </div>
    );
  }
}
