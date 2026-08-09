export const fieldLabelClassName =
  "block text-sm font-semibold text-[var(--text-primary)]";

export const fieldHintClassName =
  "mt-2 text-sm leading-6 text-[var(--text-secondary)]";

export const stepIntroClassName =
  "mx-auto mt-3 max-w-xl text-base leading-7 text-[var(--text-secondary)]";

export const getFieldControlClassName = (hasError?: boolean) =>
  [
    "relative z-10 mt-2 block min-h-12 w-full touch-manipulation rounded-xl border bg-[var(--input-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]",
    "outline-none transition duration-200 placeholder:text-[var(--text-placeholder)]",
    "placeholder-shown:focus:border-[var(--accent)] placeholder-shown:focus:ring-3 placeholder-shown:focus:ring-[color:rgba(185,17,236,0.20)]",
    "not-placeholder-shown:border-orange-500 not-placeholder-shown:ring-2 not-placeholder-shown:ring-orange-500/15",
    "valid:not-placeholder-shown:border-emerald-500 valid:not-placeholder-shown:ring-emerald-500/15",
    hasError ? "border-red-500 ring-3 ring-red-500/15" : "border-[var(--input-border)]",
  ].join(" ");