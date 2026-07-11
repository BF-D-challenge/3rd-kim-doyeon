"use client";

import { useEffect, useState } from "react";

type Particle = {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
};

export function ThemeEffect({ emojis }: { emojis: string[] }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // 클라이언트에서만 생성 (하이드레이션 미스매치 방지)
    const count = 16;
    setParticles(
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        emoji: emojis[i % emojis.length],
        left: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 5 + Math.random() * 5,
        size: 14 + Math.random() * 20,
      }))
    );
  }, [emojis]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-0"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animation: `modi-rise ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
