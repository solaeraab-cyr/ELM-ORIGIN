import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  if (code) {
    // Build the redirect response FIRST so the Supabase client writes
    // session cookies directly onto it — not onto a separate store that
    // gets lost when we redirect.
    const redirectUrl = `${origin}${next}`;
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Upsert profile row so every protected page can query it.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email ?? "",
            full_name:
              user.user_metadata?.full_name ??
              user.user_metadata?.name ??
              user.email?.split("@")[0] ??
              "",
            avatar_url: user.user_metadata?.avatar_url ?? null,
            tier: "free",
            plan: "Free",
          },
          { onConflict: "id", ignoreDuplicates: true }
        );
      }
      return response;
    }
  }

  // Code missing or exchange failed → back to login with error.
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(
      "Authentication failed. Please try again."
    )}`
  );
}
