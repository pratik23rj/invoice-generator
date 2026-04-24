"use client";

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => onCancel();
    el.addEventListener("cancel", handler);
    return () => el.removeEventListener("cancel", handler);
  }, [onCancel]);

  return (
    <dialog
      ref={dialogRef}
      className="rounded-2xl p-0 bg-paper shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-sm"
      aria-labelledby="confirm-title"
    >
      <div className="p-6 max-w-md">
        <p className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-ink/40 mb-2">
          Confirm
        </p>
        <h3 id="confirm-title" className="font-display text-2xl leading-tight text-ink">
          {title}
        </h3>
        <p className="text-sm text-ink/60 mt-3 leading-relaxed">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-ink/60 hover:text-ink transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-full bg-ink text-paper text-sm font-medium hover:bg-ink/90 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
