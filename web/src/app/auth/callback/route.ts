import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  console.log("[AUTH CALLBACK] hit", {
    origin,
    hasCode: !!code,
    next,
    errorParam,
    errorDescription,
    cookieNames: request.cookies.getAll().map((c) => c.name),
  });

  // OAuth provider returned an error
  if (errorParam) {
    console.error("[AUTH CALLBACK] provider error", errorParam, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        errorDescription || errorParam || "OAuth failed"
      )}`
    );
  }

  if (!code) {
    console.error("[AUTH CALLBACK] no code in request");
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Missing authorization code")}`
    );
  }

  // Build the redirect response FIRST so the Supabase client writes
  // session cookies directly onto the response actually returned.
  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              // Make sure cookies persist across the redirect and are sent on /home.
              path: options?.path ?? "/",
              sameSite: options?.sameSite ?? "lax",
              secure: options?.secure ?? true,
              httpOnly: options?.httpOnly ?? true,
            });
          });
          console.log(
            "[AUTH CALLBACK] setAll wrote cookies",
            cookiesToSet.map((c) => c.name)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[AUTH CALLBACK] exchangeCodeForSession failed", error.message);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  console.log("[AUTH CALLBACK] session established", {
    userId: data.session?.user.id,
    hasAccessToken: !!data.session?.access_token,
    hasRefreshToken: !!data.session?.refresh_token,
    cookiesOnResponse: response.cookies.getAll().map((c) => c.name),
  });

  // Upsert profile (don't fail the redirect if this errors).
  if (data.session?.user) {
    const user = data.session.user;
    const { error: upsertErr } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email?.split("@")[0] ??
          "",
        avatar_url: user.user_metadata?.avatar_url ?? null,
        plan: "Free",
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
    if (upsertErr) {
      console.error("[AUTH CALLBACK] profile upsert failed", upsertErr.message);
    }
  }

  return response;
}
