"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

type Particle = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
};

export function ThemeEffect({ icons }: { icons: LucideIcon[] }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // 클라이언트에서만 생성 (하이드레이션 미스매치 방지)
    const count = 8;
    setParticles(
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: 6 + Math.random() * 88,
        delay: Math.random() * 7,
        duration: 7 + Math.random() * 5,
        size: 16 + Math.random() * 14,
        opacity: 0.12 + Math.random() * 0.14,
      }))
    );
  }, [icons]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => {
        const Icon = icons[p.id % icons.length];
        return (
          <span
            key={p.id}
            className="absolute bottom-0 text-white"
            style={{
              left: `${p.left}%`,
              opacity: p.opacity,
              animation: `modi-rise ${p.duration}s linear ${p.delay}s infinite`,
            }}
          >
            <Icon size={p.size} strokeWidth={1.5} />
          </span>
        );
      })}
    </div>
  );
}
