"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";
import { parseCsvFile } from "@/lib/parseCsv";
import type { PatchGroup } from "@/types/patch";

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState<PatchGroup[] | null>(null);
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

  const totalFixtures = data
    ? data.reduce((sum, g) => sum + g.totalPcs, 0)
    : 0;

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
                {totalFixtures} valaisinta, {data.length} ryhmää
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Lataa uusi tiedosto
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem("patchData", JSON.stringify(data));
                    if (fileName) {
                      localStorage.setItem("patchFileName", fileName);
                    }
                    router.push("/generate");
                  }}
                  className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Generoi PDF →
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {data.map((group, gi) => (
                <div
                  key={gi}
                  className="overflow-x-auto rounded-lg border border-gray-200"
                >
                  {/* Group header */}
                  <div className="flex items-center gap-4 bg-gray-100 px-4 py-2">
                    <span className="font-semibold text-gray-900">
                      {group.fixture}
                    </span>
                    <span className="text-sm text-gray-600">
                      MODE: {group.mode}
                    </span>
                    <span className="text-sm text-gray-500">
                      {group.totalPcs} pcs / {group.universeCount}{" "}
                      {group.universeCount === 1 ? "universe" : "universes"}
                    </span>
                  </div>

                  {/* Table */}
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">
                          Pcs
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">
                          UNI
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">
                          ID
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">
                          Position
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">
                          Addresses
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {group.rows.map((row, ri) => (
                        <tr key={ri} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-4 py-2 text-gray-600">
                            {row.pcs}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-600">
                            {row.uni}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-600">
                            {row.idRange}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-600">
                            {row.position}
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            {row.addresses}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
