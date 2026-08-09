"use client";

import Link from "next/link";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import BoomLogo from "./BoomLogo";
import styles from "../styles/login.module.css";

const subscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const isMounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const isDarkMode = isMounted && resolvedTheme === "dark";

  return (
    <header className={styles.topbar}>
      <div className={styles.logo}>
        <BoomLogo />
      </div>

      <nav className={styles.navLinks}>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </nav>

      <button
        type="button"
        onClick={() => setTheme(isDarkMode ? "light" : "dark")}
        aria-label="Toggle theme"
        disabled={!isMounted}
        className="inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--model)] disabled:cursor-wait disabled:opacity-70"
      >
        <span aria-hidden="true">
          {isDarkMode ? <SunMedium size={16} /> : <MoonStar size={16} />}
        </span>
        <span>{isDarkMode ? "Light mode" : "Dark mode"}</span>
      </button>
    </header>
  );
}
