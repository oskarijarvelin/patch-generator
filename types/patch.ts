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

/**
 * Columns displayed in the patch table and PDF output.
 */
export const PATCH_COLUMNS = [
  "Fixture",
  "Pcs",
  "UNI",
  "ID",
  "Position",
  "Addresses",
  "MODE",
  "Total",
] as const;

export type PatchColumnName = (typeof PATCH_COLUMNS)[number];

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

/** Transformed row used for display and PDF generation. */
export interface PatchRow {
  Fixture: string;
  Pcs: string;
  UNI: string;
  ID: string;
  Position: string;
  Addresses: string;
  MODE: string;
  Total: string;
}

export interface ParseResult {
  success: true;
  data: PatchRow[];
}

export interface ParseError {
  success: false;
  error: string;
}

export type ParseOutcome = ParseResult | ParseError;
