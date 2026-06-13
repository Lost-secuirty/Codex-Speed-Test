// The ONLY module allowed to touch localStorage/sessionStorage — the
// storage-firewall GritQL plugin (biome-plugins/storage-firewall.grit)
// errors on direct access anywhere else, so quota errors, JSON parsing,
// and test stubbing live in one place. This module uses
// `globalThis.localStorage`, the sanctioned escape the rule deliberately
// does not match (see the plugin's SCOPE comment).

const PREFIX = 'cst:';

/** Read a JSON value; any miss, parse error, or storage failure → fallback. */
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = globalThis.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Write a JSON value. Returns false on quota/permission failure — prototypes must tolerate no-persist. */
export function saveJSON(key: string, value: unknown): boolean {
  try {
    globalThis.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Remove a key; storage failures are swallowed (best-effort). */
export function removeKey(key: string): void {
  try {
    globalThis.localStorage.removeItem(PREFIX + key);
  } catch {
    // best-effort: nothing to do when storage is unavailable
  }
}

// --- Durable opt-in wrapper (ADR-0022) -------------------------------------
// For LOAD-BEARING keys only. The browser right-sizing of the slot-lab's
// main+backup+manifest recovery: localStorage is synchronous (no fsync/atomic
// rename to do), so durability here is a schema-version tag + validate-on-read +
// ONE previous-good copy + an OBSERVABLE (never silent) fallback. The silent
// loadJSON/saveJSON above stay the right tool for non-load-bearing keys.
//
// Reserved: ':prev' names the previous-good sibling of a durable key — never use
// a real key ending in ':prev'. Durable records are wrapped ({ v, data }), so a
// durable key is NOT readable via loadJSON and vice-versa (a one-way door).

const PREV_SUFFIX = ':prev';

export interface DurableOptions<T> {
  /** Schema version; a stored record with a different `v` is treated as corrupt. */
  version: number;
  /** Typeguard run on the parsed payload before it is trusted. */
  validate: (value: unknown) => value is T;
  /** Returned when neither the current nor the previous-good copy is usable. */
  fallback: T;
}

interface DurableRecord {
  v: number;
  data: unknown;
}

let durableFallbacks = 0;

/** How many durable reads have fallen back due to corruption (not a clean miss) —
 * the observable signal for the otherwise-silent degrade (ADR-0021 / ADR-0022). */
export function durableFallbackCount(): number {
  return durableFallbacks;
}

function noteFallback(key: string, reason: 'parse' | 'version' | 'invalid'): void {
  durableFallbacks++;
  // Browser code, but stays defensive: a missing dev signal must never crash the
  // play-money UI (the unit project runs in `node`).
  const dev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
  if (dev) console.warn(`[storage] durable read fell back: ${key} (${reason})`);
}

type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: 'parse' | 'version' | 'invalid' };

function parseRecord<T>(raw: string, opts: DurableOptions<T>): ParseResult<T> {
  let record: DurableRecord;
  try {
    record = JSON.parse(raw) as DurableRecord;
  } catch {
    return { ok: false, reason: 'parse' };
  }
  if (record.v !== opts.version) return { ok: false, reason: 'version' };
  if (!opts.validate(record.data)) return { ok: false, reason: 'invalid' };
  return { ok: true, data: record.data };
}

// undefined = "no usable value here". A clean miss does NOT count as a fallback;
// a corrupt candidate notes its reason before returning undefined.
function readCandidate<T>(storageKey: string, key: string, opts: DurableOptions<T>): T | undefined {
  let raw: string | null;
  try {
    raw = globalThis.localStorage.getItem(storageKey);
  } catch {
    return undefined;
  }
  if (raw === null) return undefined;
  const parsed = parseRecord(raw, opts);
  if (parsed.ok) return parsed.data;
  noteFallback(key, parsed.reason);
  return undefined;
}

/** Read a load-bearing value: current → previous-good → fallback, each candidate
 * gated by parse + version + the validator. Never throws. */
export function loadDurable<T>(key: string, opts: DurableOptions<T>): T {
  const currentKey = PREFIX + key;
  const current = readCandidate<T>(currentKey, key, opts);
  if (current !== undefined) return current;
  const prev = readCandidate<T>(currentKey + PREV_SUFFIX, key, opts);
  if (prev !== undefined) return prev;
  return opts.fallback;
}

/** Write a load-bearing value as a versioned record, first promoting the current
 * (still-valid) record to the previous-good sibling. Returns false on quota fail. */
export function saveDurable<T>(key: string, value: T, opts: DurableOptions<T>): boolean {
  const currentKey = PREFIX + key;
  const prevKey = currentKey + PREV_SUFFIX;
  try {
    const existingRaw = globalThis.localStorage.getItem(currentKey);
    if (existingRaw !== null && parseRecord(existingRaw, opts).ok) {
      globalThis.localStorage.setItem(prevKey, existingRaw);
    }
    globalThis.localStorage.setItem(currentKey, JSON.stringify({ v: opts.version, data: value }));
    return true;
  } catch {
    return false;
  }
}
