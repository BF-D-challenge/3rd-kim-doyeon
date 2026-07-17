import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// 배포 환경 진단용: 실제 사용되는 접속값과 DB 연결 상태 확인
export async function GET() {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  let db: string;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/events?select=slug&limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      cache: "no-store",
    });
    db = r.ok ? "ok" : `error ${r.status}`;
  } catch {
    db = "fetch failed";
  }

  return Response.json({
    url: SUPABASE_URL,
    keySource: envKey && !/[^\x21-\x7e]/.test(envKey) ? "env" : "fallback(내장값)",
    db,
  });
}
