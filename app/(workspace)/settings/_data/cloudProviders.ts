import type { CloudProvider } from "@/lib/social/cloudStorageApi";

export interface CloudProviderItem {
  provider: CloudProvider;
  name: string;
  description: string;
  icon: string;
  iconWrapperClassName: string;
  /** MVP: only Google Drive is actionable; the rest render as "Coming soon". */
  comingSoon: boolean;
}

export const CLOUD_PROVIDER_ITEMS: readonly CloudProviderItem[] = [
  {
    provider: "google_drive",
    name: "Google Drive",
    description: "Import images and videos from your Google Drive.",
    icon: "add_to_drive",
    iconWrapperClassName: "bg-[#1a73e8] shadow-[0_0_20px_rgba(26,115,232,0.3)]",
    comingSoon: false,
  },
  {
    provider: "onedrive",
    name: "OneDrive",
    description: "Import media from Microsoft OneDrive.",
    icon: "cloud",
    iconWrapperClassName: "bg-[#0364B8] shadow-[0_0_20px_rgba(3,100,184,0.3)]",
    comingSoon: false,
  },
  {
    provider: "dropbox",
    name: "Dropbox",
    description: "Import media from your Dropbox.",
    icon: "cloud_queue",
    iconWrapperClassName: "bg-[#0061FF] shadow-[0_0_20px_rgba(0,97,255,0.3)]",
    comingSoon: false,
  },
];
