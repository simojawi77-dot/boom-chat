"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "../styles/avatar.module.css";

type AvatarPreviewProps = {
  imageSource: string;
  label: string;
};

export default function AvatarPreview({
  imageSource,
  label,
}: AvatarPreviewProps) {
  const [displayedSource, setDisplayedSource] = useState(imageSource);
  const [previousSource, setPreviousSource] = useState<string | null>(null);

  useEffect(() => {
    if (imageSource === displayedSource) return;

    let cancelled = false;
    const nextImage = new window.Image();
    nextImage.onload = () => {
      if (!cancelled) {
        setPreviousSource(displayedSource);
        setDisplayedSource(imageSource);
      }
    };
    nextImage.src = imageSource;

    return () => {
      cancelled = true;
    };
  }, [displayedSource, imageSource]);

  return (
    <div
      className={styles.avatarStage}
      aria-live="polite"
      aria-label={`Current avatar age: ${label}`}
    >
      <div className={styles.avatarGlow} aria-hidden="true" />

      <div className={styles.avatarRing}>
        <div className={styles.avatarMedia}>
          {previousSource && (
            <Image
              src={previousSource}
              alt=""
              width={1024}
              height={1024}
              aria-hidden="true"
              className={styles.avatarImageLeaving}
              onAnimationEnd={() => setPreviousSource(null)}
            />
          )}
          <Image
            key={displayedSource}
            src={displayedSource}
            alt={`Avatar showing age ${label}`}
            width={1024}
            height={1024}
            sizes="(max-width: 640px) 170px, (max-width: 1024px) 220px, 240px"
            priority
            className={styles.avatarImage}
          />
        </div>
      </div>
    </div>
  );
}