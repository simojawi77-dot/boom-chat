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
    <div className={styles.avatarStage} aria-live="polite">
      <div className={styles.avatarGlow} aria-hidden="true" />

      <div className={styles.avatarRing}>
        <Image
          key={imageSource}
          src={imageSource}
          alt="Registration avatar"
          width={180}
          height={180}
          priority
          className={styles.avatarImage}
        />
      </div>

      <span className={styles.ageChip}>{label}</span>
    </div>
  );
}
