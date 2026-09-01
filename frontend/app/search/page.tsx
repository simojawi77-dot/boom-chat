"use client";

import { useEffect, useState } from "react";
import { AppNav } from "../sharedUi";
import { searchUsers, type DirectoryUser } from "@/lib/api";
import styles from "../home.module.css";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let active = true;

      setUsers([]);
      setCursor(null);
      setError("");

      searchUsers(q, { limit: 50 })
        .then((response) => {
          if (!active) {
            return;
          }

          setUsers(response.items);
          setCursor(response.nextCursor);
        })
        .catch((error: unknown) => {
          if (!active) {
            return;
          }

          setError(error instanceof Error ? error.message : "Search failed");
        });

      return () => {
        active = false;
      };
    }, 250);

    return () => window.clearTimeout(timer);
  }, [q]);

  return (
    <main className={styles.page}>
      <AppNav />
      <section className={styles.routePage}>
        <p className={styles.sectionLabel}>Find your community</p>
        <h1>Search</h1>
        <label className={styles.searchPage}>
          <input
            autoFocus
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search people or cities"
          />
        </label>
        {error ? (
          <p>{error}</p>
        ) : (
          <div className={styles.dataGrid} data-next-cursor={cursor ?? ""}>
            {users.map((user) => (
              <article className={styles.dataCard} key={user.id}>
                <h2>{user.displayName || user.username}</h2>
                <p>{user.city || "City not set"}</p>
                <small>@{user.username}</small>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
