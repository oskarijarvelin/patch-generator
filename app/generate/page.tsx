"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { PatchGroup } from "@/types/patch";

const PdfDownloadButton = dynamic(
  () => import("@/components/PdfDownloadButton"),
  { ssr: false, loading: () => <span className="inline-flex items-center gap-2 rounded-md bg-blue-400 px-5 py-2.5 text-sm font-medium text-white cursor-wait">Ladataan…</span> }
);

export default function GeneratePage() {
  const [data] = useState<PatchGroup[] | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("patchData");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState(() =>
    typeof window !== "undefined"
      ? new Date().toLocaleDateString("fi-FI")
      : ""
  );
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
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

  const totalFixtures = data.reduce((sum, g) => sum + g.totalPcs, 0);

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
                placeholder="esim. Qstock 2026 - Rytmiranta"
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

          <h3 className="mb-3 mt-6 text-sm font-semibold text-gray-700">
            Yhteystiedot (näytetään PDF:n oikeassa yläkulmassa)
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="contactName"
                className="block text-sm font-medium text-gray-700"
              >
                Nimi
              </label>
              <input
                id="contactName"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="contactPhone"
                className="block text-sm font-medium text-gray-700"
              >
                Puhelin
              </label>
              <input
                id="contactPhone"
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="contactEmail"
                className="block text-sm font-medium text-gray-700"
              >
                Sähköposti
              </label>
              <input
                id="contactEmail"
                type="text"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Data preview */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Data ({totalFixtures} valaisinta, {data.length} ryhmää)
          </h2>
          <div className="max-h-72 space-y-3 overflow-auto">
            {data.map((group, gi) => (
              <div key={gi} className="rounded border border-gray-100">
                <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 text-xs">
                  <span className="font-semibold text-gray-800">
                    {group.fixture}
                  </span>
                  <span className="text-gray-500">
                    MODE: {group.mode}
                  </span>
                  <span className="text-gray-400">
                    {group.totalPcs} pcs
                  </span>
                </div>
                <table className="min-w-full divide-y divide-gray-100 text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-1 text-left font-semibold text-gray-600">Pcs</th>
                      <th className="px-3 py-1 text-left font-semibold text-gray-600">UNI</th>
                      <th className="px-3 py-1 text-left font-semibold text-gray-600">ID</th>
                      <th className="px-3 py-1 text-left font-semibold text-gray-600">Position</th>
                      <th className="px-3 py-1 text-left font-semibold text-gray-600">Addresses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {group.rows.map((row, ri) => (
                      <tr key={ri}>
                        <td className="whitespace-nowrap px-3 py-1 text-gray-500">{row.pcs}</td>
                        <td className="whitespace-nowrap px-3 py-1 text-gray-500">{row.uni}</td>
                        <td className="whitespace-nowrap px-3 py-1 text-gray-500">{row.idRange}</td>
                        <td className="whitespace-nowrap px-3 py-1 text-gray-500">{row.position}</td>
                        <td className="px-3 py-1 text-gray-500">{row.addresses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
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
            contactName={contactName}
            contactPhone={contactPhone}
            contactEmail={contactEmail}
          />
        </div>
      </div>
    </div>
  );
}
