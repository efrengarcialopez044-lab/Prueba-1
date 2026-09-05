import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Refreshes the Supabase auth session on every request and blocks
 * unauthenticated access to /admin. In demo mode (no Supabase configured)
 * /admin stays reachable so the panel can be showcased with mock data.
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const isAdminRoute =
    request.nextUrl.pathname.startsWith("/admin") &&
    request.nextUrl.pathname !== "/admin/login";

  if (!isSupabaseConfigured) {
    // No real auth backend to check in demo mode. We still want the guest
    // cancellation-deadline rule to be enforceable server-side (not just a
    // hidden button), so we mark "came from the admin area" with a cookie
    // instead of always trusting every request as the admin.
    if (isAdminRoute) {
      response.cookies.set("demo_admin", "1", { httpOnly: true, sameSite: "lax", path: "/" });
    }
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminRoute && !user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
