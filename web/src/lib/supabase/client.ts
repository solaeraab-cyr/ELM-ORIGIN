import { createBrowserClient } from "@supabase/ssr";

// Note: @supabase/ssr internally pins flowType to "pkce" and overrides any
// auth.flowType passed here. The PKCE `code_verifier` is stored as a cookie
// (SameSite=Lax) so the server-side /auth/callback route can read it after
// the OAuth redirect and complete the exchange.
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
