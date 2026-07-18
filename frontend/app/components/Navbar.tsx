"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "next-themes";
import BoomLogo from "./BoomLogo";
import styles from "../styles/login.module.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <header className={styles.topbar}>
      <div className={styles.logo}>
        <BoomLogo />
      </div>

      <nav className={styles.navLinks}>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </nav>

      <div className={styles.menuWrap}>
        <button
          className={`${styles.bubble} ${menuOpen ? styles.popped : ""}`}
          aria-label="Menu"
          onClick={() => setMenuOpen((v) => !v)}
        />

        {menuOpen && (
          <div className={styles.settingsPanel}>
            <p className={styles.settingsTitle}>Settings</p>

            <div className={styles.themeToggle}>
              <button
                className={theme === "light" ? styles.active : ""}
                onClick={() => {
                  setTheme("light");
                  setMenuOpen(false);
                }}
              >
                ☀️ Light Mode
              </button>

              <button
                className={theme === "dark" ? styles.active : ""}
                onClick={() => {
                  setTheme("dark");
                  setMenuOpen(false);
                }}
              >
                🌙 Dark Mode
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
