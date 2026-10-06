"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { AppNav } from "../sharedUi";
import { updateMyProfile, updateStoredCurrentUser, type CurrentUser } from "@/lib/api";
import { useCurrentUser } from "../useCurrentUser";
import { useAuth } from "../providers";
import styles from "../home.module.css";

export default function ProfilePage() {
  const user = useCurrentUser();
  const { refreshAuth, status } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncedUserId, setLastSyncedUserId] = useState<string | null>(null);

  // Sync the form from the loaded user by adjusting state during render
  // (the effect-based variant trips the react-hooks lint rule). Re-renders
  // with the same user id keep local edits intact while saving.
  if (user && user.id && user.id !== lastSyncedUserId) {
    setLastSyncedUserId(user.id);
    setName(user.displayName ?? user.firstName ?? "");
    setBio(user.bio ?? "");
  }

  async function save(e: FormEvent) {
    e.preventDefault();

    if (status === "loading" || !user) {
      toast.error("Please sign in before updating your profile.");
      return;
    }

    if (isSaving) {
      return;
    }

    const nextDisplayName = name.trim();
    const nextBio = bio.trim();

    setIsSaving(true);

    try {
      const result = await updateMyProfile({
        displayName: nextDisplayName,
        bio: nextBio,
      });

      const mergedUser: CurrentUser = {
        ...(user ?? {}),
        ...result,
      };

      updateStoredCurrentUser(mergedUser);
      await refreshAuth();
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update profile");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <AppNav />
      <section className={styles.routePage}>
        <p className={styles.sectionLabel}>Your space</p>
        <h1>{name || user?.username || "Your profile"}</h1>
        <p>{user?.city ? `Based in ${user.city}` : "Add your details to help people find common interests."}</p>

        <form className={styles.routeCard} onSubmit={save}>
          <h2>Profile details</h2>

          <label>
            Display name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={50}
              disabled={isSaving || status === "loading"}
            />
          </label>

          <label>
            Bio
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={500}
              placeholder="Tell the community a little about yourself"
              disabled={isSaving || status === "loading"}
            />
          </label>

          <p>
            <strong>Username:</strong> {user?.username || "Not available"}
          </p>
          <p>
            <strong>Email:</strong> {user?.email || "Not available"}
          </p>
          <p>
            <strong>City:</strong> {user?.city || "Not added yet"}
          </p>

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isSaving || status === "loading" || !user}
          >
            {isSaving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </section>
    </main>
  );
}
