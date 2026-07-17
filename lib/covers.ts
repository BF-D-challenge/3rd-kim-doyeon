// 커버(배경 그라데이션) 프리셋 — tw는 tailwind 클래스, css는 OG 이미지용
export type Cover = { id: string; label: string; tw: string; css: string };

export const covers: Cover[] = [
  { id: "sunset", label: "선셋", tw: "from-pink-500 via-rose-400 to-orange-300", css: "linear-gradient(135deg,#ec4899,#fb7185,#fdba74)" },
  { id: "honey", label: "허니", tw: "from-amber-400 via-orange-400 to-yellow-300", css: "linear-gradient(135deg,#fbbf24,#fb923c,#fde047)" },
  { id: "midnight", label: "미드나잇", tw: "from-indigo-600 via-purple-600 to-fuchsia-500", css: "linear-gradient(135deg,#4f46e5,#9333ea,#d946ef)" },
  { id: "ocean", label: "오션", tw: "from-sky-400 via-cyan-400 to-emerald-300", css: "linear-gradient(135deg,#38bdf8,#22d3ee,#6ee7b7)" },
  { id: "cherry", label: "체리", tw: "from-rose-600 via-red-500 to-orange-400", css: "linear-gradient(135deg,#e11d48,#ef4444,#fb923c)" },
  { id: "lavender", label: "라벤더", tw: "from-violet-400 via-purple-300 to-pink-300", css: "linear-gradient(135deg,#a78bfa,#d8b4fe,#f9a8d4)" },
  { id: "forest", label: "포레스트", tw: "from-emerald-600 via-teal-500 to-lime-300", css: "linear-gradient(135deg,#059669,#14b8a6,#bef264)" },
  { id: "mono", label: "모노", tw: "from-neutral-900 via-neutral-700 to-neutral-500", css: "linear-gradient(135deg,#171717,#404040,#737373)" },
];

export function getCover(id?: string | null): Cover | null {
  return covers.find((c) => c.id === id) ?? null;
}
