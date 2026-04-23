"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { newLineItemId } from "@/lib/defaults";
import { lineAmount } from "@/lib/calculations";
import { formatIndianNumber } from "@/lib/indianNumber";

const cellInput =
  "w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600";

export function LineItemsTable() {
  const { control, register, formState } = useFormContext<Invoice>();
  const { fields, append, remove } = useFieldArray({ control, name: "lineItems" });
  const liveItems = useWatch({ control, name: "lineItems" });

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Line items</h2>
        <button
          type="button"
          onClick={() =>
            append({ id: newLineItemId(), description: "", hsnSac: undefined, quantity: 1, rate: 0 })
          }
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          + Add item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium pb-2 w-8">#</th>
              <th className="text-left font-medium pb-2">Description</th>
              <th className="text-left font-medium pb-2 w-24">HSN/SAC</th>
              <th className="text-right font-medium pb-2 w-20">Qty</th>
              <th className="text-right font-medium pb-2 w-28">Rate (₹)</th>
              <th className="text-right font-medium pb-2 w-28">Amount (₹)</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              const row = liveItems?.[index];
              const amount =
                row && typeof row.quantity === "number" && typeof row.rate === "number"
                  ? lineAmount(row)
                  : 0;
              const err = formState.errors.lineItems?.[index];
              return (
                <tr key={field.id} className="align-top">
                  <td className="pt-2 pr-2 text-slate-500">{index + 1}</td>
                  <td className="pt-2 pr-2">
                    <input
                      className={cellInput}
                      maxLength={200}
                      aria-invalid={Boolean(err?.description)}
                      {...register(`lineItems.${index}.description`)}
                    />
                    {err?.description ? (
                      <p className="text-xs text-red-600 mt-1">{err.description.message}</p>
                    ) : null}
                  </td>
                  <td className="pt-2 pr-2">
                    <input
                      className={cellInput}
                      maxLength={10}
                      {...register(`lineItems.${index}.hsnSac`)}
                    />
                  </td>
                  <td className="pt-2 pr-2">
                    <input
                      className={`${cellInput} text-right`}
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
                  <td className="pt-2 pr-2">
                    <input
                      className={`${cellInput} text-right`}
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
                  <td className="pt-2 pr-2 text-right tabular-nums">{formatIndianNumber(amount)}</td>
                  <td className="pt-2 text-right">
                    {fields.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        aria-label={`Remove line ${index + 1}`}
                        className="text-slate-400 hover:text-red-600"
                      >
                        ×
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
    </section>
  );
}
