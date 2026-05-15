"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const role = formData.get("role") as string | null;

  if (!email || !password) {
    redirect(`/signup?error=${encodeURIComponent("Email and password are required")}`);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, is_mentor: role === "mentor" },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // Create profile immediately if session is available (email confirmation disabled)
  if (data.session && data.user) {
    await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        email: data.user.email ?? email,
        full_name: fullName ?? email.split("@")[0],
        tier: "free",
        plan: "Free",
        is_mentor: role === "mentor",
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
    revalidatePath("/", "layout");
    redirect("/home");
  }

  redirect("/check-email");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Ensure profile exists for email/password users
  if (data.user) {
    await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        email: data.user.email ?? email,
        full_name:
          data.user.user_metadata?.full_name ??
          data.user.user_metadata?.name ??
          email.split("@")[0],
        tier: "free",
        plan: "Free",
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
  }

  revalidatePath("/", "layout");
  redirect("/home");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/check-email?type=reset");
}
