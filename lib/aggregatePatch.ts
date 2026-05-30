import type { CaptureRow, PatchGroup, PatchGroupRow } from "@/types/patch";

/**
 * Clean up a DMX mode name for display.
 * Strips bracket content and normalises casing.
 */
function formatModeName(raw: string): string {
  // Remove bracket content, e.g. "Shapes [Control=Dual]" → "Shapes"
  const stripped = raw.replace(/\s*\[.*\]/, "").trim();

  // If mode is just "Standard" or "{N} Channel", return empty
  if (/^standard$/i.test(stripped) || /^\d+\s*channel$/i.test(stripped)) {
    return "";
  }

  return stripped.toUpperCase();
}

/**
 * Aggregate an array of raw Capture CSV rows into PatchGroup[].
 *
 * Grouping:
 *  1. Top-level: by Fixture name (preserving CSV order of first appearance)
 *  2. Within each fixture: by (DMX Universe, Location)
 *
 * Each sub-group row shows count, universe letter, ID range, position, and
 * a comma-separated list of DMX start addresses.
 */
export function aggregateCapture(rows: CaptureRow[]): PatchGroup[] {
  // Sort all raw rows by Unit number ascending before any grouping
  const sortedRows = [...rows].sort((a, b) => {
    const aUnit = parseInt(a.Unit, 10) || 0;
    const bUnit = parseInt(b.Unit, 10) || 0;
    return aUnit - bUnit;
  });

  // Group by fixture name, preserving order of first appearance
  const fixtureOrder: string[] = [];
  const byFixture = new Map<string, CaptureRow[]>();

  for (const row of sortedRows) {
    const key = row.Fixture || "Unknown";
    if (!byFixture.has(key)) {
      byFixture.set(key, []);
      fixtureOrder.push(key);
    }
    byFixture.get(key)!.push(row);
  }

  const groups: PatchGroup[] = [];

  for (const fixture of fixtureOrder) {
    const fixtureRows = byFixture.get(fixture)!;

    // Sub-group by DMX Universe + Location
    const subOrder: string[] = [];
    const subGroups = new Map<string, CaptureRow[]>();

    for (const row of fixtureRows) {
      const key = `${row["DMX Universe"]}|${row.Location}`;
      if (!subGroups.has(key)) {
        subGroups.set(key, []);
        subOrder.push(key);
      }
      subGroups.get(key)!.push(row);
    }

    const groupRows: PatchGroupRow[] = [];

    for (const subKey of subOrder) {
      const subRows = subGroups.get(subKey)!;

      // Sort sub-rows by Unit number to ensure correct ID range and address order
      subRows.sort((a, b) => (parseInt(a.Unit, 10) || 0) - (parseInt(b.Unit, 10) || 0));

      const units = subRows
        .map((r) => parseInt(r.Unit, 10))
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b);

      const channels = subRows
        .map((r) => r["DMX Channel"])
        .filter(Boolean);

      const idRange =
        units.length > 1
          ? `${units[0]}-${units[units.length - 1]}`
          : units.length === 1
            ? `${units[0]}`
            : "";

      groupRows.push({
        pcs: subRows.length,
        uni: subRows[0]["DMX Universe"],
        idRange,
        position: subRows[0].Location,
        addresses: channels.join(", "),
      });
    }

    // Sort rows by first unit number
    groupRows.sort((a, b) => {
      const aNum = parseInt(a.idRange, 10) || 0;
      const bNum = parseInt(b.idRange, 10) || 0;
      return aNum - bNum;
    });

    const uniqueUniverses = new Set(fixtureRows.map((r) => r["DMX Universe"]));
    const mode = fixtureRows[0]["DMX Mode"] || "";
    const channelCount = fixtureRows[0]["DMX Channels"] || "";

    const modeName = formatModeName(mode);
    const modeDisplay = modeName
      ? `${modeName}. ${channelCount} ch`
      : `${channelCount} ch`;

    groups.push({
      fixture,
      mode: modeDisplay,
      channelCount,
      totalPcs: fixtureRows.length,
      universeCount: uniqueUniverses.size,
      rows: groupRows,
    });
  }

  // Sort groups by smallest unit number
  groups.sort((a, b) => {
    const aMin = Math.min(
      ...a.rows.map((r) => parseInt(r.idRange, 10) || Infinity)
    );
    const bMin = Math.min(
      ...b.rows.map((r) => parseInt(r.idRange, 10) || Infinity)
    );
    return aMin - bMin;
  });

  return groups;
}
