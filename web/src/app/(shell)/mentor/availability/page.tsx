'use client';

import { useState } from 'react';
import { Icon } from '@/components/primitives';
import { MENTOR_USER, DAY_KEYS, TIMES_OF_DAY, type DayKey, type DaySchedule } from '@/lib/mentor-data';
import { toast } from '@/lib/toast';

const selectStyle: React.CSSProperties = {
  flex: 1, height: 34, padding: '0 10px', borderRadius: 8,
  border: '1px solid var(--border-default)', fontSize: 12,
  background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none',
};

function AvailabilityGrid({ days, onChange }: {
  days: Record<DayKey, DaySchedule>;
  onChange: (next: Record<DayKey, DaySchedule>) => void;
}) {
  const toggleDay = (d: DayKey) => {
    const day = days[d];
    onChange({
      ...days,
      [d]: {
        on: !day.on,
        slots: !day.on && day.slots.length === 0 ? [['9:00 AM', '5:00 PM']] : day.slots,
      },
    });
  };
  const setSlot = (d: DayKey, i: number, k: 0 | 1, v: string) => {
    const slots = days[d].slots.map((s, idx) => idx === i ? (k === 0 ? [v, s[1]] as [string, string] : [s[0], v] as [string, string]) : s);
    onChange({ ...days, [d]: { ...days[d], slots } });
  };
  const addSlot = (d: DayKey) => onChange({ ...days, [d]: { ...days[d], slots: [...days[d].slots, ['10:00 AM', '12:00 PM']] } });
  const rmSlot = (d: DayKey, i: number) => onChange({ ...days, [d]: { ...days[d], slots: days[d].slots.filter((_, k) => k !== i) } });

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, marginBottom: 18 }}>
        {DAY_KEYS.map(d => {
          const on = days[d].on;
          return (
            <div key={d} style={{
              background: on ? 'rgba(79,70,229,0.06)' : 'var(--bg-hover)',
              border: `1px solid ${on ? 'rgba(79,70,229,0.30)' : 'var(--border-subtle)'}`,
              borderRadius: 12, padding: 10, textAlign: 'center', transition: 'all 200ms',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: on ? 'var(--brand-600)' : 'var(--text-tertiary)', marginBottom: 8, letterSpacing: '0.05em' }}>{d.toUpperCase()}</div>
              <button
                onClick={() => toggleDay(d)}
                style={{
                  width: '100%', height: 24, borderRadius: 999, fontSize: 10, fontWeight: 700,
                  background: on ? 'var(--gradient-brand)' : 'var(--bg-surface)',
                  color: on ? '#fff' : 'var(--text-tertiary)',
                  border: on ? 'none' : '1px solid var(--border-default)',
                  cursor: 'pointer',
                }}
              >{on ? 'ON' : 'OFF'}</button>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DAY_KEYS.filter(d => days[d].on).map(d => (
          <div key={d} style={{ padding: 12, background: 'var(--bg-hover)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{d}</div>
            {days[d].slots.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <select value={s[0]} onChange={e => setSlot(d, i, 0, e.target.value)} style={selectStyle}>
                  {TIMES_OF_DAY.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <select value={s[1]} onChange={e => setSlot(d, i, 1, e.target.value)} style={selectStyle}>
                  {TIMES_OF_DAY.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => rmSlot(d, i)} style={{ width: 28, height: 28, color: 'var(--text-tertiary)', borderRadius: 6, background: 'transparent' }}>
                  <Icon name="x" size={12} />
                </button>
              </div>
            ))}
            <button onClick={() => addSlot(d)} style={{ fontSize: 12, color: 'var(--brand-500)', fontWeight: 600, marginTop: 4, background: 'transparent' }}>+ Add slot</button>
          </div>
        ))}
      </div>
    </>
  );
}

function Segmented<T extends string | number>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div style={{ display: 'inline-flex', background: 'var(--bg-hover)', border: '1px solid var(--border-default)', borderRadius: 10, padding: 3, gap: 2 }}>
      {options.map(o => {
        const active = value === o;
        return (
          <button
            key={String(o)}
            onClick={() => onChange(o)}
            style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: active ? 'var(--gradient-brand)' : 'transparent',
              color: active ? '#fff' : 'var(--text-secondary)',
              transition: 'all 180ms',
            }}
          >{o}</button>
        );
      })}
    </div>
  );
}

export default function MentorAvailabilityPage() {
  type Draft = {
    days: Record<DayKey, DaySchedule>;
    buffer: number;
    window: string;
    blockedDates: string[];
    timezone: string;
  };
  const initial: Draft = {
    days: JSON.parse(JSON.stringify(MENTOR_USER.days)) as Record<DayKey, DaySchedule>,
    buffer: MENTOR_USER.buffer,
    window: MENTOR_USER.advanceBookingWindow,
    blockedDates: [...MENTOR_USER.blockedDates],
    timezone: MENTOR_USER.timezone,
  };
  const [draft, setDraft] = useState<Draft>(initial);
  const [saved, setSaved] = useState<Draft>(initial);
  const [saving, setSaving] = useState(false);
  const [newDate, setNewDate] = useState('');
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const onSave = () => {
    setSaving(true);
    setTimeout(() => { setSaved(draft); setSaving(false); toast('Availability updated ✓'); }, 600);
  };
  const onDiscard = () => setDraft(saved);
  const addBlockedDate = () => {
    if (!newDate || draft.blockedDates.includes(newDate)) return;
    setDraft(d => ({ ...d, blockedDates: [...d.blockedDates, newDate].sort() }));
    setNewDate('');
  };
  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 40px 140px' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 36, margin: '0 0 8px' }}>Your Availability</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>Set when you&apos;re open for bookings. Block specific dates under Exceptions.</p>

      {/* Weekly schedule */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 28, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontWeight: 600, fontSize: 16, margin: 0 }}>Weekly Schedule</h3>
          <select
            value={draft.timezone}
            onChange={e => setDraft(d => ({ ...d, timezone: e.target.value }))}
            style={{ height: 36, padding: '0 12px', borderRadius: 10, border: '1px solid var(--border-default)', fontSize: 13, background: 'var(--bg-hover)', color: 'var(--text-primary)', outline: 'none' }}
          >
            {['IST (UTC+5:30)', 'PST (UTC-8)', 'EST (UTC-5)', 'GMT (UTC)', 'SGT (UTC+8)'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <AvailabilityGrid days={draft.days} onChange={days => setDraft(d => ({ ...d, days }))} />
      </div>

      {/* Settings */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 24, marginBottom: 18 }}>
        <h3 style={{ fontWeight: 600, fontSize: 16, margin: '0 0 16px' }}>Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, alignItems: 'center', rowGap: 14 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Buffer between sessions</div>
          <div><Segmented value={draft.buffer} options={[0, 15, 30]} onChange={v => setDraft(d => ({ ...d, buffer: v }))} /></div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Advance booking window</div>
          <div><Segmented value={draft.window} options={['1 week', '2 weeks', '1 month', '3 months']} onChange={v => setDraft(d => ({ ...d, window: v }))} /></div>
        </div>
      </div>

      {/* Blocked dates */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 24 }}>
        <h3 style={{ fontWeight: 600, fontSize: 16, margin: '0 0 4px' }}>Exceptions / Blocked dates</h3>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '0 0 14px' }}>Dates you can&apos;t take bookings (vacations, holidays, conferences)</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            style={{ padding: '8px 12px', background: 'var(--bg-hover)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)' }}
          />
          <button onClick={addBlockedDate} style={{ height: 36, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>+ Add</button>
        </div>
        {draft.blockedDates.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No blocked dates</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {draft.blockedDates.map(d => (
              <span key={d} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 12 }}>
                {fmtDate(d)}
                <button
                  onClick={() => setDraft(dd => ({ ...dd, blockedDates: dd.blockedDates.filter(x => x !== d) }))}
                  style={{ background: 'transparent', color: 'var(--text-tertiary)', padding: 0, fontSize: 14, lineHeight: 1 }}
                >×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sticky save bar */}
      {dirty && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 80,
          background: 'var(--bg-surface)', borderTop: '1px solid var(--border-default)',
          boxShadow: '0 -8px 24px rgba(14,18,40,0.08)',
          padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Unsaved changes to your schedule</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onDiscard} style={{ height: 38, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Discard</button>
            <button
              onClick={onSave}
              disabled={saving}
              style={{ height: 38, padding: '0 18px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600, opacity: saving ? 0.7 : 1 }}
            >{saving ? 'Saving…' : 'Save Schedule'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
