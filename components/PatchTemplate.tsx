import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { PatchGroup } from "@/types/patch";

/* ------------------------------------------------------------------ */
/*  Column definitions for the data table                             */
/* ------------------------------------------------------------------ */

const DATA_COLUMNS = [
  { key: "pcs" as const, label: "Pcs", width: "10%" },
  { key: "uni" as const, label: "UNI", width: "10%" },
  { key: "idRange" as const, label: "ID", width: "15%" },
  { key: "position" as const, label: "Position", width: "15%" },
  { key: "addresses" as const, label: "Addresses", width: "50%" },
];

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */

const border = "1pt solid #000";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
  },

  /* Page header */
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateText: {
    fontSize: 9,
    fontStyle: "italic",
  },
  contactBlock: {
    alignItems: "flex-end",
  },
  contactName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  contactDetail: {
    fontSize: 8,
  },

  /* Title */
  title: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 24,
  },

  /* Fixture group */
  groupContainer: {
    marginBottom: 16,
  },

  /* Group header row (fixture name | MODE | Total) */
  groupHeaderRow: {
    flexDirection: "row",
    borderTop: border,
    borderLeft: border,
    borderRight: border,
    borderBottom: border,
  },
  groupHeaderFixture: {
    width: "35%",
    padding: 5,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    borderRight: border,
  },
  groupHeaderMode: {
    width: "30%",
    padding: 5,
    fontSize: 9,
    borderRight: border,
  },
  groupHeaderTotal: {
    width: "35%",
    padding: 5,
    fontSize: 9,
  },

  /* Table header */
  tableHeaderRow: {
    flexDirection: "row",
    borderLeft: border,
    borderRight: border,
    borderBottom: border,
  },
  tableHeaderCell: {
    padding: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    borderRight: border,
  },
  tableHeaderCellLast: {
    padding: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },

  /* Data rows */
  tableRow: {
    flexDirection: "row",
    borderLeft: border,
    borderRight: border,
    borderBottom: border,
  },
  tableCell: {
    padding: 4,
    fontSize: 8,
    borderRight: border,
  },
  tableCellLast: {
    padding: 4,
    fontSize: 8,
  },

  /* Footer */
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#555",
    textAlign: "left",
  },
});

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface PatchTemplateProps {
  data: PatchGroup[];
  eventName?: string;
  date?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export default function PatchTemplate({
  data,
  eventName = "PATCH",
  date,
  contactName,
  contactPhone,
  contactEmail,
}: PatchTemplateProps) {
  const displayDate = date || new Date().toLocaleDateString("fi-FI");
  const hasContact = contactName || contactPhone || contactEmail;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Page header: date left, contact right */}
        <View style={styles.pageHeader} fixed>
          <Text style={styles.dateText}>Updated {displayDate}</Text>
          {hasContact && (
            <View style={styles.contactBlock}>
              {contactName && (
                <Text style={styles.contactName}>{contactName}</Text>
              )}
              {contactPhone && (
                <Text style={styles.contactDetail}>{contactPhone}</Text>
              )}
              {contactEmail && (
                <Text style={styles.contactDetail}>{contactEmail}</Text>
              )}
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title}>PATCH</Text>
        <Text style={styles.subtitle}>{eventName}</Text>

        {/* Fixture groups */}
        {data.map((group, gi) => (
          <View key={gi} style={styles.groupContainer} wrap={false}>
            {/* Group header */}
            <View style={styles.groupHeaderRow}>
              <Text style={styles.groupHeaderFixture}>{group.fixture}</Text>
              <Text style={styles.groupHeaderMode}>
                MODE: {group.mode}
              </Text>
              <Text style={styles.groupHeaderTotal}>
                Total {group.totalPcs} pcs in {group.universeCount}{" "}
                {group.universeCount === 1 ? "universe" : "universes"}
              </Text>
            </View>

            {/* Table header */}
            <View style={styles.tableHeaderRow}>
              {DATA_COLUMNS.map((col, ci) => (
                <Text
                  key={col.key}
                  style={[
                    ci < DATA_COLUMNS.length - 1
                      ? styles.tableHeaderCell
                      : styles.tableHeaderCellLast,
                    { width: col.width },
                  ]}
                >
                  {col.label}
                </Text>
              ))}
            </View>

            {/* Data rows */}
            {group.rows.map((row, ri) => (
              <View key={ri} style={styles.tableRow}>
                {DATA_COLUMNS.map((col, ci) => (
                  <Text
                    key={col.key}
                    style={[
                      ci < DATA_COLUMNS.length - 1
                        ? styles.tableCell
                        : styles.tableCellLast,
                      { width: col.width },
                    ]}
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
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
