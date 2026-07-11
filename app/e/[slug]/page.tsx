import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase, supabaseReady, type EventRow } from "@/lib/supabase";
import { getTheme } from "@/lib/themes";
import InviteClient from "./InviteClient";

async function getEvent(slug: string): Promise<EventRow | null> {
  if (!supabaseReady) return null;
  const { data } = await supabase.from("events").select("*").eq("slug", slug).single();
  return (data as EventRow) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const event = await getEvent(params.slug);
  if (!event) return { title: "초대장을 찾을 수 없어요 · 모디" };
  const theme = getTheme(event.theme);
  const desc = event.description || `${theme.emoji} ${theme.hint}`;
  return {
    title: `${theme.emoji} ${event.title}`,
    description: desc,
    openGraph: {
      title: `${theme.emoji} ${event.title}`,
      description: desc,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${theme.emoji} ${event.title}`,
      description: desc,
    },
  };
}

export default async function InvitePage({ params }: { params: { slug: string } }) {
  const event = await getEvent(params.slug);
  if (!event) notFound();
  return <InviteClient event={event} />;
}
