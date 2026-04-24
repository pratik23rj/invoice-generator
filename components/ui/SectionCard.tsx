import type { ReactNode } from "react";

type Props = {
  number: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export function SectionCard({ number, title, action, children }: Props) {
  return (
    <section className="bg-white border border-stone-200/70 rounded-2xl p-6 md:p-7 shadow-card transition-shadow hover:shadow-cardHover">
      <header className="flex items-end justify-between gap-3 mb-6 pb-4 border-b border-stone-100">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-ink/40 pb-1">
            {number}
          </span>
          <h2 className="font-display text-[1.75rem] leading-none text-ink">{title}</h2>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
