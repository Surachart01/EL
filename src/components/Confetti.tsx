'use client';

import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
}

const COLORS = [
  '#FF6B6B', '#4DABF7', '#51CF66', '#FCC419', '#FF922B', 
  '#FF8787', '#74C0FC', '#63E6BE', '#FFD43B', '#FFD8A8',
  '#F06595', '#B197FC', '#845EF7', '#F03E3E', '#1098AD'
];

export default function Confetti({ active, onComplete }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      particlesRef.current = [];
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const particles: Particle[] = [];
    const particleCount = 130;

    for (let i = 0; i < particleCount; i++) {
      // Spawn at bottom/center or explode from center of screen
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 100,
        y: canvas.height * 0.6 + (Math.random() - 0.5) * 50,
        size: Math.random() * 8 + 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speedX: (Math.random() - 0.5) * 15,
        speedY: -Math.random() * 15 - 8, // Shoot upwards
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.1 + 0.05,
        opacity: 1
      });
    }
    particlesRef.current = particles;

    // Animation loop
    const startTime = Date.now();
    const duration = 4000; // 4 seconds

    const render = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration || particlesRef.current.length === 0) {
        particlesRef.current = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (onComplete) onComplete();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        // Gravity & Air Resistance
        p.speedY += 0.35; // gravity
        p.speedX *= 0.98; // friction
        p.speedY *= 0.98; // friction

        // Move
        p.x += p.speedX;
        p.y += p.speedY;

        // Wobble & Spin
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        // Fade out in last 1.5 seconds
        if (elapsed > duration - 1500) {
          p.opacity = Math.max(0, 1 - (elapsed - (duration - 1500)) / 1500);
        }

        // Draw particle
        ctx.save();
        ctx.translate(p.x + Math.sin(p.wobble) * 5, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        // Draw rectangle
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      // Remove particles off-screen
      particlesRef.current = particlesRef.current.filter(p => p.y < canvas.height + 50 && p.opacity > 0);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
}
