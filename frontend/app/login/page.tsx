"use client";

import { useEffect, useState } from "react";
import styles from "../styles/login.module.css";
import Navbar from "../components/Navbar";

type Theme = "light" | "dark";

const SHARDS = [
  { id: "top", w: 33, h: 48, x: -133, y: -18, tx: 0, ty: -260, tr: 540 },
  { id: "left", w: 60, h: 26, x: -86, y: -58, tx: -300, ty: -60, tr: -420 },
  { id: "right", w: 61, h: 26, x: -152, y: -58, tx: 300, ty: -60, tr: 420 },
  { id: "bottomLeft", w: 31, h: 43, x: -115, y: -79, tx: -220, ty: 220, tr: -360 },
  { id: "bottomRight", w: 32, h: 43, x: -152, y: -79, tx: 220, ty: 220, tr: 360 },
  { id: "boom", w: 115, h: 45, x: -88, y: -112, tx: 0, ty: 320, tr: 180 },
];

export default function LoginPage() {
  const [phase, setPhase] = useState<"idle" | "spin" | "exploded">("idle");
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const animationStart = setTimeout(() => setPhase("spin"), 50);
    const animationEnd = setTimeout(() => setPhase("exploded"), 950);

    return () => {
      clearTimeout(animationStart);
      clearTimeout(animationEnd);
    };
  }, []);

  const accentColor =
    theme === "light"
      ? "var(--accent-light)"
      : "var(--accent-dark)";

  const backgroundColor =
    theme === "light"
      ? "var(--bg-light)"
      : "var(--bg-dark)";

  const textColor =
    theme === "light"
      ? "var(--text-primary-light)"
      : "var(--text-primary-dark)";

  const logoColor =
    theme === "light"
      ? "var(--model-light)"
      : "var(--model-dark)";

  return (
    <div
      className={styles.page}
      style={
        {
          "--accent": accentColor,
          "--bg": backgroundColor,
          "--text-primary": textColor,
          "--model": logoColor,
        } as React.CSSProperties
      }
    >
      <div className={styles.bgGlow} />

      <Navbar
        theme={theme}
        setTheme={setTheme}
      />

      <main className={styles.stage}>
        <div
          className={`${styles.logoGroup} ${
            phase !== "idle" ? styles[phase] : ""
          }`}
        >
          {SHARDS.map((shard) => (
            <span
              key={shard.id}
              className={styles.shard}
              style={
                {
                  width: shard.w,
                  height: shard.h,
                  left: shard.x + 150,
                  top: shard.y + 100,
                  backgroundPosition: `${shard.x}px ${shard.y}px`,
                  "--tx": `${shard.tx}px`,
                  "--ty": `${shard.ty}px`,
                  "--tr": `${shard.tr}deg`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <form
          className={`${styles.card} ${
            phase === "exploded" ? styles.show : ""
          }`}
        >
          <label className={styles.field}>
            <span>Phone Number or Email Address</span>

            <input
              type="text"
              placeholder="name@example.com"
              autoComplete="username"
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>

            <input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            className={styles.submit}
          >
            Sign In
          </button>
        </form>
      </main>

      <footer className="appFooter">
        <a href="/privacy">Privacy Policy</a>

        <span className="dot">•</span>

        <a href="/terms">Terms & Conditions</a>
      </footer>
    </div>
  );
}