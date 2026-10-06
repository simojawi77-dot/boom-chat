"use client";

import { MapPinned } from "lucide-react";
import { AppNav } from "../sharedUi";
import styles from "../home.module.css";

export default function MapPage() {
  return (
    <main className={styles.page}>
      <AppNav />
      <section className={styles.routePage}>
        <p className={styles.sectionLabel}>Explore</p>
        <h1>Map</h1>
        <p>Find nearby events, spaces, and communities when this feature is ready.</p>

        <div className={styles.mapCard}>
          <h2>Places near you</h2>
          <div className={styles.mapPlaceholder}>
            <span className={`${styles.mapPoint} ${styles["mapPoint--one"]}`}><MapPinned size={18} /></span>
            <span className={`${styles.mapPoint} ${styles["mapPoint--two"]}`}><MapPinned size={18} /></span>
            <span className={`${styles.mapPoint} ${styles["mapPoint--three"]}`}><MapPinned size={18} /></span>
            <span className={`${styles.mapPoint} ${styles["mapPoint--four"]}`}><MapPinned size={18} /></span>
          </div>
        </div>
      </section>
    </main>
  );
}
