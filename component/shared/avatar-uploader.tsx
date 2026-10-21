"use client";

import { Camera } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/component/ui/avatar";

const MAX_MB = 5;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

/** A photo change waiting to be saved with the rest of the form. */
export interface PhotoChange {
  /** New photo to upload. */
  file: File | null;
  /** Remove the current photo. */
  remove: boolean;
}

export const NO_PHOTO_CHANGE: PhotoChange = { file: null, remove: false };

/**
 * Profile photo. With `editable`, shows a camera button and a remove link.
 * A choice is only a preview until the form is saved (the form calls
 * uploadAvatarAction / removeAvatarAction).
 */
export function AvatarUploader({
  name,
  avatar,
  hue,
  editable = false,
  change = NO_PHOTO_CHANGE,
  onChange,
}: {
  name: string;
  /** The saved photo URL, or "". */
  avatar: string;
  hue: number;
  editable?: boolean;
  change?: PhotoChange;
  onChange?: (change: PhotoChange) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Local preview of a picked photo, freed when replaced.
  const preview = useMemo(() => (change.file ? URL.createObjectURL(change.file) : null), [change.file]);
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const pick = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!TYPES.includes(file.type)) return setError("Use a JPG, PNG or WEBP image.");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`The photo must be ${MAX_MB} MB or smaller.`);
    onChange?.({ file, remove: false });
  };

  const showsPhoto = Boolean(change.file) || (Boolean(avatar) && !change.remove);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        {preview ? (
          // A local preview can't go through next/image, so show it directly.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="size-20 rounded-full object-cover" />
        ) : (
          <Avatar name={name || "You"} src={change.remove ? undefined : avatar || undefined} hue={hue} size="xl" />
        )}
        {editable && (
          <>
            <button
              type="button"
              onClick={() => input.current?.click()}
              aria-label={showsPhoto ? "Change photo" : "Upload photo"}
              title={showsPhoto ? "Change photo" : "Upload photo"}
              className="absolute -right-1 -bottom-1 inline-flex size-8 items-center justify-center rounded-full border-2 border-surface bg-primary text-primary-foreground shadow transition-transform hover:scale-105"
            >
              <Camera className="size-4" />
            </button>
            <input
              ref={input}
              type="file"
              accept={TYPES.join(",")}
              className="sr-only"
              onChange={(e) => {
                pick(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </>
        )}
      </div>
      {editable && showsPhoto && (
        <button
          type="button"
          onClick={() => {
            setError(null);
            onChange?.({ file: null, remove: Boolean(avatar) });
          }}
          className="text-xs text-muted-foreground hover:text-danger hover:underline"
        >
          Remove photo
        </button>
      )}
      {error && (
        <p role="alert" className="max-w-40 text-center text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
