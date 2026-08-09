"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import Navbar from "./components/Navbar";
import {
  ShieldCheck,
  Sparkles,
  Zap,
  Users,
  Lock,
  ArrowRight,
} from "lucide-react";
import { fetchCurrentUser, clearAuthTokens } from "@/lib/api";

const features = [
  {
    icon: ShieldCheck,
    title: "Secure Transactions",
    description:
      "Every trade is protected with escrow-style safeguards and buyer/seller verification.",
  },
  {
    icon: Users,
    title: "Trusted Community",
    description:
      "Join a growing community of verified gamers buying and selling accounts safely.",
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    description:
      "Get your gaming accounts delivered instantly with automated handover.",
  },
  {
    icon: Lock,
    title: "Your Data, Protected",
    description:
      "Bank-level encryption keeps your personal information and credentials safe.",
  },
];

export default function Page() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [user, setUser] = useState<null | {
    id: string;
    username: string;
    email: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    city?: string;
    dateOfBirth?: string;
    phone?: string;
  }>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        setFetchError(null);
      })
      .catch((error) => {
        if (error instanceof Error && /unauthorized/i.test(error.message)) {
          clearAuthTokens();
        }
        setUser(null);
        setFetchError(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const welcomeName = useMemo(() => {
    if (!user) return "Boom";
    return user.displayName || user.firstName || user.username;
  }, [user]);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Decorative background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(circle 720px at 50% 0%, rgba(185,17,236,0.18), transparent 70%)"
            : "radial-gradient(circle 720px at 50% 0%, rgba(185,17,236,0.10), transparent 70%)",
        }}
      />

      <Navbar />

      {/* Hero Section */}
      <section className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--model)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
          <Sparkles size={16} aria-hidden="true" />
          The safe way to trade gaming accounts
        </span>

        <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Buy &amp; Sell Gaming Accounts{" "}
          <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)] bg-clip-text text-transparent">
            Securely
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--text-secondary)]">
          Boom is the trusted marketplace for trading gaming accounts. Discover
          verified sellers, secure payments, and instant delivery — all in one
          place.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          {user ? (
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-8 py-4 text-base font-bold text-white shadow-lg shadow-purple-500/25 transition duration-200 hover:scale-[1.02] hover:shadow-purple-500/40"
            >
              Continue to Dashboard
              <ArrowRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          ) : (
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-8 py-4 text-base font-bold text-white shadow-lg shadow-purple-500/25 transition duration-200 hover:scale-[1.02] hover:shadow-purple-500/40"
            >
              Get Started
              <ArrowRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          )}

          {!user && (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-8 py-4 text-base font-bold text-[var(--text-primary)] transition duration-200 hover:bg-[var(--model)]"
            >
              Sign In
            </Link>
          )}
        </div>
      </section>

      {user ? (
        <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-10 rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[var(--shadow-soft)] transition duration-300">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Welcome back, {welcomeName}.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
              Your account is successfully authenticated. Here are your current
              profile details.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--model)] p-6">
                <p className="text-sm font-semibold text-[var(--text-secondary)]">
                  Username
                </p>
                <p className="mt-2 text-xl font-bold text-[var(--text-primary)]">
                  {user.username}
                </p>
              </div>
              <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--model)] p-6">
                <p className="text-sm font-semibold text-[var(--text-secondary)]">
                  Email
                </p>
                <p className="mt-2 text-xl font-bold text-[var(--text-primary)]">
                  {user.email}
                </p>
              </div>
              {user.firstName && user.lastName && (
                <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--model)] p-6">
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">
                    Full name
                  </p>
                  <p className="mt-2 text-xl font-bold text-[var(--text-primary)]">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              )}
              {user.city && (
                <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--model)] p-6">
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">
                    City
                  </p>
                  <p className="mt-2 text-xl font-bold text-[var(--text-primary)]">
                    {user.city}
                  </p>
                </div>
              )}
              {user.gender && (
                <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--model)] p-6">
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">
                    Gender
                  </p>
                  <p className="mt-2 text-xl font-bold text-[var(--text-primary)]">
                    {user.gender}
                  </p>
                </div>
              )}
              {user.phone && (
                <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--model)] p-6">
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">
                    Phone
                  </p>
                  <p className="mt-2 text-xl font-bold text-[var(--text-primary)]">
                    {user.phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[var(--shadow-soft)] transition duration-300">
            <div className="text-center">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Boom works best when you sign in.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[var(--text-secondary)]">
                Create an account or sign in to view your profile and continue
                trading gaming accounts securely.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Why choose Boom?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[var(--text-secondary)]">
            We built Boom to make trading gaming accounts simple, safe, and
            stress-free.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-[var(--model)] p-3 text-[var(--accent)] transition duration-300 group-hover:scale-110">
                  <Icon size={26} aria-hidden="true" />
                </div>

                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
