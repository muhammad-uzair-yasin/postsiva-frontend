import type { StaticImageData } from "next/image";

import googledrive from "@/assets/social-icons/googledrive.png";
import onedrive from "@/assets/social-icons/onedrive.png";
import dropbox from "@/assets/social-icons/dropbox.png";

import type { CloudProvider } from "./cloudStorageApi";

function iconSrc(img: StaticImageData | string): string {
  return typeof img === "string" ? img : img.src;
}

/** Brand logos for cloud storage providers (`assets/social-icons/`). */
export const CLOUD_PROVIDER_ICON_SRC: Record<CloudProvider, string> = {
  google_drive: iconSrc(googledrive),
  onedrive: iconSrc(onedrive),
  dropbox: iconSrc(dropbox),
};
