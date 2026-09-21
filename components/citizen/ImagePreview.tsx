"use client";

import { useRef, useState } from "react";
import { ImageUp, RefreshCw, X } from "lucide-react";

interface ImagePreviewProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

export default function ImagePreview({ file, onChange }: ImagePreviewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(selected: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
    onChange(selected);
  }

  if (file && previewUrl) {
    return (
      <div className="overflow-hidden rounded-xl border border-surface-line bg-surface-raised">
        <div className="relative aspect-[4/3] w-full bg-ink-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview of the uploaded water problem photo"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <p className="truncate text-sm text-ink-700/80">{file.name}</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Replace
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0] ?? null);
      }}
      className={`flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 text-center transition-colors ${
        dragOver
          ? "border-teal-500 bg-teal-50"
          : "border-surface-line bg-surface-sunken hover:border-ink-900/20"
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-card">
        <ImageUp className="h-5 w-5 text-teal-600" strokeWidth={2} />
      </span>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="font-semibold text-ink-900 underline decoration-teal-400 decoration-2 underline-offset-4"
        >
          Upload a photo
        </button>
        <p className="mt-1 text-xs text-ink-700/60">
          Drag and drop, or tap to browse
        </p>
      </div>
      <p className="text-[11px] text-ink-700/45">JPG, JPEG, PNG or WEBP</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
