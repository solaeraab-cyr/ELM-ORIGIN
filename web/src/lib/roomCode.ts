// Room codes are derived deterministically from the room's UUID so we don't
// need a dedicated column. Format: ELM-XXXXXX (6 hex chars from the id).
// The same id always yields the same code, and the code maps back to the
// id's leading hex characters for lookup.

const CODE_LEN = 6;

export function roomCode(id: string): string {
  const hex = id.replace(/-/g, '').slice(0, CODE_LEN).toUpperCase();
  return `ELM-${hex}`;
}

// Normalise arbitrary user input ("elm-a3f8c2", "A3F8C2", "ELM A3F8C2") to the
// lowercase hex prefix used to match against a room id. Returns null if there
// aren't enough usable characters.
export function parseRoomCode(input: string): string | null {
  const cleaned = input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const body = cleaned.startsWith('ELM') ? cleaned.slice(3) : cleaned;
  if (body.length < CODE_LEN) return null;
  return body.slice(0, CODE_LEN).toLowerCase();
}

export function roomLink(id: string): string {
  const base =
    (typeof window !== 'undefined' && window.location?.origin) ||
    'https://elm-slrb.vercel.app';
  return `${base}/room/${id}`;
}
