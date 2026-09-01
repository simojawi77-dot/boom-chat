"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AppNav } from "../sharedUi";
import styles from "../home.module.css";

export default function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const dark = mounted && resolvedTheme === "dark";

  return (
    <main className={styles.page}>
      <AppNav />
      <section className={styles.routePage}>
        <p className={styles.sectionLabel}>Preferences</p>
        <h1>Settings</h1>
        <p>Choose the appearance that feels best for you.</p>
        <div className={styles.routeCard}>
          <h2>Appearance</h2>
          <p>Theme preference is saved on this device.</p>
          <button
            className={styles.themeOption}
            onClick={() => setTheme(dark ? "light" : "dark")}
            disabled={!mounted}
          >
            {dark ? <SunMedium size={19} /> : <MoonStar size={19} />}
            {dark ? "Switch to light mode" : "Switch to dark mode"}
          </button>
        </div>
      </section>
    </main>
  );
}
