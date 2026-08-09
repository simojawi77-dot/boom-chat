"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import { loginUser, storeAuthTokens } from "@/lib/api";

const inputClassName =
  "mt-2 block min-h-12 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-placeholder)] placeholder-shown:focus:border-[var(--accent)] placeholder-shown:focus:ring-3 placeholder-shown:focus:ring-[color:rgba(185,17,236,0.20)] not-placeholder-shown:border-orange-500 not-placeholder-shown:ring-2 not-placeholder-shown:ring-orange-500/15 valid:not-placeholder-shown:border-emerald-500 valid:not-placeholder-shown:ring-emerald-500/15";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const submitLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await loginUser(email, password);
      storeAuthTokens(result);
      toast.success("Login successful");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />
      <div className="flex min-h-[calc(100dvh-4rem)] items-center px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
        <section className="mx-auto w-full max-w-lg">
          <form
            noValidate
            onSubmit={submitLogin}
            className="w-full rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] backdrop-blur-xl transition-colors duration-300 sm:p-7"
          >
            <div className="mb-7 text-center">
              <p className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-purple-500/20">
                Welcome back
              </p>
              <h1 className="mt-5 text-3xl font-black text-[var(--text-primary)] sm:text-4xl">
                Sign in to Boom
              </h1>
              <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[var(--text-secondary)]">
                Continue to your account and pick up where you left off.
              </p>
            </div>

            <div className="space-y-5">
              <label className="block text-sm font-semibold text-[var(--text-primary)]">
                Email Address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="username"
                  required
                  className={inputClassName}
                />
              </label>

              <label className="block text-sm font-semibold text-[var(--text-primary)]">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className={inputClassName}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-7 w-full rounded-2xl bg-[var(--accent)] px-8 py-3 text-base font-black text-white shadow-lg shadow-purple-500/25 transition duration-200 hover:scale-[1.01] hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}