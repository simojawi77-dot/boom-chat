"use client";

import { useFormContext, useWatch } from "react-hook-form";
import type { RegisterData } from "@/schemas/registerSchema";
import { stepIntroClassName } from "../components/formStyles";

const reviewItems: {
  label: string;
  value: (data: Partial<RegisterData>) => string;
}[] = [
  {
    label: "Date of Birth",
    value: (data) => data.dateOfBirth || "Not provided",
  },
  {
    label: "Age",
    value: (data) => (typeof data.age === "number" ? `${data.age}` : "Not calculated"),
  },
  {
    label: "Name",
    value: (data) =>
      [data.firstName, data.lastName].filter(Boolean).join(" ") || "Not provided",
  },
  {
    label: "Gender",
    value: (data) => data.gender || "Not provided",
  },
  {
    label: "City",
    value: (data) => data.city || "Not provided",
  },
  {
    label: "Email",
    value: (data) => data.email || "Not provided",
  },
  {
    label: "Phone",
    value: (data) => data.phone || "Not provided",
  },
];

export default function Step6() {
  const { control } = useFormContext<RegisterData>();
  const formData = useWatch({ control });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-normal text-[var(--text-primary)]">
          Review and submit
        </h1>

        <p className={stepIntroClassName}>
          Check your details before creating your account.
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        {reviewItems.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-[var(--border-soft)] bg-[var(--model)] p-4"
          >
            <dt className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
              {item.label}
            </dt>

            <dd className="mt-1 break-words text-base font-semibold text-[var(--text-primary)]">
              {item.value(formData)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
