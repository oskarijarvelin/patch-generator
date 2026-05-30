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
