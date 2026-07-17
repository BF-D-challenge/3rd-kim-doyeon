import type { LucideIcon } from "lucide-react";
import { Ban, Wind, SmilePlus, Sparkles, Waves, Radio } from "lucide-react";

export type EffectType = "none" | "float" | "emoji" | "glitter" | "wave" | "pulse";

export const effectOptions: { key: EffectType; label: string; hint: string; Icon: LucideIcon }[] = [
  { key: "none", label: "없음", hint: "차분하게", Icon: Ban },
  { key: "float", label: "떠오르기", hint: "테마 아이콘이 은은하게", Icon: Wind },
  { key: "emoji", label: "이모지", hint: "내가 올린 이모지 스티커가 떠다녀요", Icon: SmilePlus },
  { key: "glitter", label: "글리터", hint: "반짝반짝 트윙클", Icon: Sparkles },
  { key: "wave", label: "물결", hint: "아래에서 일렁이는 파도", Icon: Waves },
  { key: "pulse", label: "파동", hint: "중심에서 퍼지는 링", Icon: Radio },
];

// 구버전 boolean(effect on/off) 값도 안전하게 흡수
export function normalizeEffect(v: unknown): EffectType {
  if (v === false || v === "none") return "none";
  if (v === "emoji" || v === "glitter" || v === "wave" || v === "pulse" || v === "float") return v;
  return "float";
}
