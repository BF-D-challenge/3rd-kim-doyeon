import { createClient } from "@supabase/supabase-js";

// 프로토타입용: anon 키로 읽기/쓰기 (RLS 정책은 supabase/schema.sql 참고)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseReady = Boolean(url && anon);

export const supabase = createClient(
  url ?? "https://placeholder.supabase.co",
  anon ?? "placeholder-anon-key"
);

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  theme: string;
  starts_at: string | null;
  place: string | null;
  description: string | null;
  created_at: string;
};

export type RsvpRow = {
  id: string;
  event_id: string;
  guest_name: string;
  status: "going" | "maybe" | "no";
  guest_token: string | null;
  created_at: string;
};
