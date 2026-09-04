import type { StaticImageData } from "next/image";

import canva from "@/assets/social-icons/canva.png";

function iconSrc(img: StaticImageData | string): string {
  return typeof img === "string" ? img : img.src;
}

/** Canva brand logo (`assets/social-icons/canva.png`). */
export const CANVA_ICON_SRC = iconSrc(canva);
