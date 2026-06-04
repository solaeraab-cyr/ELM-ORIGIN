'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  RealtimePresenceState,
} from '@supabase/supabase-js';

type PostgresEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface PostgresOpts<Row extends Record<string, unknown> = Record<string, unknown>> {
  channelName: string;
  table: string;
  event?: PostgresEvent;
  filter?: string;
  onChange: (payload: RealtimePostgresChangesPayload<Row>) => void;
  enabled?: boolean;
}

/**
 * Subscribe to INSERT/UPDATE/DELETE on a Postgres table.
 * Channel is torn down on unmount or when `enabled` flips false.
 */
export function useRealtimeTable<Row extends Record<string, unknown> = Record<string, unknown>>({
  channelName, table, event = '*', filter, onChange, enabled = true,
}: PostgresOpts<Row>) {
  const cbRef = useRef(onChange);
  cbRef.current = onChange;

  useEffect(() => {
    if (!enabled) return;
    const supabase = createClient();
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as never,
        { event, schema: 'public', table, filter },
        (payload: RealtimePostgresChangesPayload<Row>) => cbRef.current(payload),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, table, event, filter, enabled]);
}

export interface PresenceOpts<Meta extends Record<string, unknown> = Record<string, unknown>> {
  channelName: string;
  meta: Meta;
  onSync?: (state: RealtimePresenceState<Meta>) => void;
  enabled?: boolean;
}

/**
 * Join a Supabase Realtime presence channel.
 * Automatically tracks `meta` on join and untracks on unmount.
 */
export function useRealtimePresence<Meta extends Record<string, unknown> = Record<string, unknown>>({
  channelName, meta, onSync, enabled = true,
}: PresenceOpts<Meta>) {
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;
  const metaRef = useRef(meta);
  metaRef.current = meta;

  useEffect(() => {
    if (!enabled) return;
    const supabase = createClient();
    const channel = supabase.channel(channelName, { config: { presence: { key: '' } } });

    channel.on('presence', { event: 'sync' }, () => {
      onSyncRef.current?.(channel.presenceState() as RealtimePresenceState<Meta>);
    });

    channel.subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        await channel.track(metaRef.current as unknown as Record<string, unknown>);
      }
    });

    return () => {
      channel.untrack().then(() => supabase.removeChannel(channel));
    };
  }, [channelName, enabled]);
}

export interface BroadcastOpts<Payload = unknown> {
  channelName: string;
  event: string;
  onMessage?: (payload: Payload) => void;
  enabled?: boolean;
}

/**
 * Send / receive ephemeral broadcast events on a Supabase Realtime channel.
 * No DB writes — suitable for high-frequency state (e.g. whiteboard strokes,
 * cursor pointers, marker holder). Returns a `send` function that ignores
 * calls before the channel is subscribed.
 */
export function useRealtimeBroadcast<Payload = unknown>({
  channelName, event, onMessage, enabled = true,
}: BroadcastOpts<Payload>) {
  const cbRef = useRef(onMessage);
  cbRef.current = onMessage;
  const channelRef = useRef<RealtimeChannel | null>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const supabase = createClient();
    const channel = supabase.channel(channelName, { config: { broadcast: { self: false } } });
    channelRef.current = channel;
    readyRef.current = false;

    channel.on('broadcast', { event }, (msg) => {
      cbRef.current?.(msg.payload as Payload);
    });

    channel.subscribe(status => {
      if (status === 'SUBSCRIBED') readyRef.current = true;
    });

    return () => {
      readyRef.current = false;
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [channelName, event, enabled]);

  const send = useCallback((payload: Payload) => {
    const ch = channelRef.current;
    if (!ch || !readyRef.current) return;
    ch.send({ type: 'broadcast', event, payload: payload as Record<string, unknown> });
  }, [event]);

  return { send };
}
