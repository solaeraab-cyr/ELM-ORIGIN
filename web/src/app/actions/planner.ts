'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type PlannerTask = {
  id: string;
  title: string;
  due_date: string;
  due_time: string | null;
  is_complete: boolean;
};

export async function listTasksForDate(date: string): Promise<PlannerTask[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('planner_tasks')
    .select('id, title, due_date, due_time, is_complete')
    .eq('user_id', user.id)
    .eq('due_date', date)
    .order('due_time', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

  return (data ?? []) as PlannerTask[];
}

export async function addTask(input: { title: string; due_date: string; due_time: string | null }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const title = input.title.trim();
  if (!title) throw new Error('Title is required');

  const { data, error } = await supabase
    .from('planner_tasks')
    .insert({
      user_id: user.id,
      title,
      due_date: input.due_date,
      due_time: input.due_time || null,
    })
    .select('id, title, due_date, due_time, is_complete')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/productivity');
  return data as PlannerTask;
}

export async function toggleTaskComplete(id: string, is_complete: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { error } = await supabase
    .from('planner_tasks')
    .update({ is_complete })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/productivity');
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { error } = await supabase
    .from('planner_tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/productivity');
}
