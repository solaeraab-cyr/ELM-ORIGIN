'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type Note = {
  id: string;
  title: string | null;
  body: string;
  updated_at: string;
  created_at: string;
};

export async function listNotes(): Promise<Note[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('notes')
    .select('id, title, body, updated_at, created_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  return (data ?? []) as Note[];
}

export async function createNote(): Promise<Note> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('notes')
    .insert({ user_id: user.id, title: null, body: '' })
    .select('id, title, body, updated_at, created_at')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/productivity');
  return data as Note;
}

export async function updateNote(id: string, patch: { title?: string | null; body?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const fields: { title?: string | null; body?: string; updated_at: string } = {
    updated_at: new Date().toISOString(),
  };
  if (patch.title !== undefined) fields.title = patch.title;
  if (patch.body !== undefined) fields.body = patch.body;

  const { error } = await supabase
    .from('notes')
    .update(fields)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/productivity');
}

export async function deleteNote(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/productivity');
}
