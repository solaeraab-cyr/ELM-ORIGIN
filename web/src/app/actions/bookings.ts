'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function listMyBookings(status?: 'pending' | 'confirmed' | 'completed' | 'cancelled') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  let q = supabase
    .from('bookings')
    .select('*, student:profiles!student_id(*), mentor:profiles!mentor_id(*)')
    .eq('student_id', user.id)
    .order('scheduled_date', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data } = await q;
  return data ?? [];
}

export async function listMentorBookings(status?: 'pending' | 'confirmed' | 'completed' | 'cancelled') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  let q = supabase
    .from('bookings')
    .select('*, student:profiles!student_id(*)')
    .eq('mentor_id', user.id)
    .order('scheduled_date', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data } = await q;
  return data ?? [];
}

export async function createBooking(input: {
  mentorId: string;
  type: 'voice' | 'video';
  date: string;
  time: string;
  duration: 30 | 60;
  agenda?: string;
  price: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      student_id: user.id,
      mentor_id: input.mentorId,
      type: input.type,
      scheduled_date: input.date,
      scheduled_time: input.time,
      duration: input.duration,
      agenda: input.agenda || null,
      price: input.price,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  // Notify the mentor
  await supabase.from('notifications').insert({
    user_id: input.mentorId,
    type: 'booking_request',
    title: 'New booking request',
    description: `${input.duration}-min ${input.type} session · ${input.date} at ${input.time}`,
    data: { booking_id: data.id },
  });
  revalidatePath('/my-sessions');
  revalidatePath('/mentor/bookings');
  return data;
}

export async function acceptBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId)
    .eq('mentor_id', user.id)
    .select()
    .single();
  if (error) throw error;
  await supabase.from('notifications').insert({
    user_id: data.student_id,
    type: 'booking_accepted',
    title: 'Booking confirmed ✓',
    description: `${data.scheduled_date} at ${data.scheduled_time}`,
    data: { booking_id: bookingId },
  });
  revalidatePath('/mentor/bookings');
  revalidatePath('/mentor/dashboard');
  return data;
}

export async function declineBooking(bookingId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'declined', decline_reason: reason })
    .eq('id', bookingId)
    .eq('mentor_id', user.id)
    .select()
    .single();
  if (error) throw error;
  await supabase.from('notifications').insert({
    user_id: data.student_id,
    type: 'booking_declined',
    title: 'Booking declined',
    description: reason,
    data: { booking_id: bookingId },
  });
  revalidatePath('/mentor/bookings');
  return data;
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .select()
    .single();
  if (error) throw error;
  const otherParty = data.student_id === user.id ? data.mentor_id : data.student_id;
  await supabase.from('notifications').insert({
    user_id: otherParty,
    type: 'booking_cancelled',
    title: 'Session cancelled',
    description: `${data.scheduled_date} at ${data.scheduled_time}`,
    data: { booking_id: bookingId },
  });
  revalidatePath('/my-sessions');
  revalidatePath('/mentor/bookings');
}
