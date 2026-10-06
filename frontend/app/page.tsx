"use client";

import { Filter, ImagePlus, Plus, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";
import BoomLogo from "./components/BoomLogo";
import { AppNav, PostCard } from "./sharedUi";
import { createPost, deletePost, fetchPosts, type Post } from "../lib/api";
import styles from "./home.module.css";
import { useCurrentUser } from "./useCurrentUser";

const storyItems = [
  { name: "Your story", tone: "linear-gradient(135deg, #fef3c7, #f9a8d4)" },
  { name: "Sarah", tone: "linear-gradient(135deg, #c7d2fe, #d946ef)" },
  { name: "Adam", tone: "linear-gradient(135deg, #d1fae5, #34d399)" },
  { name: "Lina", tone: "linear-gradient(135deg, #fbcfe8, #fb7185)" },
  { name: "Yousef", tone: "linear-gradient(135deg, #bfdbfe, #8b5cf6)" },
];

const suggestions = [
  { name: "Lina Benali", detail: "2 mutual friends" },
  { name: "Yassine Amrani", detail: "New this week" },
  { name: "Sara El Idrissi", detail: "Shared interest" },
];

const sidebarLinks = [
  { href: "/", label: "Home" },
  { href: "/messages", label: "Messages" },
  { href: "/search", label: "Search" },
  { href: "/discover", label: "Discover" },
  { href: "/menu", label: "Menu" },
];

export default function HomePage() {
  const user = useCurrentUser();
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts()
      .then((response) => setPosts(response.items))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load posts"))
      .finally(() => setLoading(false));
  }, []);

  const name = user?.firstName || user?.displayName || user?.username || "there";

  const visiblePosts = query.trim()
    ? posts.filter((post) => [post.content, post.user?.displayName, post.user?.username, post.user?.city].filter(Boolean).join(" ").toLowerCase().includes(query.trim().toLowerCase()))
    : posts;

  async function publishPost() {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const post = await createPost(content);
      setPosts((current) => [post, ...current]);
      setContent("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not publish post");
    } finally {
      setSubmitting(false);
    }
  }

  async function removePost(id: string) {
    try {
      await deletePost(id);
      setPosts((current) => current.filter((post) => post.id !== id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete post");
    }
  }

  return (
    <main className={styles.page}>
      <AppNav query={query} onQueryChange={setQuery} />

      <div className={styles.appShell}>
        <aside className={styles.desktopSidebar}>
          <div className={styles.sidebarBrand}>
            <BoomLogo className={styles.brandLogo} />
            <h2>Boom Chat</h2>
          </div>

          <nav className={styles.sidebarNav}>
            {sidebarLinks.map(({ href, label }) => (
              <a key={href} href={href} className={`${styles.sidebarNavItem} ${href === "/" ? styles.sidebarNavItemActive : ""}`}>
                {label}
              </a>
            ))}
          </nav>

          <div className={styles.sidebarAccount}>
            <div className={styles.sidebarAccountInfo}>
              <span className={styles.avatar}>{name.slice(0, 2).toUpperCase()}</span>
              <div>
                <strong>{name}</strong>
                <span>Active now</span>
              </div>
            </div>
            <button type="button" className={styles.sidebarAction} aria-label="Open menu">
              <Plus size={16} />
            </button>
          </div>
        </aside>

        <section className={styles.feedColumn}>
          <header className={styles.feedHeader}>
            <div>
              <p className={styles.sectionLabel}>Dashboard</p>
              <h1>Home</h1>
            </div>
            <button type="button" className={styles.filterButton}>
              <Filter size={16} />
              Filter
            </button>
          </header>

          <section className={styles.createCard}>
            <div className={styles.createTopRow}>
              <span className={`${styles.avatar} ${styles.avatarCompact}`}>{(user?.firstName || user?.username || "You").slice(0, 2).toUpperCase()}</span>
              <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="What’s on your mind?" maxLength={5000} />
              <button type="button" className={styles.iconButton} aria-label="Attachment">
                <ImagePlus size={16} />
              </button>
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
              <button type="button" className={styles.publishButton} onClick={publishPost} disabled={submitting || !content.trim()}>
                {submitting ? "Publishing..." : "Publish"}
                <Sparkles size={14} />
              </button>
            </div>
          </section>

          <div className={styles.storyRow}>
            {storyItems.map((story) => (
              <div key={story.name} className={styles.storyCard} style={{ background: story.tone }}>
                <span className={`${styles.avatar} ${styles.storyAvatar}`}>{story.name.slice(0, 2).toUpperCase()}</span>
                <span className={styles.storyName}>{story.name}</span>
              </div>
            ))}
          </div>

          {error && <p role="alert">{error}</p>}
          <div className={styles.feedList}>
            {loading ? <p>Loading posts...</p> : visiblePosts.length === 0 ? <p>No posts yet. Be the first to publish.</p> : visiblePosts.map((post) => (
              <PostCard key={post.id} post={post} onDelete={post.user?.id === user?.id ? () => removePost(post.id) : undefined} />
            ))}
          </div>
        </section>

        <aside className={styles.rightRail}>
          <div className={styles.railCard}>
            <p className={styles.sectionLabel}>Suggested</p>
            <h3>People to meet</h3>
            {suggestions.map((person) => (
              <div key={person.name} className={styles.personRow}>
                <span className={`${styles.avatar} ${styles.avatarCompact}`}>{person.name.slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{person.name}</strong>
                  <small>{person.detail}</small>
                </div>
                <button type="button">Add</button>
              </div>
            ))}
            <a href="/discover" className={styles.inlineLink}>See everyone</a>
          </div>

          <div className={styles.railCard}>
            <p className={styles.sectionLabel}>Trending</p>
            <h3>Explore</h3>
            <div className={styles.topicList}>
              <a href="/discover">#BoomChat</a>
              <a href="/discover">#Travel</a>
              <a href="/discover">#Photography</a>
              <a href="/discover">#Community</a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
