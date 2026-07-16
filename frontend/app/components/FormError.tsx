"use client";

type Props = {
  message?: string;
};

export default function FormError({ message }: Props) {
  if (!message) return null;

  return (
    <p className="text-danger mt-1">
      {message}
    </p>
  );
}