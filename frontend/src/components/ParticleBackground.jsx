import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = Math.random() * 0.6 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.6
          ? `rgba(16, 185, 129, ${this.opacity})`
          : Math.random() > 0.5
            ? `rgba(52, 211, 153, ${this.opacity})`
            : `rgba(110, 231, 183, ${this.opacity * 0.5})`;
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.opacity -= 0.0008;
        if (this.y < -10 || this.opacity <= 0) this.reset();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#10b981';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Init particles
    for (let i = 0; i < 120; i++) {
      const p = new Particle();
      p.y = Math.random() * canvas.height; // distribute initially
      particles.push(p);
    }

    // Aurora blobs
    let auroraTime = 0;
    const drawAurora = () => {
      auroraTime += 0.003;

      // blob 1 — top left
      const grad1 = ctx.createRadialGradient(
        canvas.width * 0.2 + Math.sin(auroraTime) * 60,
        canvas.height * 0.25 + Math.cos(auroraTime * 0.7) * 40,
        0,
        canvas.width * 0.2,
        canvas.height * 0.25,
        canvas.width * 0.4
      );
      grad1.addColorStop(0, 'rgba(16, 185, 129, 0.09)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // blob 2 — bottom right
      const grad2 = ctx.createRadialGradient(
        canvas.width * 0.8 + Math.cos(auroraTime * 0.8) * 50,
        canvas.height * 0.7 + Math.sin(auroraTime) * 30,
        0,
        canvas.width * 0.8,
        canvas.height * 0.7,
        canvas.width * 0.35
      );
      grad2.addColorStop(0, 'rgba(5, 150, 105, 0.07)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // blob 3 — center subtle
      const grad3 = ctx.createRadialGradient(
        canvas.width * 0.5 + Math.sin(auroraTime * 0.5) * 80,
        canvas.height * 0.5,
        0,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.3
      );
      grad3.addColorStop(0, 'rgba(52, 211, 153, 0.04)');
      grad3.addColorStop(1, 'transparent');
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark background
      ctx.fillStyle = '#030a06';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Aurora layer
      drawAurora();

      // Grid lines (subtle)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Particles
      particles.forEach(p => { p.update(); p.draw(); });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ParticleBackground;
