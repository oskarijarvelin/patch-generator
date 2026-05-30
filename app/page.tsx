"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import { parseCsvFile } from "@/lib/parseCsv";
import type { PatchRow } from "@/types/patch";
import { PATCH_COLUMNS } from "@/types/patch";

export default function Home() {
  const [data, setData] = useState<PatchRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    setData(null);
    setFileName(file.name);

    const result = await parseCsvFile(file);

    if (result.success) {
      setData(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }

  function handleReset() {
    setData(null);
    setError(null);
    setFileName(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Patch Generator</h1>
          <p className="mt-2 text-gray-500">
            Lataa CSV-tiedosto ja generoi PATCH-dokumentti
          </p>
        </header>

        {/* Upload area */}
        <FileUpload onFileSelected={handleFile} disabled={loading} />

        {/* Loading */}
        {loading && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Parsitaan tiedostoa…
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Virhe</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button
              onClick={handleReset}
              className="mt-3 text-sm font-medium text-red-700 underline hover:text-red-900"
            >
              Yritä uudelleen
            </button>
          </div>
        )}

        {/* Data preview */}
        {data && (
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{fileName}</span> —{" "}
                {data.length} riviä ladattu
              </p>
              <button
                onClick={handleReset}
                className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Lataa uusi tiedosto
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {PATCH_COLUMNS.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2 text-left font-semibold text-gray-700"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {PATCH_COLUMNS.map((col) => (
                        <td key={col} className="whitespace-nowrap px-4 py-2 text-gray-600">
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
