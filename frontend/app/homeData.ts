import type { LucideIcon } from "lucide-react";
import { BookOpen, CalendarDays, Compass, Users } from "lucide-react";
export type DiscoveryItem = { title: string; description: string; icon: LucideIcon };
export type Post = { id: string; author: string; city: string; time: string; category: string; text: string; tags: string[]; likes: number; comments: number; shares: number; tone: "violet" | "gold" | "mint" };
export const cities = ["Fes", "Casablanca", "Rabat", "Marrakech", "Tangier"];
export const interests = ["Programming", "Study", "Sports", "Design", "Gaming"];
export const discoveryCards: DiscoveryItem[] = [{ title: "Meet people nearby", description: "Find people with shared interests in your city.", icon: Compass }, { title: "Join a group", description: "Explore active communities and make plans together.", icon: Users }, { title: "Study together", description: "Build focus sessions and learn with new friends.", icon: BookOpen }, { title: "See what is on", description: "Discover activities happening around you this week.", icon: CalendarDays }];
export const posts: Post[] = [
 { id: "1", author: "Sara El Idrissi", city: "Fes", time: "20 min ago", category: "Study group", text: "Looking for two people to join our JavaScript study group this Thursday. Beginners are very welcome.", tags: ["JavaScript", "Study"], likes: 18, comments: 6, shares: 2, tone: "violet" },
 { id: "2", author: "Omar Zidane", city: "Fes", time: "1 hr ago", category: "Activity", text: "We are playing football on Saturday morning near the university. Send a message if you would like to join us.", tags: ["Football", "Weekend"], likes: 31, comments: 9, shares: 4, tone: "gold" },
 { id: "3", author: "Lina Benali", city: "Rabat", time: "3 hrs ago", category: "Design", text: "I am hosting a relaxed portfolio feedback session this evening. Bring one project and get helpful ideas.", tags: ["Design", "Portfolio"], likes: 24, comments: 8, shares: 3, tone: "mint" },
];
