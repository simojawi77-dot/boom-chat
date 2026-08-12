"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Heart,
  ImagePlus,
  Menu,
  MessageCircle,
  Search,
  Send,
  Users,
} from "lucide-react";
import { cities, type DiscoveryItem, type Post } from "./homeData";
import styles from "./home.module.css";

const Avatar = ({ name }: { name: string }) => (
  <span className={styles.avatar}>
    {name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)}
  </span>
);
export function TopNav({
  searchOpen,
  onToggleSearch,
  searchValue,
  onSearchChange,
  notificationsOpen,
  onToggleNotifications,
  onToggleMenu,
}: {
  searchOpen: boolean;
  onToggleSearch: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  notificationsOpen: boolean;
  onToggleNotifications: () => void;
  onToggleMenu: () => void;
}) {
  return (
    <header className={styles.topbar}>
      <div className={styles.topbarInner}>
        <Link href="#top" className={styles.brand}>
          <span className={styles.logoMark}>B</span>
          <span>
            Boom <em>Chat</em>
          </span>
        </Link>
        <div className={styles.searchWrap}>
          <Search size={18} />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search people, groups, or interests"
            aria-label="Search"
          />
          <button
            type="button"
            onClick={onToggleSearch}
            className={styles.mobileSearch}
            aria-label="Toggle search"
          >
            <Search size={20} />
          </button>
          {searchOpen && (
            <input
              autoFocus
              className={styles.mobileSearchInput}
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search"
            />
          )}
        </div>
        <div className={styles.topActions}>
          <button
            type="button"
            onClick={onToggleNotifications}
            aria-label="Notifications"
          >
            <Bell size={20} />
            <i />
          </button>
          <Link href="#messages" aria-label="Messages">
            <MessageCircle size={20} />
          </Link>
          <button
            type="button"
            onClick={onToggleMenu}
            className={styles.menuButton}
            aria-label="Menu"
          >
            <Menu size={21} />
          </button>
          {notificationsOpen && (
            <div className={styles.notificationMenu}>
              <strong>Notifications</strong>
              <p>New study group invitation from Sara.</p>
              <p>Three people share your interest in programming.</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
export function LocationSelector({
  selectedCity,
  onCityChange,
}: {
  selectedCity: string;
  onCityChange: (city: string) => void;
}) {
  return (
    <label className={styles.location}>
      <span>Location</span>
      <select
        value={selectedCity}
        onChange={(event) => onCityChange(event.target.value)}
      >
        {cities.map((city) => (
          <option key={city}>{city}</option>
        ))}
      </select>
      <ChevronDown size={16} />
    </label>
  );
}
export function DiscoveryCard({
  title,
  description,
  icon: Icon,
}: DiscoveryItem) {
  return (
    <article className={styles.discoveryCard}>
      <span>
        <Icon size={21} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </article>
  );
}
export function CreatePostCard() {
  return (
    <section className={styles.createCard}>
      <div className={styles.createTop}>
        <Avatar name="Boom User" />
        <textarea
          placeholder="What would you like to share with the community?"
          aria-label="Create a post"
        />
      </div>
      <div className={styles.createActions}>
        <button type="button">
          <ImagePlus size={18} />
          Photo
        </button>
        <button type="button">
          <Users size={18} />
          Study group
        </button>
        <button type="button">
          <Send size={18} />
          Activity
        </button>
        <button type="button" className={styles.publish}>
          Publish
        </button>
      </div>
    </section>
  );
}
export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  return (
    <article className={styles.postCard}>
      <header>
        <div className={styles.author}>
          <Avatar name={post.author} />
          <div>
            <h2>{post.author}</h2>
            <p>
              {post.city} · {post.time}
            </p>
          </div>
        </div>
        <span className={styles.category}>{post.category}</span>
      </header>
      <p className={styles.postText}>{post.text}</p>
      <div className={`${styles.postMedia} ${styles[post.tone]}`}>
        <span>{post.category}</span>
      </div>
      <div className={styles.tags}>
        {post.tags.map((tag) => (
          <span key={tag}>#{tag}</span>
        ))}
      </div>
      <footer>
        <button
          type="button"
          onClick={() => setLiked(!liked)}
          aria-pressed={liked}
          className={liked ? styles.liked : ""}
        >
          <Heart size={18} />
          {post.likes + Number(liked)}
        </button>
        <button type="button">
          <MessageCircle size={18} />
          {post.comments}
        </button>
        <button type="button">
          <Send size={18} />
          {post.shares}
        </button>
      </footer>
    </article>
  );
}
export function RightRail() {
  return (
    <aside className={styles.rightRail}>
      <section>
        <h2>Suggested for you</h2>
        {["Yasmine Ait Ali", "Amine Kabbaj", "Nora Bensalem"].map((name) => (
          <div className={styles.suggestion} key={name}>
            <Avatar name={name} />
            <div>
              <strong>{name}</strong>
              <span>Fes · 2 shared interests</span>
            </div>
            <button type="button">Connect</button>
          </div>
        ))}
      </section>
      <section id="messages">
        <h2>Popular groups</h2>
        <div className={styles.group}>
          <strong>Frontend Morocco</strong>
          <span>1,240 members · Technology</span>
        </div>
        <div className={styles.group}>
          <strong>Fes Study Circle</strong>
          <span>356 members · Education</span>
        </div>
      </section>
    </aside>
  );
}
export function MobileBottomNav({ active }: { active: string }) {
  return (
    <nav className={styles.bottomNav}>
      <a className={active === "home" ? styles.active : ""} href="#top">
        Home
      </a>
      <a href="#discover">Discover</a>
      <a href="#activity">Groups</a>
      <a href="#messages">Messages</a>
    </nav>
  );
}
