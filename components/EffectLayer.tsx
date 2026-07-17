"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EffectType } from "@/lib/effects";

type FloatItem = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
};

type TwinkleItem = {
  id: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
  size: number;
  dot: boolean;
};

function makeFloatItems(count: number): FloatItem[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: 6 + Math.random() * 88,
    delay: Math.random() * 7,
    duration: 7 + Math.random() * 5,
    size: 16 + Math.random() * 14,
    opacity: 0.12 + Math.random() * 0.14,
  }));
}

export function EffectLayer({
  type,
  icons,
  emojis,
}: {
  type: EffectType;
  icons: LucideIcon[];
  emojis: string[];
}) {
  const [floats, setFloats] = useState<FloatItem[]>([]);
  const [twinkles, setTwinkles] = useState<TwinkleItem[]>([]);

  useEffect(() => {
    // 클라이언트에서만 랜덤 생성 (하이드레이션 미스매치 방지)
    if (type === "float" || type === "emoji") {
      setFloats(makeFloatItems(type === "emoji" ? 10 : 8));
    } else if (type === "glitter") {
      setTwinkles(
        Array.from({ length: 26 }).map((_, i) => ({
          id: i,
          left: 2 + Math.random() * 96,
          top: 2 + Math.random() * 92,
          delay: Math.random() * 4,
          duration: 1.6 + Math.random() * 2.4,
          size: 6 + Math.random() * 10,
          dot: Math.random() < 0.45,
        }))
      );
    }
  }, [type, emojis.length]);

  if (type === "none") return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {(type === "float" || type === "emoji") &&
        floats.map((p) => {
          if (type === "emoji") {
            const pool = emojis.length > 0 ? emojis : ["🎉", "✨"];
            const em = pool[p.id % pool.length];
            return (
              <span
                key={p.id}
                className="absolute bottom-0 leading-none"
                style={{
                  left: `${p.left}%`,
                  fontSize: p.size + 4,
                  opacity: Math.min(0.85, p.opacity + 0.45),
                  animation: `modi-rise ${p.duration}s linear ${p.delay}s infinite`,
                }}
              >
                {em}
              </span>
            );
          }
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

      {type === "glitter" &&
        twinkles.map((t) => (
          <span
            key={t.id}
            className="absolute text-white"
            style={{
              left: `${t.left}%`,
              top: `${t.top}%`,
              opacity: 0,
              animation: `modi-twinkle ${t.duration}s ease-in-out ${t.delay}s infinite`,
            }}
          >
            {t.dot ? (
              <span
                className="block rounded-full bg-white"
                style={{ width: t.size * 0.45, height: t.size * 0.45 }}
              />
            ) : (
              <Sparkles size={t.size} strokeWidth={1.5} />
            )}
          </span>
        ))}

      {type === "wave" && (
        <>
          <svg
            className="absolute bottom-[-8px] left-0 h-24 w-[200%]"
            style={{ animation: "modi-wave-x 9s linear infinite" }}
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C100,20 200,20 300,60 C400,100 500,100 600,60 C700,20 800,20 900,60 C1000,100 1100,100 1200,60 L1200,100 L0,100 Z"
              fill="rgba(255,255,255,0.16)"
            />
          </svg>
          <svg
            className="absolute bottom-[-8px] left-0 h-16 w-[200%]"
            style={{ animation: "modi-wave-x 6s linear infinite" }}
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C100,20 200,20 300,60 C400,100 500,100 600,60 C700,20 800,20 900,60 C1000,100 1100,100 1200,60 L1200,100 L0,100 Z"
              fill="rgba(255,255,255,0.22)"
            />
          </svg>
        </>
      )}

      {type === "pulse" && (
        <>
          {[0, 1.3, 2.6].map((delay) => (
            <span
              key={delay}
              className="absolute left-1/2 top-1/2 h-72 w-72 rounded-full border-2 border-white/50"
              style={{ animation: `modi-pulse-ring 4s ease-out ${delay}s infinite` }}
            />
          ))}
        </>
      )}
    </div>
  );
}
