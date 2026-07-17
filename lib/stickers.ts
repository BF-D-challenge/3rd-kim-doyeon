import type { LucideIcon } from "lucide-react";
import {
  Heart,
  Star,
  Sparkles,
  PartyPopper,
  Cake,
  Gift,
  Music2,
  Sun,
  Moon,
  Crown,
  Flame,
  Flower2,
  Camera,
  Pizza,
  Beer,
  Wine,
} from "lucide-react";

// 스티커 팔레트 — id는 DB에 문자열로 저장됨
export const stickerIcons: Record<string, LucideIcon> = {
  heart: Heart,
  star: Star,
  sparkles: Sparkles,
  party: PartyPopper,
  cake: Cake,
  gift: Gift,
  music: Music2,
  sun: Sun,
  moon: Moon,
  crown: Crown,
  flame: Flame,
  flower: Flower2,
  camera: Camera,
  pizza: Pizza,
  beer: Beer,
  wine: Wine,
};

export const stickerIds = Object.keys(stickerIcons);

// 이모지 스티커 팔레트 (아이콘과 별개로 원하는 사람만)
export const emojiStickers = [
  "🎂", "🎉", "🥳", "🍻", "🥂", "🍕", "🏠", "✨",
  "❤️", "🔥", "😂", "💃", "🎁", "🌸", "🎈", "⭐",
];

// icon 필드가 "emoji:🎂" 형태면 이모지 스티커
export function isEmojiSticker(icon: string) {
  return icon.startsWith("emoji:");
}
export function emojiOf(icon: string) {
  return icon.slice("emoji:".length);
}

// 초대장 위에 배치된 스티커 1개
export type Sticker = {
  uid: string; // 배치 인스턴스 id
  icon: string; // stickerIcons 키
  x: number; // % (0~100)
  y: number; // % (0~100)
  size: number; // px
  rot: number; // deg
};
