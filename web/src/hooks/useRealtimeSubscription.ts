'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
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
