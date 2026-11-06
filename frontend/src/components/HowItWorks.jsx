import React, { useEffect, useRef } from 'react';
import { MapPin, Database, BrainCircuit, Leaf, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: MapPin,
    title: 'Select Your District',
    desc: 'Pick your district on the glowing Pakistan map or use the search dropdown.',
    color: '#10b981',
  },
  {
    icon: Database,
    title: 'NASA Data Fetched',
    desc: 'Our system pulls real-time soil moisture and rainfall data from NASA satellites.',
    color: '#06b6d4',
  },
  {
    icon: BrainCircuit,
    title: 'AI Model Predicts',
    desc: 'A trained Random Forest model analyzes 6 key weather features and outputs a risk score.',
    color: '#8b5cf6',
  },
  {
    icon: Leaf,
    title: 'You Get Advice',
    desc: 'Your drought risk (LOW / MEDIUM / HIGH) appears with actionable farming advice.',
    color: '#10b981',
  },
];

const HowItWorks = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.step-card').forEach((card, i) => {
              setTimeout(() => {
                card.classList.add('revealed');
              }, i * 150);
            });
          }
        });
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '100px 24px',
        position: 'relative',
        zIndex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <p style={{ color: '#10b981', fontSize: '13px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Simple. Powerful. Accurate.
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '800', letterSpacing: '-1px', color: '#e2e8f0' }}>
          How <span className="gradient-text">CropSave</span> Works
        </h2>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        {steps.map((step, i) => (
          <React.Fragment key={step.title}>
            <div
              className="step-card reveal"
              style={{
                flex: '1 1 220px',
                maxWidth: '260px',
                padding: '32px 24px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                textAlign: 'center',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = `${step.color}40`;
                e.currentTarget.style.boxShadow = `0 0 30px ${step.color}20`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Step Number */}
              <div style={{
                fontSize: '11px', fontWeight: '700', color: step.color,
                letterSpacing: '2px', marginBottom: '16px', opacity: 0.7,
              }}>
                STEP {String(i + 1).padStart(2, '0')}
              </div>

              {/* Icon */}
              <div style={{
                width: '60px', height: '60px', borderRadius: '16px',
                background: `${step.color}18`,
                border: `1px solid ${step.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <step.icon size={26} color={step.color} />
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#e2e8f0', marginBottom: '10px' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(226,232,240,0.55)', lineHeight: '1.6' }}>
                {step.desc}
              </p>
            </div>

            {/* Connector arrow between steps (hidden on mobile) */}
            {i < steps.length - 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                paddingTop: '60px',
                opacity: 0.3,
                flexShrink: 0,
              }} className="step-arrow">
                <ArrowRight size={20} color="#10b981" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .step-arrow { display: none !important; }
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;
