import Papa from "papaparse";
import {
  CAPTURE_REQUIRED_COLUMNS,
  type CaptureRow,
  type ParseOutcome,
} from "@/types/patch";
import { aggregateCapture } from "@/lib/aggregatePatch";

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
 * Parse a Capture CSV file and aggregate it into PatchGroup[].
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

        const groups = aggregateCapture(results.data);
        resolve({ success: true, data: groups });
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
