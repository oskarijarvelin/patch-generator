"use client";

import { useCallback, useState, useRef } from "react";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileSelected, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setFileError(null);
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setFileError("Valitse CSV-tiedosto (.csv).");
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile, disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset so the same file can be selected again
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10
        transition-colors cursor-pointer
        ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-gray-400"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>
      <p className="text-sm text-gray-600">
        <span className="font-semibold text-blue-600">Klikkaa</span> tai vedä ja pudota CSV-tiedosto tähän
      </p>
      <p className="text-xs text-gray-400">
        Tuettu muoto: Capture-ohjelmasta viety .csv-tiedosto
      </p>
      {fileError && (
        <p className="text-sm font-medium text-red-600">{fileError}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />
    </div>
  );
}
