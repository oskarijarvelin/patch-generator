import Papa from "papaparse";
import {
  CAPTURE_REQUIRED_COLUMNS,
  type CaptureRow,
  type PatchRow,
  type ParseOutcome,
} from "@/types/patch";

/**
 * Validate that the CSV header row contains the required Capture columns.
 */
function validateColumns(fields: string[]): string | null {
  const trimmed = fields.map((f) => f.trim());

  for (const expected of CAPTURE_REQUIRED_COLUMNS) {
    if (!trimmed.includes(expected)) {
      return `Puuttuva sarake: "${expected}". Tiedoston tulee olla Capture-ohjelmasta viety CSV.`;
    }
  }

  return null;
}

/**
 * Transform a raw Capture CSV row into a PatchRow for display / PDF.
 */
function toPatchRow(raw: CaptureRow): PatchRow {
  return {
    Fixture: raw.Fixture || "",
    Pcs: "1",
    UNI: raw["DMX Universe"] || "",
    ID: raw.Unit || "",
    Position: raw.Location || "",
    Addresses: raw["DMX Channel"] || "",
    MODE: raw["DMX Mode"] || "",
    Total: raw["DMX Channels"] || "",
  };
}

/**
 * Parse a Capture CSV file and transform it into PatchRow[].
 */
export function parseCsvFile(file: File): Promise<ParseOutcome> {
  return new Promise((resolve) => {
    Papa.parse<CaptureRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        // Check for parser-level errors
        if (results.errors.length > 0) {
          const messages = results.errors
            .slice(0, 3)
            .map((e) => e.message)
            .join("; ");
          resolve({ success: false, error: `CSV-parsintavirhe: ${messages}` });
          return;
        }

        // Validate columns
        const fields = results.meta.fields ?? [];
        const columnError = validateColumns(fields);
        if (columnError) {
          resolve({ success: false, error: columnError });
          return;
        }

        if (results.data.length === 0) {
          resolve({
            success: false,
            error: "CSV-tiedosto ei sisällä yhtään datariviä.",
          });
          return;
        }

        const patchRows = results.data.map(toPatchRow);
        resolve({ success: true, data: patchRows });
      },
      error(err) {
        resolve({
          success: false,
          error: `Tiedoston lukeminen epäonnistui: ${err.message}`,
        });
      },
    });
  });
}
