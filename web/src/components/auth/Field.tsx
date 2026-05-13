'use client';

import { useState, type ReactNode } from 'react';
import Icon from '../primitives/Icon';
import type { IconName } from '../primitives/Icon';

interface FieldProps {
  icon?: IconName;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  valid?: boolean;
  rightSlot?: ReactNode;
  autoFocus?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  autoComplete?: string;
  minLength?: number;
}

export default function Field({ icon, type = 'text', value, onChange, placeholder, error, valid, rightSlot, autoFocus, onBlur, name, autoComplete, minLength }: FieldProps) {
  const [focus, setFocus] = useState(false);

  const borderColor = error
    ? 'var(--danger-500)'
    : valid
    ? 'var(--mint-500)'
    : focus
    ? 'var(--brand-500)'
    : 'var(--border-default)';

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        height: 48, padding: '0 14px',
        background: 'var(--bg-surface)',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 12,
        transition: 'border-color 200ms, box-shadow 200ms',
        boxShadow: focus ? `0 0 0 4px ${error ? 'rgba(225,29,72,0.10)' : 'rgba(27,43,142,0.10)'}` : 'none',
      }}>
        {icon && <span style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}><Icon name={icon} size={16} /></span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocus(true)}
          onBlur={(e) => { setFocus(false); onBlur?.(e); }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          minLength={minLength}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Instrument Sans, system-ui' }}
        />
        {valid && <span style={{ color: 'var(--mint-600)', flexShrink: 0 }}><Icon name="check" size={16} strokeWidth={2.5} /></span>}
        {error && <span style={{ color: 'var(--danger-500)', flexShrink: 0 }}><Icon name="x" size={16} strokeWidth={2.5} /></span>}
        {rightSlot}
      </div>
      {error && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--danger-500)' }}>{error}</div>}
    </div>
  );
}
