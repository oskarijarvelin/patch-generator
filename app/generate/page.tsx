"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { PatchGroup } from "@/types/patch";

const PdfDownloadButton = dynamic(
  () => import("@/components/PdfDownloadButton"),
  { ssr: false, loading: () => <span className="inline-flex items-center gap-2 rounded-md bg-blue-400 px-5 py-2.5 text-sm font-medium text-white cursor-wait">Ladataan…</span> }
);

export default function GeneratePage() {
  const [data, setData] = useState<PatchGroup[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [fixtureNames, setFixtureNames] = useState<Record<string, string>>({});
  const [pdfOutputName, setPdfOutputName] = useState("");
  const [pdfOutputNameEdited, setPdfOutputNameEdited] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("patchData");
      const parsed: PatchGroup[] | null = stored ? JSON.parse(stored) : null;
      setData(parsed);
      if (parsed) {
        const names: Record<string, string> = {};
        parsed.forEach((g) => { names[g.fixture] = g.fixture; });
        setFixtureNames(names);
      }
    } catch {
      setData(null);
    }
    try {
      setFileName(localStorage.getItem("patchFileName"));
    } catch {
      setFileName(null);
    }
    setDate(new Date().toLocaleDateString("fi-FI"));
    setHydrated(true);
  }, []);

  const router = useRouter();

  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  if (!hydrated) {
    return null;
  }

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

  const pdfFileName = `${pdfOutputName || (eventName ? `Patch - ${eventName}` : "Patch")}.pdf`;

  const totalFixtures = data.reduce((sum, g) => sum + g.totalPcs, 0);

  // Apply custom fixture names
  const displayData = data.map((g) => ({
    ...g,
    fixture: fixtureNames[g.fixture] ?? g.fixture,
  }));

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
                onChange={(e) => {
                  setEventName(e.target.value);
                  if (!pdfOutputNameEdited) {
                    setPdfOutputName(e.target.value ? `Patch - ${e.target.value}` : "Patch");
                  }
                }}
                placeholder="esim. Qstock 2026 - Rytmiranta"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="pdfOutputName"
              className="block text-sm font-medium text-gray-700"
            >
              Tiedostonimi
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="pdfOutputName"
                type="text"
                value={pdfOutputName}
                onChange={(e) => {
                  setPdfOutputName(e.target.value);
                  setPdfOutputNameEdited(true);
                }}
                placeholder="Patch - Tapahtuman nimi"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="shrink-0 text-sm text-gray-400">.pdf</span>
              {pdfOutputNameEdited && (
                <button
                  onClick={() => {
                    setPdfOutputName(eventName ? `Patch - ${eventName}` : "Patch");
                    setPdfOutputNameEdited(false);
                  }}
                  className="shrink-0 text-xs text-gray-400 hover:text-gray-600"
                  title="Palauta automaattinen nimi"
                >
                  ↺
                </button>
              )}
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
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Data preview */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Data ({totalFixtures} valaisinta, {data.length} ryhmää)
          </h2>
          <div className="space-y-4">
            {data.map((group, gi) => (
              <div key={gi} className="rounded border border-gray-200">
                {/* Fixture name editor */}
                <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-3 py-2">
                  <span className="shrink-0 text-xs font-medium text-gray-400">Nimi PDF:ssä:</span>
                  <input
                    type="text"
                    aria-label={`Fixture nimi PDF:ssä: ${group.fixture}`}
                    title={`Fixture nimi PDF:ssä`}
                    value={fixtureNames[group.fixture] ?? group.fixture}
                    onChange={(e) =>
                      setFixtureNames((prev) => ({ ...prev, [group.fixture]: e.target.value }))
                    }
                    className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm font-semibold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {fixtureNames[group.fixture] !== group.fixture && (
                    <button
                      onClick={() =>
                        setFixtureNames((prev) => ({ ...prev, [group.fixture]: group.fixture }))
                      }
                      className="shrink-0 text-xs text-gray-400 hover:text-gray-600"
                      title="Palauta alkuperäinen"
                    >
                      ↺ Palauta
                    </button>
                  )}
                  <span className="shrink-0 text-xs text-gray-400">MODE: {group.mode}</span>
                  <span className="shrink-0 text-xs text-gray-400">{group.totalPcs} pcs</span>
                </div>
                {fixtureNames[group.fixture] !== group.fixture && (
                  <div className="bg-amber-50 px-3 py-1 text-xs text-amber-700">
                    Alkuperäinen: <span className="font-medium">{group.fixture}</span>
                  </div>
                )}
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
            data={displayData}
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
