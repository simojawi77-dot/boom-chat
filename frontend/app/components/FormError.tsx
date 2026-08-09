"use client";

type Props = {
  message?: string;
};

export default function FormError({ message }: Props) {
  if (!message) return null;

  return (
    <p className="mt-2 text-sm font-medium text-red-500 animate-[field-error-shake_360ms_ease-in-out]">
      {message}
    </p>
  );
}