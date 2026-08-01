"use client";

import { useRef } from "react";
import { CalendarDays, MapPin, X, CircleCheck } from "lucide-react";
import type { Theme } from "@/lib/themes";
import { getCover } from "@/lib/covers";
import { stickerIcons, isEmojiSticker, emojiOf, type Sticker } from "@/lib/stickers";
import type { EffectType } from "@/lib/effects";
import { EffectLayer } from "@/components/EffectLayer";
import { cn } from "@/lib/utils";

type Props = {
  theme: Theme;
  coverId?: string | null;
  title: string;
  description?: string | null;
  dateLabel: string;
  placeLabel: string;
  stickers: Sticker[];
  effect: EffectType;
  dateConfirmed?: boolean;
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
  dateConfirmed,
  editable,
  selectedUid,
  onSelect,
  onMove,
  onRemove,
  className,
}: Props) {
  const canvasRef = useRef<HTMLElement>(null);
  const isImageCover = Boolean(coverId && coverId.startsWith("http"));
  const cover = isImageCover ? null : getCover(coverId);

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
        // 커버가 화면 상단을 크게 차지 + 제목은 하단 좌측 (폼이 커버를 덮지 않음)
        "relative flex min-h-[56vh] flex-col justify-end overflow-hidden px-6 pb-8 pt-16 text-left text-white",
        !isImageCover && "bg-gradient-to-br",
        !isImageCover && (cover ? cover.tw : theme.gradient),
        editable && "select-none touch-none",
        className
      )}
      style={
        isImageCover
          ? { backgroundImage: `url(${coverId})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      {/* 이미지 커버일 때 가독성용 딤 */}
      {isImageCover && <div className="absolute inset-0 bg-black/35" aria-hidden="true" />}
      {/* 하단 스크림 — 커버 위 제목 가독성 확보 */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-2/3 bg-gradient-to-t from-black/45 via-black/10 to-transparent"
        aria-hidden="true"
      />
      <EffectLayer
        type={effect}
        icons={theme.particles}
        emojis={stickers.filter((s) => isEmojiSticker(s.icon)).map((s) => emojiOf(s.icon))}
      />

      {/* 스티커 레이어 */}
      <div className={cn("absolute inset-0", editable ? "z-20" : "z-[5] pointer-events-none")}>
        {stickers.map((s) => {
          const emoji = isEmojiSticker(s.icon);
          const Icon = emoji ? null : stickerIcons[s.icon];
          if (!emoji && !Icon) return null;
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
              {emoji ? (
                <span className="block leading-none" style={{ fontSize: s.size }}>
                  {emojiOf(s.icon)}
                </span>
              ) : (
                Icon && <Icon size={s.size} strokeWidth={1.75} />
              )}
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

      {/* 본문 — 커버 하단 좌측 */}
      <div className={cn("relative", editable ? "pointer-events-none z-10" : "z-10")}>
        <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-md">
          {title || "제목을 입력해줘요"}
        </h1>
        {description && <p className="mt-2 text-lg text-white/90 drop-shadow">{description}</p>}
        <div className="mt-4 inline-flex flex-col gap-1.5 rounded-2xl bg-black/25 px-4 py-3 text-sm backdrop-blur">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 opacity-80" /> {dateLabel}
            {dateConfirmed && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-black">
                <CircleCheck className="h-3 w-3" /> 확정
              </span>
            )}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 opacity-80" /> {placeLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
