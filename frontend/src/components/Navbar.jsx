import React, { useState, useEffect } from 'react';
import { Leaf, Zap, Menu, X } from 'lucide-react';

const Navbar = ({ onGetForecast }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '14px 24px',
        transition: 'all 0.4s ease',
        background: scrolled
          ? 'rgba(3, 10, 6, 0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(16, 185, 129, 0.1)'
          : '1px solid transparent',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #059669, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(16,185,129,0.4)',
          }}>
            <Leaf size={20} color="white" />
          </div>
          <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            <span className="gradient-text">Crop</span>
            <span style={{ color: '#e2e8f0' }}>Save</span>
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="nav-links-desktop">
          {['How It Works', 'About', 'NASA Data'].map((item) => (
            <span key={item} style={{
              color: 'rgba(226,232,240,0.7)', fontSize: '14px', fontWeight: '500',
              cursor: 'pointer', transition: 'color 0.3s',
            }}
              onMouseEnter={e => e.target.style.color = '#10b981'}
              onMouseLeave={e => e.target.style.color = 'rgba(226,232,240,0.7)'}
            >{item}</span>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="btn-emerald"
            onClick={onGetForecast}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', padding: '10px 20px' }}
          >
            <Zap size={15} />
            Get Forecast
          </button>
          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'transparent', border: 'none', color: '#10b981',
              cursor: 'pointer', display: 'none',
            }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'rgba(3,10,6,0.95)', backdropFilter: 'blur(20px)',
          padding: '16px 24px', borderBottom: '1px solid rgba(16,185,129,0.1)',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          {['How It Works', 'About', 'NASA Data'].map((item) => (
            <span key={item} style={{ color: 'rgba(226,232,240,0.8)', fontSize: '15px', cursor: 'pointer' }}>{item}</span>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
