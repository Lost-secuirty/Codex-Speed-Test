import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadJSON, removeKey, saveJSON } from '../../src/lib/storage';

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
