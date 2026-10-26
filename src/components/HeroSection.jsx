import React, { useEffect, useRef, useState } from 'react';
import { Users, Calendar, Satellite, ArrowRight, ChevronDown } from 'lucide-react';

const StatCard = ({ icon: Icon, value, label, delay }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className="glass"
      style={{
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        minWidth: '160px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
        animation: visible ? 'float 3s ease-in-out infinite' : 'none',
        animationDelay: `${delay * 0.5}ms`,
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(16,185,129,0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: 'rgba(16,185,129,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(16,185,129,0.3)',
      }}>
        <Icon size={20} color="#10b981" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '22px', fontWeight: '800', color: '#10b981' }} className="text-glow-emerald">
          {value}
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(226,232,240,0.6)', marginTop: '2px', fontWeight: '500' }}>
          {label}
        </div>
      </div>
    </div>
  );
};

const HeroSection = ({ onGetForecast }) => {
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTitleVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 60px',
        position: 'relative',
        textAlign: 'center',
        zIndex: 1,
      }}
    >
      {/* Badge */}
      <div
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '50px', padding: '6px 16px', marginBottom: '32px',
          opacity: titleVisible ? 1 : 0,
          transition: 'all 0.6s ease 0ms',
        }}
      >
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#10b981',
          boxShadow: '0 0 8px #10b981',
          animation: 'pulse 2s ease infinite',
        }} />
        <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '600', letterSpacing: '0.5px' }}>
          NASA Space Apps Challenge 2026
        </span>
      </div>

      {/* Main Headline */}
      <h1
        style={{
          fontSize: 'clamp(40px, 7vw, 80px)',
          fontWeight: '900',
          lineHeight: '1.05',
          letterSpacing: '-2px',
          marginBottom: '24px',
          maxWidth: '900px',
          opacity: titleVisible ? 1 : 0,
          transform: titleVisible ? 'translateY(0)' : 'translateY(50px)',
          transition: 'all 0.8s cubic-bezier(0.34, 1.2, 0.64, 1) 100ms',
        }}
      >
        <span style={{ color: '#e2e8f0' }}>Know Before the </span>
        <span className="gradient-text text-glow-emerald">Drought</span>
        <br />
        <span style={{ color: '#e2e8f0' }}>Hits</span>
      </h1>

      {/* Subheading */}
      <p
        style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: 'rgba(226,232,240,0.65)',
          maxWidth: '600px',
          lineHeight: '1.7',
          marginBottom: '48px',
          fontWeight: '400',
          opacity: titleVisible ? 1 : 0,
          transform: titleVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease 300ms',
        }}
      >
        AI-powered drought prediction for Pakistan's 60 million farmers.
        Powered by <span style={{ color: '#10b981', fontWeight: '600' }}>NASA satellite data</span> — simple enough for any phone.
      </p>

      {/* CTA Buttons */}
      <div
        style={{
          display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center',
          marginBottom: '80px',
          opacity: titleVisible ? 1 : 0,
          transform: titleVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease 500ms',
        }}
      >
        <button
          className="btn-emerald"
          onClick={onGetForecast}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', padding: '14px 32px', borderRadius: '14px' }}
        >
          Check Drought Risk
          <ArrowRight size={18} />
        </button>
        <button
          className="btn-outline"
          style={{ fontSize: '16px', padding: '14px 32px', borderRadius: '14px' }}
        >
          How It Works
        </button>
      </div>

      {/* Floating Stat Cards */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          opacity: titleVisible ? 1 : 0,
          transition: 'opacity 0.8s ease 700ms',
        }}
      >
        <StatCard icon={Users} value="60M+" label="Pakistani Farmers" delay={800} />
        <StatCard icon={Calendar} value="30-Day" label="Forecast Window" delay={1000} />
        <StatCard icon={Satellite} value="NASA" label="Satellite Data" delay={1200} />
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          opacity: 0.4,
          animation: 'float 2.5s ease-in-out infinite',
        }}
      >
        <span style={{ fontSize: '11px', color: '#10b981', letterSpacing: '2px', textTransform: 'uppercase' }}>Scroll</span>
        <ChevronDown size={16} color="#10b981" />
      </div>
    </section>
  );
};

export default HeroSection;
