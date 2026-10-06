"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Compass,
  Heart,
  Home,
  ImagePlus,
  Menu,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import BoomLogo from "./components/BoomLogo";
import { useCurrentUser } from "./useCurrentUser";
import type { Post } from "../lib/api";
import styles from "./home.module.css";

const navigation = [
  { href: "/", label: "Home", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/search", label: "Search", icon: Search },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/menu", label: "Menu", icon: Menu },
];

const Avatar = ({ name, compact = false }: { name: string; compact?: boolean }) => (
  <span className={`${styles.avatar} ${compact ? styles.avatarCompact : ""}`}>
    {name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()}
  </span>
);

export function AppNav({ query, onQueryChange }: { query?: string; onQueryChange?: (value: string) => void }) {
  const user = useCurrentUser();
  const pathname = usePathname();
  const name = user?.firstName || user?.displayName || user?.username || "Guest";
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className={styles.navbar}>
        <div className={styles.navShell}>
          <Link href="/" className={styles.brand} aria-label="Boom Chat home">
            <BoomLogo className={styles.brandLogo} />
            <span className={styles.brandText}>Boom Chat</span>
          </Link>

          <nav className={styles.topNav} aria-label="Main navigation">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.navItem} ${label === "Search" ? styles.navItemCentral : ""} ${active ? styles.navItemActive : ""}`}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className={styles.navTools}>
            {onQueryChange && (
              <label className={styles.navSearch}>
                <Search size={17} />
                <input
                  value={query ?? ""}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Search your community"
                />
              </label>
            )}
            <button type="button" className={styles.iconButton} aria-label="Notifications">
              <Bell size={18} />
            </button>
            <Link href="/menu" className={styles.profileButton} aria-label="Open menu">
              <Avatar name={name} compact />
            </Link>
          </div>
        </div>
      </header>

      <nav className={styles.mobileNav} aria-label="Mobile navigation">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.mobileNavItem} ${active ? styles.mobileNavItemActive : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className={styles.menuTrigger}
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={21} />
      </button>

      <AppSidebar open={open} onClose={() => setOpen(false)} name={name} />
    </>
  );
}

export function AppSidebar({ open, onClose, name }: { open: boolean; onClose: () => void; name: string }) {
  return (
    <>
      <button
        type="button"
        className={`${styles.sidebarOverlay} ${open ? styles.visible : ""}`}
        onClick={onClose}
        aria-label="Close menu"
      />

      <aside className={`${styles.appSidebar} ${open ? styles.sidebarOpen : ""}`}>
        <header className={styles.appSidebarHeader}>
          <div className={styles.appSidebarProfile}>
            <Avatar name={name} compact />
            <div>
              <strong>{name}</strong>
              <small>Online now</small>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </header>

        <nav className={styles.sideNavList}>
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={onClose} className={styles.sideNavLink}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>


      </aside>
    </>
  );
}

export function QuickAction({ href, icon, label, detail }: { href: string; icon: "message" | "group" | "spark"; label: string; detail: string }) {
  const Icon = icon === "message" ? MessageCircle : icon === "group" ? Users : Sparkles;

  return (
    <Link href={href} className={styles.quickAction}>
      <span className={styles.quickActionIcon}>
        <Icon size={18} />
      </span>
      <div>
        <strong>{label}</strong>
        <small>{detail}</small>
      </div>
    </Link>
  );
}

export function CreatePostCard() {
  return (
    <section className={styles.createCard}>
      <div className={styles.createTopRow}>
        <Avatar name="You" compact />
        <textarea placeholder="What’s on your mind?" />
      </div>
      <div className={styles.createFooter}>
        <button type="button">
          <ImagePlus size={16} />
          Photo
        </button>
        <button type="button">
          <Users size={16} />
          Group
        </button>
        <button type="button" className={styles.publishButton}>
          Publish
          <Send size={14} />
        </button>
      </div>
    </section>
  );
}

export function PostCard({ post, onDelete }: { post: Post; onDelete?: () => void }) {
  const [liked, setLiked] = useState(false);
  const author = post.user?.displayName || post.user?.username || "Boom Chat member";

  return (
    <article className={styles.feedCard}>
      <header className={styles.postHeader}>
        <div className={styles.authorMeta}>
          <Avatar name={author} compact />
          <div>
            <strong>{author}</strong>
            <span>
              {post.user?.city || "Community"} · {new Date(post.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        {onDelete && <button type="button" onClick={onDelete}>Delete</button>}
      </header>

      <p className={styles.postText}>{post.content}</p>

      <div className={styles.statsRow}>
        <span>💜 {Number(liked)}</span>
        <span>Comments unavailable</span>
        <span>Shares unavailable</span>
      </div>

      <footer className={styles.postActions}>
        <button type="button" className={liked ? styles.likedButton : ""} onClick={() => setLiked((current) => !current)}>
          <Heart size={16} />
          Like
        </button>
        <button type="button">
          <MessageCircle size={16} />
          Comment
        </button>
        <button type="button">
          <Send size={16} />
          Share
        </button>
      </footer>
    </article>
  );
}

export function RightRail() {
  return (
    <aside className={styles.rightRail}>
      <div className={styles.railCard}>
        <p className={styles.sectionLabel}>Suggested</p>
        <h3>Make a connection</h3>
        {[
          { name: "Lina Benali", detail: "2 shared interests" },
          { name: "Yassine Amrani", detail: "1 mutual friend" },
          { name: "Sara El Idrissi", detail: "3 shared interests" },
        ].map((person) => (
          <div key={person.name} className={styles.personRow}>
            <Avatar name={person.name} compact />
            <div>
              <strong>{person.name}</strong>
              <small>{person.detail}</small>
            </div>
            <button type="button">Add</button>
          </div>
        ))}
        <Link href="/discover" className={styles.inlineLink}>See everyone</Link>
      </div>

      <div className={styles.railCard}>
        <p className={styles.sectionLabel}>Trending</p>
        <h3>Topics to explore</h3>
        <div className={styles.topicList}>
          <Link href="/discover">#BoomChat</Link>
          <Link href="/discover">#Travel</Link>
          <Link href="/discover">#Photography</Link>
        </div>
      </div>
    </aside>
  );
}
