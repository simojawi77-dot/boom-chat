"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { RegisterData } from "@/schemas/registerSchema";
import FormError from "../../components/FormError";
import { fieldLabelClassName, getFieldControlClassName, stepIntroClassName } from "../components/formStyles";

const cities = ["Fes", "Marrakech", "Casablanca", "Tangier", "Agadir", "Rabat", "Meknes"];
const genders = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

type SearchableFieldProps = {
  id: "city" | "gender";
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  allowCustomValue?: boolean;
};

function SearchableField({ id, label, placeholder, options, allowCustomValue }: SearchableFieldProps) {
  const { control, setValue, formState: { errors } } = useFormContext<RegisterData>();
  const selectedValue = useWatch({ control, name: id }) ?? "";
  const [query, setQuery] = useState(selectedValue);
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return normalizedQuery ? options.filter((option) => option.label.toLocaleLowerCase().includes(normalizedQuery)) : options;
  }, [options, query]);
  const error = errors[id];

  const choose = (value: string, selectedLabel: string) => {
    setValue(id, value as never, { shouldDirty: true, shouldValidate: true });
    setQuery(selectedLabel);
    setOpen(false);
  };

  return (
    <div>
      <label htmlFor={id} className={fieldLabelClassName}>{label}</label>
      <div className="relative mt-2">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-options`}
          autoComplete="off" required
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setOpen(true);
            if (allowCustomValue) setValue(id, nextQuery as never, { shouldDirty: true, shouldValidate: true });
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "Enter" && matches.length === 1) {
              event.preventDefault();
              choose(matches[0].value, matches[0].label);
            }
          }}
          className={`${getFieldControlClassName(Boolean(error))} mt-0 pr-11`}
        />
        <ChevronDown aria-hidden="true" size={18} className="pointer-events-none absolute right-3 top-1/2 z-20 -translate-y-1/2 text-[var(--text-secondary)]" />
        {open && (
          <ul id={`${id}-options`} role="listbox" className="absolute z-30 mt-2 max-h-48 w-full overflow-y-auto rounded-xl border border-[var(--input-border)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-soft)]">
            {matches.length ? matches.map((option) => (
              <li key={option.value} role="option" aria-selected={selectedValue === option.value}>
                <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option.value, option.label)} className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--model)] hover:text-[var(--accent)]">
                  {option.label}
                </button>
              </li>
            )) : (
              <li className="px-3 py-2 text-sm text-[var(--text-secondary)]">
                {allowCustomValue ? "No match — you can keep typing." : "No matching option."}
              </li>
            )}
          </ul>
        )}
      </div>
      <FormError message={error?.message} />
    </div>
  );
}

export default function Step2() {
  const { register, formState: { errors } } = useFormContext<RegisterData>();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-normal text-[var(--text-primary)] sm:text-4xl">Tell us about you</h1>
        <p className={stepIntroClassName}>Add the basics for your profile.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={fieldLabelClassName}>First Name</label>
          <input type="text" id="firstName" autoComplete="given-name" placeholder="Enter your first name" minLength={3} required className={getFieldControlClassName(Boolean(errors.firstName))} {...register("firstName")} />
          <FormError message={errors.firstName?.message} />
        </div>
        <div>
          <label htmlFor="lastName" className={fieldLabelClassName}>Last Name</label>
          <input type="text" id="lastName" autoComplete="family-name" placeholder="Enter your last name" minLength={3} required className={getFieldControlClassName(Boolean(errors.lastName))} {...register("lastName")} />
          <FormError message={errors.lastName?.message} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <SearchableField id="gender" label="Gender" placeholder="Type or select gender" options={genders} />
        <SearchableField id="city" label="City" placeholder="Type or select a city" options={cities.map((city) => ({ value: city.toLowerCase(), label: city }))} allowCustomValue />
      </div>
    </div>
  );
}