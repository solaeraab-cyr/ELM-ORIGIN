import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// OAuth callback handler. The browser navigates here after Google → Supabase
// with `?code=...`. We exchange the code for a session server-side, reading
// the PKCE `code_verifier` from the cookies the browser already holds (set on
// the client by signInWithOAuth before the redirect; SameSite=Lax delivers
// them on the top-level navigation back).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        errorDescription || errorParam
      )}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Missing authorization code")}`
    );
  }

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
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  if (data.session?.user) {
    const user = data.session.user;
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
        plan: "Free",
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
  }

  return response;
}
