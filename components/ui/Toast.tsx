"use client";

import { useEffect } from "react";

type Props = {
  message: string | null;
  variant?: "success" | "error";
  onClose: () => void;
};

export function Toast({ message, variant = "success", onClose }: Props) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  const color =
    variant === "success"
      ? "bg-slate-900 text-white"
      : "bg-red-600 text-white";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 px-4 py-2 rounded-md shadow-lg text-sm ${color}`}
    >
      {message}
    </div>
  );
}
