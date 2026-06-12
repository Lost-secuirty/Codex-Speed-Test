// Hand-written declarations for scripts/audit-lib.mjs — the audit scripts
// stay plain .mjs (ported working code, ADR-0002); keep this in sync.

export interface AuditFinding {
  id: string;
  severity: string;
  confidence: string;
}

export interface HistoryEntry {
  ts: string;
  base: string;
  head: string;
  pr?: number | null | undefined;
  findings: AuditFinding[];
  srcNet: number;
  autofixed?: unknown;
}

export declare const CHECK_IDS: readonly string[];

export declare function checkDeviationSection(
  body: string | null | undefined,
): { reason: 'missing' | 'empty' } | null;

export declare function learningsDistillDue(
  text: string | null | undefined,
  limit?: number,
): { lines: number } | null;

export declare function historyLine(entry: HistoryEntry): string;

export declare function hasHead(
  fileText: string | null | undefined,
  headSha: string | null | undefined,
): boolean;
