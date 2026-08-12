"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import styles from "./home.module.css";
import { discoveryCards, posts } from "./homeData";
import { CreatePostCard, DiscoveryCard, LocationSelector, MobileBottomNav, PostCard, RightRail, TopNav } from "./sharedUi";
import AppSidebar from "./components/AppSidebar";

export default function HomePage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Fes");
  const [selectedInterests, setSelectedInterests] = useState(["Programming", "Study"]);
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); setNotificationsOpen(false); setSearchOpen(false); } }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, []);
  const visiblePosts = useMemo(() => { const query = searchQuery.trim().toLowerCase(); return query ? posts.filter((post) => [post.author, post.city, post.category, post.text, ...post.tags].join(" ").toLowerCase().includes(query)) : posts; }, [searchQuery]);
  const toggleInterest = (interest: string) => setSelectedInterests((current) => current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]);
  return <main id="top" className={styles.page}>
    <div className={styles.backgroundGlow} />
    <TopNav searchOpen={searchOpen} onToggleSearch={() => setSearchOpen((value) => !value)} searchValue={searchQuery} onSearchChange={setSearchQuery} notificationsOpen={notificationsOpen} onToggleNotifications={() => setNotificationsOpen((value) => !value)} onToggleMenu={() => setMenuOpen((value) => !value)} />
    {menuOpen && <button type="button" className={styles.drawerBackdrop} onClick={() => setMenuOpen(false)} aria-label="Close menu" />}
    <div className={styles.shell}><div className={styles.grid}>
      <AppSidebar selectedCity={selectedCity} onCityChange={setSelectedCity} selectedInterests={selectedInterests} onToggleInterest={toggleInterest} isOpen={menuOpen} onClose={() => setMenuOpen(false)} isDark={resolvedTheme === "dark"} onToggleTheme={setTheme} />
      <section className={styles.feed} aria-label="Home feed"><header className={styles.feedHeader}><div className={styles.headline}><p className={styles.eyebrow}>Your community, in one place</p><h1>Discover people, groups, and activities you will enjoy.</h1><p>Find your next study partner, join conversations, and meet people who share your interests.</p></div><LocationSelector selectedCity={selectedCity} onCityChange={setSelectedCity} /></header>
      <section id="discover" className={styles.discoveryRow} aria-label="Discover">{discoveryCards.map((card) => <DiscoveryCard key={card.title} {...card} />)}</section><section id="study"><CreatePostCard /></section><section id="activity" className={styles.postList}>{visiblePosts.length ? visiblePosts.map((post) => <PostCard key={post.id} post={post} />) : <p className={styles.emptyState}>No posts match “{searchQuery}”. Try another search.</p>}</section></section>
      <RightRail />
    </div></div><MobileBottomNav active="home" />
  </main>;
}
