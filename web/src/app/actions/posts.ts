'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function listPosts(community = 'world', limit = 50) {
  const supabase = await createClient();
  let q = supabase
    .from('posts')
    .select('*, author:profiles!author_id(*)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (community !== 'world') q = q.eq('community', community);
  const { data } = await q;
  return data ?? [];
}

export async function createPost(input: { content: string; community: string; tag?: string | null }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      content: input.content,
      community: input.community,
      tag: input.tag ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath('/community');
  return data;
}

export async function togglePostInteraction(postId: string, type: 'like' | 'repost' | 'bookmark') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const countField = type === 'like' ? 'likes_count' : type === 'repost' ? 'reposts_count' : 'bookmarks_count';
  const { data: existing } = await supabase
    .from('post_interactions')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .eq('type', type)
    .maybeSingle();

  if (existing) {
    await supabase.from('post_interactions').delete().eq('post_id', postId).eq('user_id', user.id).eq('type', type);
    await supabase.rpc('decrement_post_count', { p_id: postId, p_field: countField }).then(
      () => {},
      async () => {
        const { data: p } = await supabase.from('posts').select(countField).eq('id', postId).single();
        await supabase.from('posts').update({ [countField]: Math.max(0, ((p as Record<string, number> | null)?.[countField] ?? 0) - 1) }).eq('id', postId);
      },
    );
    return false;
  }
  await supabase.from('post_interactions').insert({ post_id: postId, user_id: user.id, type });
  await supabase.rpc('increment_post_count', { p_id: postId, p_field: countField }).then(
    () => {},
    async () => {
      const { data: p } = await supabase.from('posts').select(countField).eq('id', postId).single();
      await supabase.from('posts').update({ [countField]: ((p as Record<string, number> | null)?.[countField] ?? 0) + 1 }).eq('id', postId);
    },
  );
  return true;
}

export async function listMyInteractions(postIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || postIds.length === 0) return {} as Record<string, Set<string>>;
  const { data } = await supabase
    .from('post_interactions')
    .select('post_id, type')
    .eq('user_id', user.id)
    .in('post_id', postIds);
  const map: Record<string, Set<string>> = {};
  for (const i of data ?? []) {
    map[i.post_id] = map[i.post_id] || new Set();
    map[i.post_id].add(i.type);
  }
  return map;
}

export async function addComment(postId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { data, error } = await supabase.from('comments').insert({ post_id: postId, author_id: user.id, content }).select().single();
  if (error) throw error;
  await supabase.rpc('increment_post_count', { p_id: postId, p_field: 'replies_count' }).then(() => {}, () => {});
  return data;
}

export async function listComments(postId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('comments')
    .select('*, author:profiles!author_id(*)')
    .eq('post_id', postId)
    .order('created_at');
  return data ?? [];
}
