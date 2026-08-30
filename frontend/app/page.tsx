"use client";

import { useMemo, useState } from "react";
import { Filter, Plus, Sparkles } from "lucide-react";
import { AppNav, CreatePostCard, PostCard, QuickAction, RightRail } from "./sharedUi";
import { posts } from "./homeData";
import styles from "./home.module.css";
import { useCurrentUser } from "./useCurrentUser";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const user = useCurrentUser();
  const name = user?.firstName || user?.displayName || user?.username || "there";
  const visiblePosts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? posts.filter((post) => [post.author, post.city, post.category, post.text, ...post.tags].join(" ").toLowerCase().includes(term)) : posts;
  }, [query]);
  return <main className={styles.page}><AppNav query={query} onQueryChange={setQuery}/><div className={styles.layout}><aside className={styles.sidePanel}><p className={styles.sectionLabel}>Your space</p><h1>Good evening, {name}</h1><p className={styles.muted}>{user?.city ? `Your community in ${user.city} is waiting for you.` : "Find your people, communities, and next plan."}</p><div className={styles.quickActions}><QuickAction href="/messages" icon="message" label="Messages" detail="3 unread"/><QuickAction href="/groups" icon="group" label="Groups" detail="12 communities"/><QuickAction href="/discover" icon="spark" label="Discover" detail="People near you"/></div><a href="/groups" className={styles.outlineButton}><Plus size={17}/> Create a group</a></aside><section className={styles.feed}><header className={styles.feedHeader}><div><p className={styles.sectionLabel}>Community feed</p><h2>What&apos;s happening around you</h2></div><button type="button" className={styles.filterButton}><Filter size={17}/> Filters</button></header><section className={styles.highlight}><Sparkles size={20}/><div><strong>Make today social.</strong><span>Join a group, share an idea, or start a conversation.</span></div><a href="/discover">Explore</a></section><CreatePostCard/><div className={styles.feedTabs}><button type="button" className={styles.activeTab}>For you</button><button type="button">Following</button><button type="button">Groups</button></div><div className={styles.postList}>{visiblePosts.map((post) => <PostCard key={post.id} post={post}/>)}</div></section><RightRail/></div></main>;
}
