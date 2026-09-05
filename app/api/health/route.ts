import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { isStripeConfigured } from "@/lib/stripe";
import { isGoogleCalendarConfigured } from "@/lib/google-calendar";
import { getProperty } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/health — for uptime monitors (UptimeRobot, Vercel Cron, etc.).
 * Confirms the app can actually read its data (not just that the process
 * is up), and reports which optional integrations are wired up so a
 * misconfigured env var shows up here instead of silently degrading.
 */
export async function GET() {
  try {
    await getProperty();
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mode: isSupabaseConfigured ? "supabase" : "demo",
    integrations: {
      supabase: isSupabaseConfigured,
      stripe: isStripeConfigured,
      googleCalendar: isGoogleCalendarConfigured,
    },
  });
}
