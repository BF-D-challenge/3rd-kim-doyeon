import type { LucideIcon } from "lucide-react";
import {
  Cake,
  Gift,
  Heart,
  Sparkles,
  Home,
  Flower2,
  UtensilsCrossed,
  Beer,
  Wine,
  Martini,
  Music2,
  Zap,
} from "lucide-react";

export type ThemeKey = "birthday" | "housewarming" | "drinks" | "hangout";

export type Theme = {
  key: ThemeKey;
  label: string;
  // OG 텍스트·카톡 공유 문구에만 사용 (UI에서는 아이콘 사용)
  emoji: string;
  // 대표 아이콘 (lucide)
  Icon: LucideIcon;
  // Tailwind gradient (배경)
  gradient: string;
  // 강조색 (버튼·confetti 등) — hex
  accent: string;
  // confetti 팔레트
  confetti: string[];
  // OG 카드/편집 힌트용 한 줄 톤
  hint: string;
  // 히어로에 떠오르는 파티클 아이콘들
  particles: LucideIcon[];
};

export const themes: Record<ThemeKey, Theme> = {
  birthday: {
    key: "birthday",
    label: "생일",
    emoji: "🎂",
    Icon: Cake,
    gradient: "from-pink-500 via-rose-400 to-orange-300",
    accent: "#e11d48",
    confetti: ["#fda4af", "#fb7185", "#fdba74", "#ffffff"],
    hint: "생일인 척, 축하받고 싶어서",
    particles: [Cake, Gift, Heart, Sparkles],
  },
  housewarming: {
    key: "housewarming",
    label: "집들이",
    emoji: "🏠",
    Icon: Home,
    gradient: "from-amber-400 via-orange-400 to-yellow-300",
    accent: "#d97706",
    confetti: ["#fcd34d", "#fdba74", "#fef3c7", "#ffffff"],
    hint: "집 자랑 아니고요, 사람 그리워서요",
    particles: [Home, Flower2, UtensilsCrossed, Sparkles],
  },
  drinks: {
    key: "drinks",
    label: "술약속",
    emoji: "🍻",
    Icon: Beer,
    gradient: "from-indigo-600 via-purple-600 to-fuchsia-500",
    accent: "#7c3aed",
    confetti: ["#c4b5fd", "#e879f9", "#a5b4fc", "#ffffff"],
    hint: "불참은 자유. 근데 서운할 예정",
    particles: [Beer, Wine, Martini, Sparkles],
  },
  hangout: {
    key: "hangout",
    label: "놀러가기",
    emoji: "✨",
    Icon: Sparkles,
    gradient: "from-sky-400 via-cyan-400 to-emerald-300",
    accent: "#0891b2",
    confetti: ["#67e8f9", "#6ee7b7", "#bae6fd", "#ffffff"],
    hint: "계획 없음. 장소만 있음. 일단 와",
    particles: [Sparkles, Music2, Zap],
  },
};

export const themeList = Object.values(themes);

export function getTheme(key: string | null | undefined): Theme {
  if (key && key in themes) return themes[key as ThemeKey];
  return themes.birthday;
}
