"use client";

import Image from "next/image";
import styles from "../styles/avatar.module.css";

type AvatarPreviewProps = {
  imageSource: string;
  label: string;
};

export default function AvatarPreview({
  imageSource,
  label,
}: AvatarPreviewProps) {
  return (
    <div className={styles.avatarStage} aria-live="polite" aria-label={`Current avatar age: ${label}`}>
      <div className={styles.avatarGlow} aria-hidden="true" />

      <div className={styles.avatarRing}>
        <Image
          key={imageSource}
          src={imageSource}
          alt={`Avatar showing age ${label}`}
          width={180}
          height={180}
          priority
          className={styles.avatarImage}
          loading="eager"
        />
      </div>

      <span className={styles.ageChip} aria-label={`Age stage: ${label}`}>
        {label}
      </span>
    </div>
  );
}
