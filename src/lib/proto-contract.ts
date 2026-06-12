// The window.__proto contract every prototype page exposes — verify.mjs
// walks the index and drives each prototype through exactly this surface.

export interface ProtoState {
  spinning: boolean;
}

export interface ProtoApi {
  ready: boolean;
  spin: () => void;
  state: () => ProtoState;
  playedCues: () => readonly string[];
}

declare global {
  interface Window {
    __proto?: ProtoApi;
  }
}

export function exposeProto(api: ProtoApi): void {
  window.__proto = api;
}
