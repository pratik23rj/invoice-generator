"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { newLineItemId } from "@/lib/defaults";
import { lineAmount } from "@/lib/calculations";
import { formatIndianNumber } from "@/lib/indianNumber";
import { SectionCard } from "@/components/ui/SectionCard";

const cellInput =
  "w-full rounded-md border border-stone-200 bg-white px-2.5 py-2 text-sm text-ink placeholder:text-ink/30 transition-colors focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";

const numCell = `${cellInput} text-right font-mono tabular-nums`;

export function LineItemsTable() {
  const { control, register, formState } = useFormContext<Invoice>();
  const { fields, append, remove } = useFieldArray({ control, name: "lineItems" });
  const liveItems = useWatch({ control, name: "lineItems" });

  const addItem = () =>
    append({ id: newLineItemId(), description: "", hsnSac: undefined, quantity: 1, rate: 0 });

  return (
    <SectionCard
      number="04"
      title="Line items"
      action={
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span className="text-lg leading-none -mt-0.5">+</span>
          <span>Add item</span>
        </button>
      }
    >
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/20">
              <th className="text-left font-mono text-[0.65rem] uppercase tracking-[0.15em] text-ink/50 pb-3 pl-1 w-8">#</th>
              <th className="text-left font-mono text-[0.65rem] uppercase tracking-[0.15em] text-ink/50 pb-3 px-1">Description</th>
              <th className="text-left font-mono text-[0.65rem] uppercase tracking-[0.15em] text-ink/50 pb-3 px-1 w-24">HSN/SAC</th>
              <th className="text-right font-mono text-[0.65rem] uppercase tracking-[0.15em] text-ink/50 pb-3 px-1 w-20">Qty</th>
              <th className="text-right font-mono text-[0.65rem] uppercase tracking-[0.15em] text-ink/50 pb-3 px-1 w-28">Rate ₹</th>
              <th className="text-right font-mono text-[0.65rem] uppercase tracking-[0.15em] text-ink/50 pb-3 px-1 w-28">Amount ₹</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              const row = liveItems?.[index];
              const amount =
                row &&
                typeof row.quantity === "number" &&
                Number.isFinite(row.quantity) &&
                typeof row.rate === "number" &&
                Number.isFinite(row.rate)
                  ? lineAmount(row)
                  : 0;
              const err = formState.errors.lineItems?.[index];
              return (
                <tr
                  key={field.id}
                  className="align-top border-b border-stone-100 last:border-b-0 group"
                >
                  <td className="py-3 pl-1 pr-2 font-mono text-xs text-ink/40">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="py-3 px-1">
                    <input
                      className={cellInput}
                      maxLength={200}
                      placeholder="Service or product"
                      aria-invalid={Boolean(err?.description)}
                      {...register(`lineItems.${index}.description`)}
                    />
                    {err?.description ? (
                      <p className="text-xs text-red-600 mt-1">{err.description.message}</p>
                    ) : null}
                  </td>
                  <td className="py-3 px-1">
                    <input
                      className={`${cellInput} font-mono`}
                      maxLength={10}
                      placeholder="—"
                      {...register(`lineItems.${index}.hsnSac`)}
                    />
                  </td>
                  <td className="py-3 px-1">
                    <input
                      className={numCell}
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.01"
                      max="999999"
                      {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                    />
                    {err?.quantity ? (
                      <p className="text-xs text-red-600 mt-1">{err.quantity.message}</p>
                    ) : null}
                  </td>
                  <td className="py-3 px-1">
                    <input
                      className={numCell}
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      {...register(`lineItems.${index}.rate`, { valueAsNumber: true })}
                    />
                    {err?.rate ? (
                      <p className="text-xs text-red-600 mt-1">{err.rate.message}</p>
                    ) : null}
                  </td>
                  <td className="py-3 px-1 text-right font-mono tabular-nums text-ink">
                    {formatIndianNumber(amount)}
                  </td>
                  <td className="py-3 pl-1 text-right">
                    {fields.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        aria-label={`Remove line ${index + 1}`}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-md text-ink/30 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        <span className="text-lg leading-none">×</span>
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {formState.errors.lineItems?.message ? (
        <p className="text-xs text-red-600">{String(formState.errors.lineItems.message)}</p>
      ) : null}
    </SectionCard>
  );
}
