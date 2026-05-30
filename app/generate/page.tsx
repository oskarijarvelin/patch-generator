"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { PatchRow } from "@/types/patch";
import { PATCH_COLUMNS } from "@/types/patch";

const PdfDownloadButton = dynamic(
  () => import("@/components/PdfDownloadButton"),
  { ssr: false, loading: () => <span className="inline-flex items-center gap-2 rounded-md bg-blue-400 px-5 py-2.5 text-sm font-medium text-white cursor-wait">Ladataan…</span> }
);

export default function GeneratePage() {
  const [data] = useState<PatchRow[] | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("patchData");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [eventName, setEventName] = useState("PATCH");
  const [date, setDate] = useState(() =>
    typeof window !== "undefined"
      ? new Date().toLocaleDateString("fi-FI")
      : ""
  );
  const [fileName] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("patchFileName");
    } catch {
      return null;
    }
  });

  const router = useRouter();

  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">Ei dataa saatavilla.</p>
          <p className="mt-2 text-sm text-gray-400">
            Lataa ensin CSV-tiedosto etusivulla.
          </p>
          <button
            onClick={handleBack}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Takaisin etusivulle
          </button>
        </div>
      </div>
    );
  }

  const pdfFileName = fileName
    ? fileName.replace(/\.csv$/i, "") + "-patch.pdf"
    : "patch.pdf";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Generoi PDF</h1>
          <p className="mt-2 text-gray-500">
            Muokkaa tietoja ja lataa PATCH-dokumentti
          </p>
        </header>

        {/* Settings */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            PDF-asetukset
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="eventName"
                className="block text-sm font-medium text-gray-700"
              >
                Tapahtuman nimi
              </label>
              <input
                id="eventName"
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Päivämäärä
              </label>
              <input
                id="date"
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Data preview */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Data ({data.length} riviä)
          </h2>
          <div className="max-h-64 overflow-auto rounded border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {PATCH_COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-1.5 text-left font-semibold text-gray-600"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.slice(0, 20).map((row, i) => (
                  <tr key={i}>
                    {PATCH_COLUMNS.map((col) => (
                      <td
                        key={col}
                        className="whitespace-nowrap px-3 py-1 text-gray-500"
                      >
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
                {data.length > 20 && (
                  <tr>
                    <td
                      colSpan={PATCH_COLUMNS.length}
                      className="px-3 py-2 text-center text-gray-400"
                    >
                      … ja {data.length - 20} riviä lisää
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            ← Takaisin
          </button>

          <PdfDownloadButton
            data={data}
            eventName={eventName}
            date={date}
            fileName={pdfFileName}
          />
        </div>
      </div>
    </div>
  );
}
