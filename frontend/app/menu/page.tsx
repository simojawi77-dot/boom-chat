"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogIn, LogOut, MapPinned, Palette, Settings, ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { AppNav } from "../sharedUi";
import { clearAuthTokens } from "@/lib/api";
import { useCurrentUser } from "../useCurrentUser";
import styles from "../home.module.css";

const authenticatedLinks = [
  { href: "/profile", label: "Profile / Account", icon: UserRound, description: "Manage your public profile" },
  { href: "/settings", label: "Settings", icon: Settings, description: "Customize your experience" },
  { href: "/map", label: "Map", icon: MapPinned, description: "Explore nearby places" },
  { href: "/messages", label: "Notifications", icon: Bell, description: "Your latest updates" },
  { href: "/menu", label: "Privacy & Safety", icon: ShieldCheck, description: "Keep your account secure" },
];

const anonymousLinks = [
  { href: "/login", label: "Log in", icon: LogIn, description: "Continue your account" },
  { href: "/register", label: "Create account", icon: UserPlus, description: "Join Boom Chat" },
];

export default function MenuPage() {
  const user = useCurrentUser();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const items = user ? authenticatedLinks : anonymousLinks;

  const handleLogout = () => {
    clearAuthTokens();
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <main className={styles.page}>
      <AppNav />
      <section className={styles.routePage}>
        <p className={styles.sectionLabel}>Menu</p>
        <h1>Account & settings</h1>
        <p>
          {user
            ? `Welcome back, ${user.firstName || user.displayName || user.username}.`
            : "Sign in to access your personal space and controls."}
        </p>

        <div className={styles.menuGrid}>
          {items.map(({ href, label, icon: Icon, description }) => (
            <Link key={label} href={href} className={styles.menuCard}>
              <span className={styles.menuIcon}>
                <Icon size={18} />
              </span>
              <div>
                <strong>{label}</strong>
                <small>{description}</small>
              </div>
            </Link>
          ))}

          {user && (
            <>
              <button
                type="button"
                className={styles.menuCard}
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              >
                <span className={styles.menuIcon}>
                  <Palette size={18} />
                </span>
                <div>
                  <strong>Appearance</strong>
                  <small>Switch to {resolvedTheme === "dark" ? "light" : "dark"} mode</small>
                </div>
              </button>

              <button type="button" className={styles.menuCard} onClick={handleLogout}>
                <span className={styles.menuIcon}>
                  <LogOut size={18} />
                </span>
                <div>
                  <strong>Logout</strong>
                  <small>Sign out securely</small>
                </div>
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
