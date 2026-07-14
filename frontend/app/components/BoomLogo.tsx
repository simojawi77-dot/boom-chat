import Image from "next/image";
import { CSSProperties } from "react";

type BoomLogoProps = {
  className?: string;
  style?: CSSProperties;
};

export default function BoomLogo({
  className = "",
  style,
}: BoomLogoProps) {
  return (
    <Image
      src="/boom-logo.png"
      alt="Boom Logo"
      width={119}
      height={111}
      priority
      className={`w-28 h-auto object-contain ${className}`}
      style={style}
    />
  );
}