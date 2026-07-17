"use client";

import { useRef } from "react";
import { CalendarDays, MapPin, X } from "lucide-react";
import type { Theme } from "@/lib/themes";
import { getCover } from "@/lib/covers";
import { stickerIcons, type Sticker } from "@/lib/stickers";
import { ThemeEffect } from "@/components/ThemeEffect";
import { cn } from "@/lib/utils";

type Props = {
  theme: Theme;
  coverId?: string | null;
  title: string;
  description?: string | null;
  dateLabel: string;
  placeLabel: string;
  stickers: Sticker[];
  effect: boolean;
  // 에디터 모드
  editable?: boolean;
  selectedUid?: string | null;
  onSelect?: (uid: string | null) => void;
  onMove?: (uid: string, x: number, y: number) => void;
  onRemove?: (uid: string) => void;
  className?: string;
};

export function InviteHero({
  theme,
  coverId,
  title,
  description,
  dateLabel,
  placeLabel,
  stickers,
  effect,
  editable,
  selectedUid,
  onSelect,
  onMove,
  onRemove,
  className,
}: Props) {
  const canvasRef = useRef<HTMLElement>(null);
  const cover = getCover(coverId);
  const HeroIcon = theme.Icon;

  function startDrag(e: React.PointerEvent, uid: string) {
    if (!editable || !canvasRef.current) return;
    e.preventDefault();
    onSelect?.(uid);
    const rect = canvasRef.current.getBoundingClientRect();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    function move(ev: PointerEvent) {
      const x = ((ev.clientX - rect.left) / rect.width) * 100;
      const y = ((ev.clientY - rect.top) / rect.height) * 100;
      onMove?.(uid, Math.min(96, Math.max(4, x)), Math.min(96, Math.max(4, y)));
    }
    function up() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <section
      ref={canvasRef}
      onPointerDown={editable ? () => onSelect?.(null) : undefined}
      className={cn(
        "relative overflow-hidden bg-gradient-to-br px-6 pb-14 pt-14 text-center text-white",
        cover ? cover.tw : theme.gradient,
        editable && "select-none touch-none",
        className
      )}
    >
      {effect && <ThemeEffect icons={theme.particles} />}

      {/* 스티커 레이어 */}
      <div className={cn("absolute inset-0", editable ? "z-20" : "z-[5] pointer-events-none")}>
        {stickers.map((s) => {
          const Icon = stickerIcons[s.icon];
          if (!Icon) return null;
          const selected = editable && selectedUid === s.uid;
          return (
            <span
              key={s.uid}
              onPointerDown={(e) => {
                e.stopPropagation();
                startDrag(e, s.uid);
              }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 text-white drop-shadow",
                editable && "cursor-grab active:cursor-grabbing",
                selected && "rounded-lg ring-2 ring-white/80"
              )}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                transform: `translate(-50%,-50%) rotate(${s.rot}deg)`,
              }}
            >
              <Icon size={s.size} strokeWidth={1.75} />
              {selected && (
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove?.(s.uid);
                  }}
                  className="absolute -right-2.5 -top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-neutral-900 shadow"
                  aria-label="스티커 삭제"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          );
        })}
      </div>

      {/* 본문 */}
      <div className={cn("relative", editable ? "pointer-events-none z-10" : "z-10")}>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <HeroIcon className="h-8 w-8" strokeWidth={1.75} />
        </div>
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight drop-shadow-sm">
          {title || "제목을 입력해줘요"}
        </h1>
        {description && <p className="mb-6 text-lg text-white/90">{description}</p>}
        <div className="inline-flex flex-col gap-1.5 rounded-2xl bg-black/20 px-5 py-3 text-sm backdrop-blur">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 opacity-80" /> {dateLabel}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 opacity-80" /> {placeLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
