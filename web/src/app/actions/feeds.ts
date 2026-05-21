'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// External shape — uses the task spec's field names (body / community_id).
// Internally we read/write the live DB columns (content / visibility /
// like_count / comment_count) and map.
export type FeedPost = {
  id: string;
  author_id: string;
  body: string;
  community_id: string;
  tag: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  author: {
    full_name: string | null;
    handle: string | null;
    plan: string | null;
    is_mentor: boolean | null;
  } | null;
};

type DbRow = {
  id: string;
  author_id: string;
  content: string;
  visibility: string;
  tags: string[] | null;
  like_count: number | null;
  comment_count: number | null;
  created_at: string;
  author: {
    full_name: string | null;
    handle: string | null;
    plan: string | null;
    is_mentor: boolean | null;
  } | null;
};

const SELECT_COLS =
  'id, author_id, content, visibility, tags, like_count, comment_count, created_at, author:profiles!author_id(full_name, handle, plan, is_mentor)';

function mapRow(row: DbRow): FeedPost {
  return {
    id: row.id,
    author_id: row.author_id,
    body: row.content,
    community_id: row.visibility,
    tag: Array.isArray(row.tags) && row.tags.length > 0 ? row.tags[0] : null,
    like_count: row.like_count ?? 0,
    comment_count: row.comment_count ?? 0,
    created_at: row.created_at,
    author: row.author,
  };
}

export async function createPost(input: { body: string; community_id: string }): Promise<FeedPost> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const body = input.body.trim();
  if (!body) throw new Error('Post body required');

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      content: body,
      visibility: input.community_id || 'world',
      tags: [],
    })
    .select(SELECT_COLS)
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/community');
  return mapRow(data as unknown as DbRow);
}

export async function listLatestPosts(opts: { limit?: number; offset?: number } = {}): Promise<FeedPost[]> {
  const { limit = 50, offset = 0 } = opts;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(SELECT_COLS)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[listLatestPosts]', error.message);
    return [];
  }
  return ((data ?? []) as unknown as DbRow[]).map(mapRow);
}

export async function listTrendingPosts(
  opts: { limit?: number; offset?: number; days?: number } = {},
): Promise<FeedPost[]> {
  const { limit = 50, offset = 0, days = 7 } = opts;
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  // PostgREST can't ORDER BY a computed expression, so fetch a wider window
  // sorted by like_count, then rank by (like_count*2 + comment_count) client-side.
  const window = Math.min(500, Math.max(limit * 3, limit + offset + 20));
  const { data, error } = await supabase
    .from('posts')
    .select(SELECT_COLS)
    .gte('created_at', since)
    .order('like_count', { ascending: false })
    .limit(window);

  if (error) {
    console.error('[listTrendingPosts]', error.message);
    return [];
  }

  const ranked = ((data ?? []) as unknown as DbRow[])
    .map(r => ({ r, score: (r.like_count ?? 0) * 2 + (r.comment_count ?? 0) }))
    .sort((a, b) => b.score - a.score);

  return ranked.slice(offset, offset + limit).map(s => mapRow(s.r));
}

export async function listFollowingPosts(
  opts: { limit?: number; offset?: number } = {},
): Promise<FeedPost[]> {
  const { limit = 50, offset = 0 } = opts;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: follows } = await supabase
    .from('follows')
    .select('target_type, target_id')
    .eq('follower_id', user.id);

  const userIds: string[] = [];
  const communityIds: string[] = [];
  for (const f of follows ?? []) {
    if (f.target_type === 'user' || f.target_type === 'mentor') userIds.push(f.target_id);
    else if (f.target_type === 'community') communityIds.push(f.target_id);
  }
  if (userIds.length === 0 && communityIds.length === 0) return [];

  let q = supabase
    .from('posts')
    .select(SELECT_COLS)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const orParts: string[] = [];
  if (userIds.length > 0) orParts.push(`author_id.in.(${userIds.join(',')})`);
  if (communityIds.length > 0) {
    // visibility values are simple text slugs (jee/neet/...) — no quoting needed
    orParts.push(`visibility.in.(${communityIds.join(',')})`);
  }
  q = q.or(orParts.join(','));

  const { data, error } = await q;
  if (error) {
    console.error('[listFollowingPosts]', error.message);
    return [];
  }
  return ((data ?? []) as unknown as DbRow[]).map(mapRow);
}

export async function toggleFollow(input: {
  target_type: 'user' | 'community' | 'mentor';
  target_id: string;
}): Promise<{ following: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('target_type', input.target_type)
    .eq('target_id', input.target_id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('follows').delete().eq('id', existing.id);
    if (error) throw new Error(error.message);
    revalidatePath('/community');
    return { following: false };
  }

  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, target_type: input.target_type, target_id: input.target_id });
  // unique violation = already following from another path; treat as success
  if (error && error.code !== '23505') throw new Error(error.message);
  revalidatePath('/community');
  return { following: true };
}

export async function listFollowedIds(): Promise<{
  users: string[];
  communities: string[];
  mentors: string[];
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { users: [], communities: [], mentors: [] };

  const { data } = await supabase
    .from('follows')
    .select('target_type, target_id')
    .eq('follower_id', user.id);

  const groups = { users: [] as string[], communities: [] as string[], mentors: [] as string[] };
  for (const f of data ?? []) {
    if (f.target_type === 'user') groups.users.push(f.target_id);
    else if (f.target_type === 'community') groups.communities.push(f.target_id);
    else if (f.target_type === 'mentor') groups.mentors.push(f.target_id);
  }
  return groups;
}
