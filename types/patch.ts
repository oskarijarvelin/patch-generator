/**
 * Columns expected in the Capture CSV export.
 * Only a subset is required — the parser validates these are present.
 */
export const CAPTURE_REQUIRED_COLUMNS = [
  "Fixture",
  "Unit",
  "DMX Universe",
  "DMX Channel",
  "DMX Mode",
  "DMX Channels",
  "Location",
] as const;

/** Raw row from Capture CSV (only the fields we use). */
export interface CaptureRow {
  Fixture: string;
  Unit: string;
  "DMX Universe": string;
  "DMX Channel": string;
  "DMX Mode": string;
  "DMX Channels": string;
  Location: string;
}

/** A single aggregated row within a fixture group (grouped by universe + position). */
export interface PatchGroupRow {
  pcs: number;
  uni: string;
  idRange: string;
  position: string;
  addresses: string;
}

/** A fixture group with aggregated rows and summary info. */
export interface PatchGroup {
  fixture: string;
  mode: string;
  channelCount: string;
  totalPcs: number;
  universeCount: number;
  rows: PatchGroupRow[];
}

export interface ParseResult {
  success: true;
  data: PatchGroup[];
}

export interface ParseError {
  success: false;
  error: string;
}

export type ParseOutcome = ParseResult | ParseError;
