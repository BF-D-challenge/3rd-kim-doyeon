export const dynamic = "force-dynamic";

// 배포 환경 진단용: 환경변수 존재 여부(길이)와 DB 연결만 확인
// (anon 키는 원래 클라이언트에 노출되는 공개 키라 앞뒤 일부 표시는 무해)
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  let db = "skip (env missing)";
  if (url && key) {
    try {
      const r = await fetch(`${url}/rest/v1/events?select=slug&limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        cache: "no-store",
      });
      db = r.ok ? "ok" : `error ${r.status}`;
    } catch {
      db = "fetch failed";
    }
  }

  return Response.json({
    urlLen: url.length,
    urlValue: url || null,
    keyLen: key.length,
    keyStart: key.slice(0, 10) || null,
    keyEnd: key.slice(-6) || null,
    db,
  });
}
