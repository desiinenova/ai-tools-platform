"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "./Button";

export interface ImageUploadProps {
  label?: string;
  error?: string;
  hint?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  existingImageUrl?: string | null;
}

export function ImageUpload({
  label,
  error,
  hint,
  value,
  onChange,
  existingImageUrl,
}: ImageUploadProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [value]);

  const displayUrl = previewUrl ?? existingImageUrl ?? null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
    // reset so selecting the same file again after removing it still fires onChange
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="flex items-center gap-4">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview / same-origin upload, not worth next/image config here
          <img src={displayUrl} alt="" className="h-20 w-20 rounded-md object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-md bg-gray-100 text-gray-400 dark:bg-gray-800">
            <ImagePlus className="h-6 w-6" aria-hidden />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            {existingImageUrl || value ? "Change image" : "Choose image"}
          </Button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Remove selection
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      {!error && hint && <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}
