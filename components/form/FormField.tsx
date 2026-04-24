"use client";

import type { ReactNode } from "react";
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  children: (props: { id: string; invalid: boolean }) => ReactNode;
  hint?: string;
};

export function FormField<T extends FieldValues>({
  name,
  label,
  required,
  children,
  hint,
}: Props<T>) {
  const {
    formState: { errors },
  } = useFormContext<T>();
  const id = `f-${String(name).replace(/\./g, "-")}`;
  const err = String(name)
    .split(".")
    .reduce<unknown>((acc: any, key) => (acc ? acc[key] : undefined), errors);
  const message =
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: unknown }).message ?? "")
      : "";

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block font-mono text-[0.65rem] uppercase tracking-[0.15em] text-ink/50"
      >
        {label}
        {required ? <span className="text-blue-600 ml-0.5">*</span> : null}
      </label>
      {children({ id, invalid: Boolean(message) })}
      {hint && !message ? <p className="text-xs text-ink/40 italic">{hint}</p> : null}
      {message ? <p className="text-xs text-red-600">{message}</p> : null}
    </div>
  );
}
