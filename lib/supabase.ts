import { createClient } from "@supabase/supabase-js";

// 프로토타입용: anon 키로 읽기/쓰기 (RLS 정책은 supabase/schema.sql 참고)
// anon 키는 브라우저에 노출되는 공개 키(보안은 RLS 담당)라 기본값으로 포함.
// 환경변수가 있으면 그걸 우선 사용 (단, 마스킹 점(•)이 섞인 오염 값은 무시).
export const SUPABASE_URL = clean(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "https://kopnoivsclkrfizjwlzt.supabase.co"
);
export const SUPABASE_ANON_KEY = clean(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvcG5vaXZzY2xrcmZpemp3bHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3ODI1MjksImV4cCI6MjA5OTM1ODUyOX0.aQSsUmt8ryCzZmD8a6jWcpd8Tt8vtf1PiQhYrwDEf4E"
);

function clean(v: string | undefined, fallback: string) {
  if (!v || /[^\x21-\x7e]/.test(v)) return fallback;
  return v;
}

export const supabaseReady = true;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  theme: string;
  starts_at: string | null;
  place: string | null;
  description: string | null;
  created_at: string;
  // 꾸미기 (구버전 행은 null일 수 있음)
  cover?: string | null;
  stickers?: unknown;
  effect?: string | boolean | null;
  host_token?: string | null;
};

export type RsvpRow = {
  id: string;
  event_id: string;
  guest_name: string;
  status: "going" | "maybe" | "no";
  guest_token: string | null;
  created_at: string;
  // 한마디 (마이그레이션 전 행은 없음)
  comment?: string | null;
};
