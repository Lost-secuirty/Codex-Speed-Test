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
