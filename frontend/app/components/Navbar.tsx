"use client";

import Link from "next/link";
import { useState } from "react";
import BoomLogo from "../components/BoomLogo";
import styles from "../styles/login.module.css";

type Theme = "light" | "dark";

type NavbarProps = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export default function Navbar({
  theme,
  setTheme,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.topbar}>
      <div className="logo">
        <BoomLogo />
      </div>

      <nav className={styles.navLinks}>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </nav>

      <div className={styles.menuWrap}>
        <button
          className={`${styles.bubble} ${
            menuOpen ? styles.popped : ""
          }`}
          aria-label="القائمة"
          onClick={() => setMenuOpen((v) => !v)}
        />

        {menuOpen && (
          <div className={styles.settingsPanel}>
            <p className={styles.settingsTitle}>الإعدادات</p>

            <div className={styles.themeToggle}>
              <button
                className={theme === "light" ? styles.active : ""}
                onClick={() => setTheme("light")}
              >
                الوضع الصباحي
              </button>

              <button
                className={theme === "dark" ? styles.active : ""}
                onClick={() => setTheme("dark")}
              >
                الوضع الداكن
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}