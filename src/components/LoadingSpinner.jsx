import React from 'react';
import { Satellite } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(3,10,6,0.85)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Outer ring */}
      <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '32px' }}>
        {/* Spinning ring */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '3px solid rgba(16,185,129,0.15)',
          borderTopColor: '#10b981',
          animation: 'spin-slow 1.2s linear infinite',
        }} />
        {/* Second ring */}
        <div style={{
          position: 'absolute', inset: '12px',
          borderRadius: '50%',
          border: '2px solid rgba(16,185,129,0.08)',
          borderBottomColor: '#34d399',
          animation: 'spin-slow 1.8s linear infinite reverse',
        }} />
        {/* Center icon */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16,185,129,0.3)',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}>
            <Satellite size={26} color="#10b981" />
          </div>
        </div>
      </div>

      {/* Text */}
      <p style={{
        color: '#10b981',
        fontSize: '15px',
        fontWeight: '600',
        letterSpacing: '0.5px',
        animation: 'pulse 1.8s ease-in-out infinite',
      }}>
        Fetching NASA satellite data...
      </p>
      <p style={{ color: 'rgba(226,232,240,0.35)', fontSize: '13px', marginTop: '8px' }}>
        Analyzing soil moisture · rainfall · temperature
      </p>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#10b981',
              animation: `pulse ${0.6 + i * 0.2}s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
