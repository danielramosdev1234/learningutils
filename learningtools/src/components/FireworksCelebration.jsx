// src/components/FireworksCelebration.jsx

import React, { useEffect, useRef } from 'react';
import aplausosSound from '../assets/respostacerta.mp3';

export const FireworksCelebration = ({ show }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const audioRef = useRef(null);

  const playRecordedSound = () => {
    try {
      // Para o áudio anterior se estiver tocando
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio(aplausosSound);
      audio.volume = 0.2;
      audioRef.current = audio;
      audio.play().catch(err => console.log('Audio play error:', err));
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };


  useEffect(() => {
    if (!show) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      particlesRef.current = [];

      if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }

      return;
    }

    playRecordedSound();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.gravity = 0.15;
        this.friction = 0.98;
        this.hue = hue;
        this.brightness = 60  + Math.random() * 40;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.015;
        this.size = Math.random() * 5 + 3;
      }

      update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = this.alpha * 0.5;
        ctx.fillStyle = `hsl(${this.hue}, 100%, ${this.brightness + 20}%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const createFirework = (x, y) => {
      const particleCount = 80;
      const hue = Math.random() * 360;

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(new Particle(x, y, hue));
      }
    };

    let fireworkInterval = setInterval(() => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * (canvas.height * 0.6);
      createFirework(x, y);
    }, 400);

    // Fogos iniciais com sons variados
    setTimeout(() => createFirework(canvas.width * 0.3, canvas.height * 0.3), 0);
    setTimeout(() => createFirework(canvas.width * 0.7, canvas.height * 0.2), 150);
    setTimeout(() => createFirework(canvas.width * 0.5, canvas.height * 0.15), 300);
    setTimeout(() => createFirework(canvas.width * 0.2, canvas.height * 0.4), 450);
    setTimeout(() => createFirework(canvas.width * 0.8, canvas.height * 0.35), 600);

    const animate = () => {
      // ✨ MUDANÇA PRINCIPAL: Limpa o canvas com transparência total
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(particle => {
        particle.update();
        particle.draw(ctx);
        return particle.alpha > 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      clearInterval(fireworkInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [show]);

  if (!show) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ background: 'transparent' }}
    />
  );
};