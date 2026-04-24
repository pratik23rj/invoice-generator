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

  const styles =
    variant === "success"
      ? "bg-ink text-paper"
      : "bg-red-600 text-white";
  const iconColor = variant === "success" ? "text-blue-400" : "text-white/70";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl text-sm font-medium animate-in fade-in slide-in-from-bottom-2 ${styles}`}
    >
      <span className={`inline-block h-2 w-2 rounded-full ${iconColor === "text-blue-400" ? "bg-blue-400" : "bg-white/70"}`} aria-hidden />
      <span>{message}</span>
    </div>
  );
}
