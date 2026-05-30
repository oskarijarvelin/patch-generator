"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import PatchTemplate from "@/components/PatchTemplate";
import type { PatchGroup } from "@/types/patch";

interface PdfDownloadButtonProps {
  data: PatchGroup[];
  eventName: string;
  date: string;
  fileName: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export default function PdfDownloadButton({
  data,
  eventName,
  date,
  fileName,
  contactName,
  contactPhone,
  contactEmail,
}: PdfDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={
        <PatchTemplate
          data={data}
          eventName={eventName}
          date={date}
          contactName={contactName}
          contactPhone={contactPhone}
          contactEmail={contactEmail}
        />
      }
      fileName={fileName}
    >
      {({ loading: pdfLoading }) => (
        <span
          className={`inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium text-white ${
            pdfLoading
              ? "cursor-wait bg-blue-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {pdfLoading ? "Luodaan PDF…" : "Lataa PDF"}
        </span>
      )}
    </PDFDownloadLink>
  );
}
