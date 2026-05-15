import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — do not remove this line
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[PROXY]", pathname, {
    hasUser: !!user,
    userId: user?.id,
    cookieNames: request.cookies.getAll().map((c) => c.name),
  });

  // Public routes: marketing landing, auth pages, mentor onboarding, utility/legal pages.
  const PUBLIC_EXACT = new Set(["/"]);
  const PUBLIC_PREFIXES = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/check-email",
    "/apply",
    "/mentor-setup",
    "/maintenance",
    "/session-expired",
    "/legal",
    "/auth/callback",
    "/auth", // catch any /auth/* path
    "/callback",
  ];
  const isPublic =
    PUBLIC_EXACT.has(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!user && !isPublic) {
    console.log("[PROXY] redirecting to /login (no user, not public)", pathname);
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
