'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Schema mapping (live DB → legacy UI shape, via PostgREST aliases):
//   visibility         → community (UI used 'world'/'mentors'/etc as community names; now mapped to visibility values)
//   tags (text[])      → tag (UI uses single tag; we take tags[0])
//   like_count         → likes_count
//   comment_count      → replies_count
//   reposts/bookmarks columns do not exist in the live DB.

export async function listPosts(community = 'world', limit = 50) {
  const supabase = await createClient();
  try {
    let q = supabase
      .from('posts')
      .select(
        'id, content, community:visibility, tags, likes_count:like_count, replies_count:comment_count, created_at, author:profiles!author_id(*)'
      )
      .order('created_at', { ascending: false })
      .limit(limit);
    if (community !== 'world') q = q.eq('visibility', community);
    const { data, error } = await q;
    if (error) {
      console.error('[listPosts]', error.message);
      return [];
    }
    return (data ?? []).map((p) => ({
      ...p,
      tag: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags[0] : null,
      reposts_count: 0,
      bookmarks_count: 0,
    }));
  } catch (err) {
    console.error('[listPosts] threw', err);
    return [];
  }
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
      visibility: input.community,
      tags: input.tag ? [input.tag] : [],
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
  // Only 'like' is backed by a real column (like_count); repost/bookmark are no-ops.
  if (type !== 'like') return true;

  const { data: existing } = await supabase
    .from('post_interactions')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .eq('type', type)
    .maybeSingle();

  if (existing) {
    await supabase.from('post_interactions').delete().eq('post_id', postId).eq('user_id', user.id).eq('type', type);
    const { data: p } = await supabase.from('posts').select('like_count').eq('id', postId).single();
    await supabase.from('posts').update({ like_count: Math.max(0, (p?.like_count ?? 0) - 1) }).eq('id', postId);
    return false;
  }
  await supabase.from('post_interactions').insert({ post_id: postId, user_id: user.id, type });
  const { data: p } = await supabase.from('posts').select('like_count').eq('id', postId).single();
  await supabase.from('posts').update({ like_count: (p?.like_count ?? 0) + 1 }).eq('id', postId);
  return true;
}

export async function listMyInteractions(postIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || postIds.length === 0) return {} as Record<string, Set<string>>;
  try {
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
  } catch {
    return {};
  }
}

export async function addComment(postId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { data, error } = await supabase.from('comments').insert({ post_id: postId, author_id: user.id, content }).select().single();
  if (error) throw error;
  const { data: p } = await supabase.from('posts').select('comment_count').eq('id', postId).single();
  await supabase.from('posts').update({ comment_count: (p?.comment_count ?? 0) + 1 }).eq('id', postId);
  return data;
}

export async function listComments(postId: string) {
  const supabase = await createClient();
  try {
    const { data } = await supabase
      .from('comments')
      .select('*, author:profiles!author_id(*)')
      .eq('post_id', postId)
      .order('created_at');
    return data ?? [];
  } catch {
    return [];
  }
}
