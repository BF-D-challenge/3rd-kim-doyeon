"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  PartyPopper,
  Hourglass,
  Frown,
  Check,
  Copy,
  Link2,
  CalendarCheck,
  CalendarPlus,
  Loader2,
  Sparkles,
  Users,
  Circle,
  CircleCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase, type EventRow, type RsvpRow } from "@/lib/supabase";
import { getTheme } from "@/lib/themes";
import type { Sticker } from "@/lib/stickers";
import { normalizeEffect } from "@/lib/effects";
import { useUser } from "@/lib/useUser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InviteHero } from "@/components/InviteHero";
import { cn } from "@/lib/utils";

type Status = "going" | "maybe" | "no";

const STATUS_META: Record<Status, { label: string; Icon: LucideIcon }> = {
  going: { label: "갈게", Icon: PartyPopper },
  maybe: { label: "고민중", Icon: Hourglass },
  no: { label: "못가", Icon: Frown },
};

function getGuestToken(eventId: string) {
  if (typeof window === "undefined") return "";
  const k = `modi_token_${eventId}`;
  let t = localStorage.getItem(k);
  if (!t) {
    t = crypto.randomUUID();
    localStorage.setItem(k, t);
  }
  return t;
}

export default function InviteClient({ event: initialEvent }: { event: EventRow }) {
  // 확정 후 로컬에서 즉시 갱신되도록 event를 상태로 보관
  const [event, setEvent] = useState<EventRow>(initialEvent);
  const { user } = useUser();
  const theme = getTheme(event.theme);
  const searchParams = useSearchParams();
  const justCreated = searchParams.get("created") === "1";

  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [votes, setVotes] = useState<string[]>([]);
  const [myStatus, setMyStatus] = useState<Status | null>(null);
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  // 모디 루프
  const [isHost, setIsHost] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDate, setConfirmDate] = useState("");
  const [confirmPlace, setConfirmPlace] = useState("");
  const [confirming, setConfirming] = useState(false);

  const isConfirmed = Boolean(event.confirmed_at);
  const dateOptions = (Array.isArray(event.date_options) ? event.date_options : []) as string[];
  const isPoll = dateOptions.length > 0 && !isConfirmed;
  const isUndecided = !event.starts_at && !isPoll;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });

  // 후보별 득표수
  const voteCount = (opt: string) =>
    rsvps.filter((r) => Array.isArray(r.date_votes) && r.date_votes.includes(opt)).length;

  useEffect(() => {
    setPageUrl(window.location.href.split("?")[0]);
    // 호스트 식별: ① 로그인 계정이 이 이벤트 주인 ② 또는 생성한 브라우저(토큰)
    const ht = localStorage.getItem(`modi_host_${event.id}`);
    const byToken = Boolean(ht && event.host_token && ht === event.host_token);
    const byAccount = Boolean(user && event.host_user_id && user.id === event.host_user_id);
    setIsHost(byToken || byAccount);
    // 게스트 회신 여부
    if (localStorage.getItem(`modi_token_${event.id}`)) setHasResponded(true);
  }, [event.id, event.host_token, event.host_user_id, user]);

  const [confirmError, setConfirmError] = useState<string | null>(null);

  async function doConfirm(startIso: string, place?: string) {
    setConfirming(true);
    setConfirmError(null);
    const { data, error } = await supabase
      .from("events")
      .update({
        starts_at: startIso,
        place: (place ?? confirmPlace).trim() || event.place,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", event.id)
      .select("*")
      .maybeSingle();
    setConfirming(false);
    if (error || !data) {
      setConfirmError("확정에 실패했어요. 권한(RLS) 설정을 확인해주세요.");
      return;
    }
    setEvent(data as EventRow);
    setConfirmOpen(false);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: theme.confetti,
      disableForReducedMotion: true,
    });
  }

  function confirmDateSubmit() {
    if (!confirmDate) return;
    doConfirm(new Date(confirmDate).toISOString());
  }

  function addToCalendar() {
    if (!event.starts_at) return;
    const start = new Date(event.starts_at);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `UID:${event.id}@modi`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${event.title}`,
      event.place ? `LOCATION:${event.place}` : "",
      event.description ? `DESCRIPTION:${event.description}` : "",
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const shareMessage = `${event.title}\n초대장 왔어요 🎉 이름만 남기면 참석 완료!\n👉 ${pageUrl}`;

  // 클립보드 API 실패 환경(카톡 인앱 등) 대비 폴백 포함
  async function copyText(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  }

  async function copyMessage() {
    const url = window.location.href.split("?")[0];
    const ok = await copyText(`${event.title}\n초대장 왔어요 🎉 이름만 남기면 참석 완료!\n👉 ${url}`);
    if (ok) {
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 1800);
    }
  }

  async function shareToFriends() {
    const url = window.location.href.split("?")[0];
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: event.title, text: shareMessage, url });
        return;
      } catch {
        /* 취소/미지원 → 복사 폴백 */
      }
    }
    copyMessage();
  }

  const fetchRsvps = useCallback(async () => {
    const { data } = await supabase
      .from("rsvps")
      .select("*")
      .eq("event_id", event.id)
      .order("created_at", { ascending: true });
    if (data) setRsvps(data as RsvpRow[]);
  }, [event.id]);

  useEffect(() => {
    fetchRsvps();
    // 실시간 명단 스노볼
    const channel = supabase
      .channel(`rsvps_${event.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rsvps", filter: `event_id=eq.${event.id}` },
        () => fetchRsvps()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [event.id, fetchRsvps]);

  async function submit(status: Status) {
    if (!name.trim()) return;
    setSubmitting(true);
    setRsvpError(null);
    const token = getGuestToken(event.id);

    const { data: existing } = await supabase
      .from("rsvps")
      .select("id")
      .eq("event_id", event.id)
      .eq("guest_token", token)
      .maybeSingle();
    const id = (existing as { id: string } | null)?.id;

    const base: Record<string, unknown> = { guest_name: name.trim(), status };
    if (isPoll) base.date_votes = votes;
    const full = comment.trim() ? { ...base, comment: comment.trim() } : base;

    // comment 컬럼이 아직 없는 DB(마이그레이션 전)면 comment 빼고 재시도 → 참석은 무조건 저장
    async function write(payload: Record<string, unknown>) {
      if (id) return supabase.from("rsvps").update(payload).eq("id", id);
      return supabase.from("rsvps").insert({ event_id: event.id, guest_token: token, ...payload });
    }
    const isSchemaErr = (e: { code?: string; message?: string } | null) =>
      !!e && (e.code === "PGRST204" || e.code === "42703" || /comment/i.test(e.message ?? ""));

    let { error } = await write(full);
    if (error && isSchemaErr(error)) {
      ({ error } = await write(base)); // 한마디 컬럼 없으면 참석만 저장
    }
    setSubmitting(false);

    if (error) {
      setRsvpError("응답 저장에 실패했어요. 잠시 후 다시 시도해줘요.");
      return;
    }

    setMyStatus(status);
    setPendingStatus(null);
    setDone(true);
    fetchRsvps();

    if (status === "going") {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.7 },
        colors: theme.confetti,
        disableForReducedMotion: true,
      });
    }
  }

  async function copyLink() {
    const ok = await copyText(window.location.href.split("?")[0]);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  const going = rsvps.filter((r) => r.status === "going");
  const maybe = rsvps.filter((r) => r.status === "maybe");
  const no = rsvps.filter((r) => r.status === "no");
  // 가장 최근 한마디 (명단 '분위기' 헤더용)
  const latestComment = [...rsvps].reverse().find((r) => r.comment && r.comment.trim());

  const dateLabel = event.starts_at
    ? new Date(event.starts_at).toLocaleString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "미정";

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-background">
      {justCreated && (
        <div className="border-b bg-muted/50 px-5 py-4">
          <p className="mb-2 text-sm font-medium">완성! 이 문구를 카톡방에 붙여요</p>
          <div className="whitespace-pre-line rounded-lg border bg-background p-3 text-sm text-muted-foreground">
            {shareMessage}
          </div>
          <div className="mt-2 flex gap-2">
            <Button onClick={copyMessage} size="sm" className="flex-1 gap-1.5">
              {copiedMsg ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedMsg ? "복사됨" : "초대 문구 복사"}
            </Button>
            <Button onClick={copyLink} size="sm" variant="outline" className="gap-1.5">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
              링크
            </Button>
          </div>

          {/* 카톡 미리보기 (실제 OG 이미지) */}
          <p className="mb-1.5 mt-4 text-xs text-muted-foreground">카톡에 붙이면 이렇게 보여요</p>
          <div className="max-w-[260px] overflow-hidden rounded-xl border bg-background">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/e/${event.slug}/opengraph-image`}
              alt="카톡 미리보기 카드"
              className="aspect-[1200/630] w-full object-cover"
            />
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium">{event.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {event.description ?? "이름만 남기면 참석 완료"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                {pageUrl.replace(/^https?:\/\//, "")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 게스트 재방문: 날짜 확정 알림 배너 */}
      {isConfirmed && !isHost && hasResponded && (
        <div className="flex items-center gap-2 bg-primary px-5 py-3 text-primary-foreground">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">날짜가 확정됐어요 — {dateLabel}</span>
        </div>
      )}

      {/* 초대장 히어로 (호스트가 꾸민 그대로) */}
      <InviteHero
        theme={theme}
        coverId={event.cover}
        title={event.title}
        description={event.description}
        dateLabel={dateLabel}
        placeLabel={event.place ?? "미정"}
        stickers={(Array.isArray(event.stickers) ? event.stickers : []) as Sticker[]}
        effect={normalizeEffect(event.effect)}
        dateConfirmed={isConfirmed}
      />

      {/* 호스트: 날짜 확정 (미정 or 후보 투표일 때) */}
      {isHost && !isConfirmed && (isUndecided || isPoll) && (
        <section className="border-b bg-amber-50 px-5 py-4 dark:bg-amber-950/30">
          {isPoll ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold">후보 중에 날짜를 확정하세요</p>
              <p className="text-xs text-muted-foreground">
                게스트 투표를 보고 하나 고르면 전원에게 알려요
              </p>
              {confirmError && (
                <p className="text-xs font-medium text-destructive">{confirmError}</p>
              )}
              {[...dateOptions]
                .sort((a, b) => voteCount(b) - voteCount(a))
                .map((o) => (
                  <button
                    key={o}
                    type="button"
                    disabled={confirming}
                    onClick={() => doConfirm(o)}
                    className="flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2.5 text-sm transition hover:bg-accent disabled:opacity-50"
                  >
                    <span className="font-medium">{fmtDate(o)}</span>
                    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {voteCount(o)}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        <CalendarCheck className="h-4 w-4" /> 확정
                      </span>
                    </span>
                  </button>
                ))}
            </div>
          ) : !confirmOpen ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">날짜가 아직 미정이에요</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  확정하면 초대장이 갱신되고 회신한 게스트가 알아요
                </p>
              </div>
              <Button size="sm" className="shrink-0 gap-1.5" onClick={() => setConfirmOpen(true)}>
                <CalendarCheck className="h-3.5 w-3.5" /> 날짜 확정
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold">날짜 확정하기</p>
              <Input
                type="datetime-local"
                value={confirmDate}
                onChange={(e) => setConfirmDate(e.target.value)}
              />
              <Input
                value={confirmPlace}
                onChange={(e) => setConfirmPlace(e.target.value)}
                placeholder={event.place ?? "장소 (선택) — 함께 공개돼요"}
              />
              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-1.5"
                  disabled={!confirmDate || confirming}
                  onClick={confirmDateSubmit}
                >
                  {confirming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CalendarCheck className="h-4 w-4" />
                  )}
                  확정하고 알리기
                </Button>
                <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                  취소
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 확정된 모임: 캘린더 추가 (누구나) */}
      {isConfirmed && (
        <section className="px-5 pt-5">
          <Button variant="outline" className="w-full gap-1.5" onClick={addToCalendar}>
            <CalendarPlus className="h-4 w-4" /> 캘린더에 추가
          </Button>
        </section>
      )}

      {/* RSVP — 커버를 덮지 않고 아래에 (히어로/폼 분리) · 테두리 없이 미니멀 */}
      <section className="px-5 pt-6">
        <Card className="rounded-none border-0 bg-transparent p-0 shadow-none">
          {!done ? (
            <>
              {isPoll ? (
                <>
                  <p className="mb-4 text-center font-medium">되는 날짜 골라줘요</p>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름"
                    className="mb-2 h-12 text-center text-base"
                  />
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="한마디 (선택) — 모두에게 보여요"
                    className="mb-4 h-11 text-center text-sm"
                  />
                  <div className="mb-4 space-y-2">
                    {dateOptions.map((o) => {
                      const on = votes.includes(o);
                      return (
                        <button
                          key={o}
                          type="button"
                          onClick={() =>
                            setVotes((v) => (on ? v.filter((x) => x !== o) : [...v, o]))
                          }
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition active:scale-[0.99]",
                            on
                              ? "border-primary bg-accent ring-1 ring-primary"
                              : "border-input hover:bg-accent/50"
                          )}
                        >
                          <span className="font-medium">{fmtDate(o)}</span>
                          {on ? (
                            <CircleCheck
                              className="h-5 w-5"
                              style={{ color: theme.accent }}
                            />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground/40" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    className="h-12 w-full"
                    disabled={!name.trim() || submitting}
                    onClick={() => submit(votes.length > 0 ? "going" : "no")}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : votes.length > 0 ? (
                      `${votes.length}개 날짜 돼요 · 회신하기`
                    ) : (
                      "다 안 돼요"
                    )}
                  </Button>
                </>
              ) : !pendingStatus ? (
                // 리액션 먼저 (이름은 그다음) · 소셜 증거를 CTA 위에 · 갈게 강조
                <>
                  {going.length > 0 ? (
                    <div className="mb-4 flex flex-col items-center gap-2">
                      <div className="flex -space-x-2">
                        {going.slice(0, 4).map((p) => (
                          <span
                            key={p.id}
                            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card text-xs font-semibold"
                            style={{ backgroundColor: `${theme.accent}26`, color: theme.accent }}
                          >
                            {p.guest_name.trim().charAt(0)}
                          </span>
                        ))}
                        {going.length > 4 && (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-semibold text-muted-foreground">
                            +{going.length - 4}
                          </span>
                        )}
                      </div>
                      <p className="text-sm">
                        <span className="font-semibold">{going[0].guest_name}</span>
                        {going.length > 1 ? ` 외 ${going.length - 1}명` : ""}이 온대요
                      </p>
                    </div>
                  ) : (
                    <p className="mb-4 text-center font-medium">올 거예요?</p>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    {(["no", "maybe", "going"] as Status[]).map((s) => {
                      const { label, Icon } = STATUS_META[s];
                      const primary = s === "going";
                      return (
                        <Button
                          key={s}
                          type="button"
                          variant={primary ? "default" : "outline"}
                          onClick={() => {
                            setRsvpError(null);
                            setPendingStatus(s);
                          }}
                          className="flex h-auto flex-col gap-1.5 py-3.5 transition-transform active:scale-95"
                        >
                          <Icon
                            className="h-5 w-5"
                            strokeWidth={1.75}
                            style={primary ? undefined : { color: theme.accent }}
                          />
                          <span className="text-sm">{label}</span>
                        </Button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    탭 한 번이면 끝 · 이름은 그다음에 물어봐요
                  </p>
                </>
              ) : (
                // 리액션 선택 후 — 이름(+한마디)
                <>
                  <button
                    type="button"
                    onClick={() => setPendingStatus(null)}
                    className="mb-2 text-sm text-muted-foreground underline underline-offset-2"
                  >
                    ← 다시 고르기
                  </button>
                  <p className="mb-4 text-center font-medium">
                    <span style={{ color: theme.accent }}>
                      {STATUS_META[pendingStatus].label}
                    </span>{" "}
                    · 이름만 남겨줘요
                  </p>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름"
                    autoFocus
                    className="mb-2 h-12 text-center text-base"
                  />
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="한마디 (선택) — 모두에게 보여요"
                    className="mb-4 h-11 text-center text-sm"
                  />
                  <Button
                    className="h-12 w-full"
                    disabled={!name.trim() || submitting}
                    onClick={() => submit(pendingStatus)}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "이름 남기고 완료"
                    )}
                  </Button>
                </>
              )}
              {rsvpError && (
                <p className="mt-3 text-center text-sm text-destructive">{rsvpError}</p>
              )}
              {isPoll && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  가입·전화번호 없이 이름만 · 명단은 서로 볼 수 있어요
                </p>
              )}
            </>
          ) : (
            <div className="py-2 text-center">
              <div
                className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: `${theme.accent}1a` }}
              >
                <Check className="h-5 w-5" style={{ color: theme.accent }} />
              </div>
              <p className="mb-1 text-lg font-semibold">
                {isPoll
                  ? `${name}님 회신 완료!`
                  : `${name}님 ${myStatus ? STATUS_META[myStatus].label : ""}!`}
              </p>
              <button
                onClick={() => {
                  setPendingStatus(myStatus);
                  setDone(false);
                }}
                className="text-sm text-muted-foreground underline underline-offset-2"
              >
                응답 바꾸기
              </button>
            </div>
          )}
        </Card>
      </section>

      {/* 명단 (G2) = 분위기 헤더 + 카드 리스트 + 바이럴 루프 CTA */}
      <section className="px-5 py-8">
        {/* 분위기 먼저 — 겹친 아바타 + 대표 한마디 + N명 (Apple Invites Guest List 헤더) */}
        {going.length > 0 && (
          <div className="mb-6 rounded-2xl bg-muted/60 p-5 text-center">
            <div className="mb-3 flex justify-center -space-x-2">
              {going.slice(0, 5).map((p) => (
                <span
                  key={p.id}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background text-sm font-semibold"
                  style={{ backgroundColor: `${theme.accent}26`, color: theme.accent }}
                >
                  {p.guest_name.trim().charAt(0)}
                </span>
              ))}
            </div>
            {latestComment && (
              <>
                <p className="break-keep text-lg font-bold">
                  &ldquo;{latestComment.comment}&rdquo;
                </p>
                <p className="text-sm text-muted-foreground">{latestComment.guest_name}</p>
              </>
            )}
            <p className="mt-2 font-medium">{going.length}명이 온대요</p>
          </div>
        )}

        {event.host_name && (
          <div className="mb-6">
            <p className="mb-3 text-sm text-muted-foreground">호스트</p>
            <div className="flex items-center gap-3 rounded-2xl border bg-muted/40 p-3.5">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                style={{ backgroundColor: `${theme.accent}26`, color: theme.accent }}
              >
                {event.host_name.trim().charAt(0)}
              </span>
              <p className="font-semibold">{event.host_name}</p>
            </div>
          </div>
        )}

        <NameList meta={STATUS_META.going} people={going} accent={theme.accent} highlight />
        <NameList meta={STATUS_META.maybe} people={maybe} accent={theme.accent} />
        <NameList meta={STATUS_META.no} people={no} accent={theme.accent} />

        {rsvps.length === 0 && (
          <p className="mb-6 text-center text-sm text-muted-foreground">
            아직 아무도 없어요. 첫 번째로 남겨봐요!
          </p>
        )}

        {/* 바이럴 루프 — 공유 + 나도 만들기 (한마디가 쌓일수록 재공유 ↑) */}
        <div className="grid grid-cols-2 gap-2 border-t pt-6">
          <Button variant="outline" className="h-12" onClick={shareToFriends}>
            친구한테 공유
          </Button>
          <Button asChild className="h-12">
            <a href="/create">나도 만들어보기</a>
          </Button>
        </div>
      </section>

      <footer className="pb-10 text-center text-xs text-muted-foreground/70">
        made with 모디 · 초대가 곧 기대감이 되는 앱
      </footer>
    </main>
  );
}

function NameList({
  meta,
  people,
  accent,
  highlight,
  limit = 4,
}: {
  meta: { label: string; Icon: LucideIcon };
  people: RsvpRow[];
  accent: string;
  highlight?: boolean;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  if (people.length === 0) return null;
  const { label, Icon } = meta;
  const shown = expanded ? people : people.slice(0, limit);
  const hidden = people.length - shown.length;
  return (
    <div className="mb-6">
      <p className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" /> {label} ({people.length})
      </p>
      <div className="space-y-2.5">
        {shown.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-2xl border p-3.5">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
              style={{ backgroundColor: `${accent}26`, color: accent }}
            >
              {p.guest_name.trim().charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className={highlight ? "font-semibold" : "font-medium"}>{p.guest_name}</p>
              {p.comment && (
                <p className="mt-0.5 break-keep text-sm text-muted-foreground">{p.comment}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2.5 text-sm text-muted-foreground underline underline-offset-2"
        >
          +{hidden}명 더 보기
        </button>
      )}
    </div>
  );
}
