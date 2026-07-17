import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "모디 초대장";

// satori는 tailwind 클래스를 못 쓰므로 테마별 실제 색상 매핑
const THEME_STYLE: Record<string, { bg: string; chip: string }> = {
  birthday: { bg: "linear-gradient(135deg,#ec4899,#fb7185,#fdba74)", chip: "생일" },
  housewarming: { bg: "linear-gradient(135deg,#fbbf24,#fb923c,#fde047)", chip: "집들이" },
  drinks: { bg: "linear-gradient(135deg,#4f46e5,#9333ea,#d946ef)", chip: "술약속" },
  hangout: { bg: "linear-gradient(135deg,#38bdf8,#22d3ee,#6ee7b7)", chip: "놀러가기" },
};

async function loadKoreanFont(text: string): Promise<ArrayBuffer | null> {
  try {
    // 제목에 쓰인 글자만 서브셋으로 받아 용량 최소화
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(text)}`;
    const css = await fetch(cssUrl, {
      // 구형 UA로 요청하면 satori가 지원하는 woff/ttf URL을 돌려줌
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1; rv:10.0)" },
    }).then((r) => r.text());
    const match = css.match(/src:\s*url\(([^)]+)\)/);
    if (!match) return null;
    return await fetch(match[1]).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OgImage({ params }: { params: { slug: string } }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let title = "초대장이 도착했어요";
  let description = "이름만 남기면 참석 완료";
  let themeKey = "birthday";

  if (url && anon) {
    const supabase = createClient(url, anon);
    const { data } = await supabase
      .from("events")
      .select("title, description, theme")
      .eq("slug", params.slug)
      .single();
    if (data) {
      title = data.title;
      if (data.description) description = data.description;
      if (data.theme) themeKey = data.theme;
    }
  }

  const style = THEME_STYLE[themeKey] ?? THEME_STYLE.birthday;
  const fontText = `${title}${description}${style.chip}모디 · 초대가 곧 기대감이 되는 앱이름만 남기면 참석 완료`;
  const font = await loadKoreanFont(fontText);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: style.bg,
          color: "#ffffff",
          fontFamily: "NotoSansKR",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "10px 28px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.22)",
            fontSize: 30,
            marginBottom: 36,
          }}
        >
          {style.chip}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 14 ? 68 : 84,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.2,
            textShadow: "0 2px 12px rgba(0,0,0,0.18)",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            marginTop: 28,
            opacity: 0.92,
          }}
        >
          {description}
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 44,
            fontSize: 26,
            opacity: 0.85,
          }}
        >
          모디 · 초대가 곧 기대감이 되는 앱
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "NotoSansKR", data: font, weight: 700 as const, style: "normal" as const }]
        : undefined,
    }
  );
}
