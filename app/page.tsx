"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, LogOut, CalendarCheck, CircleDashed, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase, type EventRow } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";
import { themeList, getTheme } from "@/lib/themes";

export default function Home() {
  const { user, loading } = useUser();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const loadMine = useCallback(async () => {
    setLoadingEvents(true);
    const slugs: string[] = JSON.parse(localStorage.getItem("modi_created") ?? "[]");
    const map = new Map<string, EventRow>();

    if (user) {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("host_user_id", user.id)
        .order("created_at", { ascending: false });
      (data as EventRow[] | null)?.forEach((e) => map.set(e.id, e));
    }
    if (slugs.length) {
      const { data } = await supabase
        .from("events")
        .select("*")
        .in("slug", slugs)
        .order("created_at", { ascending: false });
      (data as EventRow[] | null)?.forEach((e) => map.set(e.id, e));
    }
    setEvents(
      Array.from(map.values()).sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    );
    setLoadingEvents(false);
  }, [user]);

  useEffect(() => {
    if (!loading) loadMine();
  }, [loading, loadMine]);

  const hasEvents = events.length > 0;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-background px-5 py-8">
      {/* 상단 바 */}
      <div className="mb-8 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-[0.15em] text-muted-foreground">
          MODI · 모디
        </span>
        {user ? (
          <button
            onClick={() => supabase.auth.signOut()}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> 로그아웃
          </button>
        ) : (
          <Link href="/login" className="text-xs font-medium text-muted-foreground">
            로그인
          </Link>
        )}
      </div>

      {hasEvents ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">내 모임</h1>
            <Button asChild size="sm" className="gap-1">
              <Link href="/create">
                <Plus className="h-4 w-4" /> 새로 만들기
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {events.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
          {!user && (
            <Link
              href="/login"
              className="mt-6 block rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground"
            >
              로그인하면 다른 기기에서도 내 모임을 볼 수 있어요 →
            </Link>
          )}
        </>
      ) : (
        <div className="flex min-h-[70vh] flex-col justify-center text-center">
          <h1 className="mb-4 text-[2.4rem] font-bold leading-[1.2] tracking-tight">
            초대가 곧<br />기대감이 되는 앱
          </h1>
          <p className="mb-8 leading-relaxed text-muted-foreground">
            밋밋한 단톡방 공지 말고,<br />
            테마 입힌 초대장 하나로.
          </p>
          <div className="mb-10 flex justify-center gap-3">
            {themeList.map((t) => {
              const Icon = t.Icon;
              return (
                <span
                  key={t.key}
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${t.accent}14`, color: t.accent }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
              );
            })}
          </div>
          <Button asChild size="lg" className="h-14 w-full rounded-xl text-base">
            <Link href="/create">
              초대장 만들기 <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          {!loadingEvents && (
            <Link
              href="/login"
              className="mt-4 text-sm text-muted-foreground underline underline-offset-2"
            >
              이미 만든 초대장이 있어요 · 로그인
            </Link>
          )}
        </div>
      )}
    </main>
  );
}

function EventCard({ ev }: { ev: EventRow }) {
  const theme = getTheme(ev.theme);
  const Icon = theme.Icon;
  const options = (Array.isArray(ev.date_options) ? ev.date_options : []) as string[];

  const dateStr = (iso: string) =>
    new Date(iso).toLocaleString("ko-KR", { month: "long", day: "numeric", weekday: "short" });

  let status: { label: string; Icon: typeof CalendarCheck } = { label: "미정", Icon: CircleDashed };
  if (ev.confirmed_at && ev.starts_at) status = { label: dateStr(ev.starts_at), Icon: CalendarCheck };
  else if (options.length > 0) status = { label: `후보 ${options.length}개 · 투표중`, Icon: Vote };
  else if (ev.starts_at) status = { label: dateStr(ev.starts_at), Icon: CalendarCheck };
  const StatusIcon = status.Icon;

  return (
    <Link
      href={`/e/${ev.slug}`}
      className="flex items-center gap-3 rounded-2xl border p-3.5 transition active:scale-[0.99]"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${theme.accent}14`, color: theme.accent }}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{ev.title}</p>
        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <StatusIcon className="h-3.5 w-3.5" /> {status.label}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
