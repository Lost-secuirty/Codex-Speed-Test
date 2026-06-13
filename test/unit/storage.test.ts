import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type DurableOptions,
  durableFallbackCount,
  loadDurable,
  loadJSON,
  removeKey,
  saveDurable,
  saveJSON,
} from '../../src/lib/storage';

// The storage firewall wrapper (src/lib/storage.ts) is the only module
// allowed near localStorage — these tests stub globalThis.localStorage
// and cover the fallback paths the mutation probe targets.

function makeStore(overrides: Partial<Storage> = {}): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    get length() {
      return map.size;
    },
    ...overrides,
  } as Storage;
}

beforeEach(() => {
  vi.stubGlobal('localStorage', makeStore());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('saveJSON / loadJSON round trip', () => {
  it('round-trips structured values under the prefixed key', () => {
    expect(saveJSON('settings', { volume: 0.3, theme: 'neon' })).toBe(true);
    expect(loadJSON('settings', null)).toEqual({ volume: 0.3, theme: 'neon' });
  });

  it('returns the PARSED value, not the raw string', () => {
    saveJSON('count', 42);
    const value = loadJSON<number>('count', 0);
    expect(value).toBe(42);
    expect(typeof value).toBe('number');
  });
});

describe('loadJSON fallbacks', () => {
  it('returns the fallback for a missing key', () => {
    expect(loadJSON('never-written', 'fallback')).toBe('fallback');
  });

  it('returns the fallback for corrupted JSON instead of throwing', () => {
    globalThis.localStorage.setItem('cst:bad', '{not json');
    expect(loadJSON('bad', 'fallback')).toBe('fallback');
  });

  it('returns the fallback when storage itself throws (private mode)', () => {
    vi.stubGlobal(
      'localStorage',
      makeStore({
        getItem: () => {
          throw new Error('denied');
        },
      }),
    );
    expect(loadJSON('anything', 'fallback')).toBe('fallback');
  });
});

describe('saveJSON / removeKey failure tolerance', () => {
  it('reports false on quota errors instead of throwing', () => {
    vi.stubGlobal(
      'localStorage',
      makeStore({
        setItem: () => {
          throw new Error('QuotaExceededError');
        },
      }),
    );
    expect(saveJSON('big', 'x'.repeat(10))).toBe(false);
  });

  it('removeKey deletes the prefixed key and swallows failures', () => {
    saveJSON('gone', 1);
    removeKey('gone');
    expect(loadJSON('gone', 'fallback')).toBe('fallback');
    vi.stubGlobal(
      'localStorage',
      makeStore({
        removeItem: () => {
          throw new Error('denied');
        },
      }),
    );
    expect(() => removeKey('anything')).not.toThrow();
  });
});

describe('durable wrapper', () => {
  interface Settings {
    volume: number;
  }
  const isSettings = (v: unknown): v is Settings =>
    typeof v === 'object' && v !== null && typeof (v as { volume?: unknown }).volume === 'number';
  const opts = (version = 1): DurableOptions<Settings> => ({
    version,
    validate: isSettings,
    fallback: { volume: -1 },
  });

  it('round-trips a versioned record (wrapped { v, data }, not a bare value)', () => {
    expect(saveDurable('cfg', { volume: 0.4 }, opts())).toBe(true);
    expect(loadDurable('cfg', opts())).toEqual({ volume: 0.4 });
    expect(JSON.parse(globalThis.localStorage.getItem('cst:cfg') as string)).toEqual({
      v: 1,
      data: { volume: 0.4 },
    });
  });

  it('promotes the last good value and recovers from it when current corrupts', () => {
    saveDurable('cfg', { volume: 0.1 }, opts());
    saveDurable('cfg', { volume: 0.2 }, opts()); // promotes 0.1 → :prev
    const before = durableFallbackCount();
    globalThis.localStorage.setItem('cst:cfg', '{ broken'); // corrupt current
    expect(loadDurable('cfg', opts())).toEqual({ volume: 0.1 }); // from previous-good
    expect(durableFallbackCount()).toBe(before + 1);
  });

  it('falls through current → previous → default when both copies are corrupt', () => {
    saveDurable('cfg', { volume: 0.1 }, opts());
    saveDurable('cfg', { volume: 0.2 }, opts());
    globalThis.localStorage.setItem('cst:cfg', '{ broken');
    globalThis.localStorage.setItem('cst:cfg:prev', '{ also broken');
    const before = durableFallbackCount();
    expect(loadDurable('cfg', opts())).toEqual({ volume: -1 }); // fallback
    expect(durableFallbackCount()).toBe(before + 2);
  });

  it('rejects a record whose schema version does not match (treated as corrupt)', () => {
    saveDurable('cfg', { volume: 0.3 }, opts(1));
    const before = durableFallbackCount();
    expect(loadDurable('cfg', opts(2))).toEqual({ volume: -1 });
    expect(durableFallbackCount()).toBe(before + 1);
  });

  it('rejects a payload the validator fails (valid JSON, wrong shape)', () => {
    globalThis.localStorage.setItem('cst:cfg', JSON.stringify({ v: 1, data: { volume: 'loud' } }));
    const before = durableFallbackCount();
    expect(loadDurable('cfg', opts())).toEqual({ volume: -1 });
    expect(durableFallbackCount()).toBe(before + 1);
  });

  it('does NOT bump the fallback counter on a clean read or a clean miss', () => {
    const before = durableFallbackCount();
    expect(loadDurable('never-written', opts())).toEqual({ volume: -1 }); // clean miss
    saveDurable('cfg', { volume: 0.5 }, opts());
    expect(loadDurable('cfg', opts())).toEqual({ volume: 0.5 }); // clean hit
    expect(durableFallbackCount()).toBe(before);
  });

  it('saveDurable returns false on quota instead of throwing', () => {
    vi.stubGlobal(
      'localStorage',
      makeStore({
        setItem: () => {
          throw new Error('QuotaExceededError');
        },
      }),
    );
    expect(saveDurable('cfg', { volume: 1 }, opts())).toBe(false);
  });
});
