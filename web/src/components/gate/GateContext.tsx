'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import GateModal, { type GateVariant, type GateContextValues } from './GateModal';

interface GateState {
  variant: GateVariant;
  context?: GateContextValues;
}

interface GateContextType {
  openGate: (variant: GateVariant, context?: GateContextValues) => void;
  closeGate: () => void;
}

const Ctx = createContext<GateContextType | null>(null);

export function GateProvider({ children }: { children: ReactNode }) {
  const [gate, setGate] = useState<GateState | null>(null);

  const openGate = useCallback((variant: GateVariant, context?: GateContextValues) => {
    setGate({ variant, context });
  }, []);

  const closeGate = useCallback(() => setGate(null), []);

  return (
    <Ctx.Provider value={{ openGate, closeGate }}>
      {children}
      {gate && <GateModal variant={gate.variant} context={gate.context} onClose={closeGate} />}
    </Ctx.Provider>
  );
}

export function useGate(): GateContextType {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGate must be used inside <GateProvider>');
  return ctx;
}
