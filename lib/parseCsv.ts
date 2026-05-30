import Papa from "papaparse";
import { PATCH_COLUMNS, type PatchRow, type ParseOutcome } from "@/types/patch";

/**
 * Validate that the CSV header row contains exactly the expected columns.
 */
function validateColumns(fields: string[]): string | null {
  const trimmed = fields.map((f) => f.trim());

  for (const expected of PATCH_COLUMNS) {
    if (!trimmed.includes(expected)) {
      return `Puuttuva sarake: "${expected}". Odotetut sarakkeet: ${PATCH_COLUMNS.join(", ")}`;
    }
  }

  return null;
}

/**
 * Parse a CSV file and validate its structure against the expected PATCH schema.
 */
export function parseCsvFile(file: File): Promise<ParseOutcome> {
  return new Promise((resolve) => {
    Papa.parse<PatchRow>(file, {
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

        resolve({ success: true, data: results.data });
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
