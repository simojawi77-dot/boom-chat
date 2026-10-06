import type { LucideIcon } from "lucide-react";
import { BookOpen, CalendarDays, Compass, Users } from "lucide-react";
export type DiscoveryItem = { title: string; description: string; icon: LucideIcon };
export const cities = ["Fes", "Casablanca", "Rabat", "Marrakech", "Tangier"];
export const interests = ["Programming", "Study", "Sports", "Design", "Gaming"];
export const discoveryCards: DiscoveryItem[] = [{ title: "Meet people nearby", description: "Find people with shared interests in your city.", icon: Compass }, { title: "Join a group", description: "Explore active communities and make plans together.", icon: Users }, { title: "Study together", description: "Build focus sessions and learn with new friends.", icon: BookOpen }, { title: "See what is on", description: "Discover activities happening around you this week.", icon: CalendarDays }];
