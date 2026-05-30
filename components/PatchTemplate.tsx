import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { PatchRow } from "@/types/patch";

const HEADER_COLUMNS = [
  { key: "Pcs" as const, label: "Pcs", width: "8%" },
  { key: "UNI" as const, label: "UNI", width: "8%" },
  { key: "ID" as const, label: "ID", width: "8%" },
  { key: "Position" as const, label: "Position", width: "26%" },
  { key: "Addresses" as const, label: "Addresses", width: "26%" },
  { key: "MODE" as const, label: "MODE", width: "12%" },
  { key: "Total" as const, label: "Total", width: "12%" },
];

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  groupHeader: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#1a1a2e",
    color: "#ffffff",
    padding: 6,
    marginTop: 10,
    marginBottom: 0,
  },
  tableHeader: {
    flexDirection: "row" as const,
    backgroundColor: "#e8e8e8",
    borderBottomWidth: 1,
    borderBottomColor: "#999",
  },
  tableHeaderCell: {
    padding: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row" as const,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  tableRowAlt: {
    flexDirection: "row" as const,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  tableCell: {
    padding: 4,
    fontSize: 8,
  },
  footer: {
    position: "absolute" as const,
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    fontSize: 7,
    color: "#888",
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    paddingTop: 6,
  },
  pageNumber: {
    fontSize: 7,
    color: "#888",
  },
});

/**
 * Group PatchRows by the Fixture column value.
 */
function groupByFixture(data: PatchRow[]): Map<string, PatchRow[]> {
  const groups = new Map<string, PatchRow[]>();
  for (const row of data) {
    const fixture = row.Fixture || "Tuntematon";
    if (!groups.has(fixture)) {
      groups.set(fixture, []);
    }
    groups.get(fixture)!.push(row);
  }
  return groups;
}

interface PatchTemplateProps {
  data: PatchRow[];
  eventName?: string;
  date?: string;
}

export default function PatchTemplate({
  data,
  eventName = "PATCH",
  date,
}: PatchTemplateProps) {
  const groups = groupByFixture(data);
  const displayDate = date || new Date().toLocaleDateString("fi-FI");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>
          PATCH — {eventName}
        </Text>
        <Text style={styles.subtitle}>{displayDate}</Text>

        {/* Fixture groups */}
        {Array.from(groups.entries()).map(([fixture, rows]) => (
          <View key={fixture} wrap={false}>
            {/* Group header */}
            <Text style={styles.groupHeader}>{fixture}</Text>

            {/* Table header */}
            <View style={styles.tableHeader}>
              {HEADER_COLUMNS.map((col) => (
                <Text
                  key={col.key}
                  style={[styles.tableHeaderCell, { width: col.width }]}
                >
                  {col.label}
                </Text>
              ))}
            </View>

            {/* Table rows */}
            {rows.map((row, i) => (
              <View
                key={i}
                style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                {HEADER_COLUMNS.map((col) => (
                  <Text
                    key={col.key}
                    style={[styles.tableCell, { width: col.width }]}
                  >
                    {row[col.key]}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Patch Generator — {eventName}</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Sivu ${pageNumber} / ${totalPages}`
            }
          />
          <Text>{displayDate}</Text>
        </View>
      </Page>
    </Document>
  );
}
