import "server-only";
import { cookies } from "next/headers";
import { isSupabaseConfigured, createClient } from "./supabase/server";

/**
 * Resolves whether the current request is authenticated as the admin.
 *
 * In demo mode (no Supabase configured) there's no real auth backend, so we
 * use a `demo_admin` cookie set by the proxy only while browsing under
 * /admin as a stand-in session. This matters for correctness, not just
 * show: it's what lets the guest-side cancellation deadline actually be
 * enforced server-side even before Supabase Auth is wired up, instead of
 * every request being silently trusted as the admin.
 *
 * Once Supabase env vars are set, this checks a real session instead,
 * matching the RLS policies in the SQL migration.
 */
export async function getIsAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const cookieStore = await cookies();
    return cookieStore.get("demo_admin")?.value === "1";
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return Boolean(user);
}
