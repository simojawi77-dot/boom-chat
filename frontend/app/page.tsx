"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";

type Theme = "light" | "dark";

export default function Page() {
  const [theme, setTheme] = useState<Theme>("dark");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme === "dark" ? "var(--bg-dark)" : "var(--bg-light)",
      }}
    >
      <Navbar
        theme={theme}
        setTheme={setTheme}
      />

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 4rem)",
            marginBottom: "1rem",
          }}
        >
          Welcome to Boom
        </h1>

        <p
          style={{
            maxWidth: "600px",
            opacity: 0.8,
          }}
        >
          Buy and sell gaming accounts securely.
        </p>
      </section>
    </main>
  );
}
