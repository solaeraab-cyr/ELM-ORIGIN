import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/home';

  if (errorParam) {
    console.log(`[cb] code=false err=${errorDescription ?? errorParam}`);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription ?? errorParam)}`
    );
  }

  if (!code) {
    console.log('[cb] code=false err=missing_code');
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  // Build the redirect response up front so the Supabase server client can
  // write the new session cookies directly onto it. Relying on
  // cookies().set() from next/headers to propagate into a manually returned
  // NextResponse is fragile — set them on the response object we return.
  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          const cookieHeader = request.headers.get('cookie') ?? '';
          if (!cookieHeader) return [];
          return cookieHeader.split(';').map((pair) => {
            const idx = pair.indexOf('=');
            const name = (idx === -1 ? pair : pair.slice(0, idx)).trim();
            const value = idx === -1 ? '' : decodeURIComponent(pair.slice(idx + 1).trim());
            return { name, value };
          });
        },
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  console.log(`[cb] code=${!!code} err=${error?.message ?? 'none'}`);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  return response;
}
