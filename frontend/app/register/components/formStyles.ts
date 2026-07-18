export const fieldLabelClassName =
  "block text-sm font-semibold text-[var(--text-primary)]";

export const fieldHintClassName =
  "mt-2 text-sm leading-6 text-[var(--text-secondary)]";

export const stepIntroClassName =
  "mx-auto mt-3 max-w-xl text-base leading-7 text-[var(--text-secondary)]";

export const getFieldControlClassName = (hasError?: boolean) =>
  [
    "mt-2 w-full rounded-2xl border bg-[var(--input-bg)] px-4 py-3 text-base text-[var(--text-primary)]",
    "outline-none transition duration-200 placeholder:text-[var(--text-placeholder)]",
    "focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:rgba(185,17,236,0.16)]",
    hasError ? "border-red-500" : "border-[var(--input-border)]",
  ].join(" ");
