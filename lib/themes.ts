export type ThemeKey = "birthday" | "housewarming" | "drinks" | "hangout";

export type Theme = {
  key: ThemeKey;
  label: string;
  emoji: string;
  // Tailwind gradient (배경)
  gradient: string;
  // 강조색 (버튼 등) — hex
  accent: string;
  // OG 카드/편집 힌트용 한 줄 톤
  hint: string;
  // 히어로에 둥둥 떠오르는 이펙트 이모지
  particles: string[];
};

export const themes: Record<ThemeKey, Theme> = {
  birthday: {
    key: "birthday",
    label: "생일",
    emoji: "🎂",
    gradient: "from-pink-500 via-rose-400 to-orange-300",
    accent: "#e11d48",
    hint: "생일인 척, 축하받고 싶어서",
    particles: ["🎈", "🎂", "✨", "🎉", "🩷"],
  },
  housewarming: {
    key: "housewarming",
    label: "집들이",
    emoji: "🏠",
    gradient: "from-amber-400 via-orange-400 to-yellow-300",
    accent: "#d97706",
    hint: "집 자랑 아니고요, 사람 그리워서요",
    particles: ["🏠", "🕯️", "🌿", "🍽️", "✨"],
  },
  drinks: {
    key: "drinks",
    label: "술약속",
    emoji: "🍻",
    gradient: "from-indigo-600 via-purple-600 to-fuchsia-500",
    accent: "#7c3aed",
    hint: "불참은 자유. 근데 서운할 예정",
    particles: ["🍻", "🥂", "🍾", "✨", "💜"],
  },
  hangout: {
    key: "hangout",
    label: "놀러가기",
    emoji: "✨",
    gradient: "from-sky-400 via-cyan-400 to-emerald-300",
    accent: "#0891b2",
    hint: "계획 없음. 장소만 있음. 일단 와",
    particles: ["✨", "🎉", "💫", "🫧", "🌊"],
  },
};

export const themeList = Object.values(themes);

export function getTheme(key: string | null | undefined): Theme {
  if (key && key in themes) return themes[key as ThemeKey];
  return themes.birthday;
}
