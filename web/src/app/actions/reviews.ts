'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function listReviewsFor(mentorId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviewer_id(full_name, avatar_url)')
    .eq('reviewee_id', mentorId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function listMyReviews() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  return listReviewsFor(user.id);
}

export async function createReview(input: { sessionId?: string | null; revieweeId: string; rating: number; text: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { error } = await supabase.from('reviews').insert({
    session_id: input.sessionId ?? null,
    reviewer_id: user.id,
    reviewee_id: input.revieweeId,
    rating: input.rating,
    text: input.text,
  });
  if (error) throw error;
  revalidatePath('/my-sessions');
  revalidatePath('/mentor/reviews');
}

export async function replyToReview(reviewId: string, reply: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { error } = await supabase
    .from('reviews')
    .update({ reply, reply_date: new Date().toISOString() })
    .eq('id', reviewId)
    .eq('reviewee_id', user.id);
  if (error) throw error;
  revalidatePath('/mentor/reviews');
}
