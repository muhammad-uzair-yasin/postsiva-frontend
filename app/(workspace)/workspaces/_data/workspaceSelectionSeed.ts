import type { WorkspaceStitchCardSeed } from "../_types/workspaceSelectionSeed";

/** Static layout from `assets/workspace-selection-portal.html` (Stitch). Replace with API data later. */
export const STITCH_WORKSPACE_CARDS: WorkspaceStitchCardSeed[] = [
  {
    id: "main",
    variant: "primary",
    initialLetter: "M",
    title: "Main Workspace",
    memberAvatarSrcs: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC-aIGQS9HWbHRn_U1B6MubbSDYQOEexhkGmQYd4MEwMUGkr7MIQpIQMC0dtgPyjG1qgT8hBlDz4OqG7lrDL24eU93daHgfZNBYGQk4OPfOecVRflzmN86NqdfZ63G0FY3qiMFATJxuyxQw7oYiY2pmZzlKtHDjnSLskwODkPWam2JgYqzIZl5XkiUW3XM9WdKmimkp_tCuNWcCcDwmrJdzwMSTkUaC4_v07_7k4bdhR0qAX0aqZzp1KwSKyXx-rwKYRuC0iTbnD3r7",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDij7IYZSnCvddka8ekIvmxT4QG9SJEZt8whGNX1Ww6sbCJJR9yMzJogS11ChjFmNImSbnfjXtjrcTgsIKBfUQT6YtInxaEKPJan8XAIhaAUZfke2fvCGMqmsovOx8xUsX2Hqio5d09ynR48IifhJcPxV1aS1Y1cu8zzeOtJ9bjKrfaIWGxyp210wz_kkGLydQp-s-wRKCBAXbd5NiWX6r59rOIS4lWmm4vwpF8cFy5RZTvZFUb9721MW_fb0acTNMUkTyZ_uYUo1nK",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBYeNK88rxDF3k0Hc7JcxiSx2mPnIYXt0RrXsCT1Ax6xyXze3GXJd4Nr2AFNUAvz4kfpzhmLUt_MZOvDCzPJILE2qB2-EXcJP7OrIEug_9x8PHUptFf3Fw12f5ojHqeb7NAtt_kI4Xrf0m0pf9o6n3Z7yhbEdI3ZffmZwvie6vIFD2aqu81yYu8wHL9dB8GWZGhnVc6br736rQ4rqeJETNVGkK8m6zljAL1j8XAa0b9xaZG4N8577hP-JD1Bh5nvJf4FFe7DaeY2Zj4",
    ],
    memberOverflowLabel: "+5",
    channels: [
      { platform: "instagram", label: "@main_studio" },
      { platform: "linkedin", label: "Main Agency Inc." },
      { platform: "youtube", label: "Main Channel" },
    ],
  },
  {
    id: "design",
    variant: "secondary",
    initialLetter: "D",
    title: "Design Studio",
    memberAvatarSrcs: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCW2KPElCqdQEc0ZJ5oHCsnaP1DUWq3dCOrZyoIrKtlCJDXaqUuAKTqb76Og2RBO5bMADzZgU4III-16NSwSTJqUKvOt2fIszVqd1Dz_iN-aZBEtybqFL9kHWX5lcInLepyVDbwlpiB8AmW7drS9wXe5YAZ6ZCDZsfQJXh76ik7KKNXAa_2ErWCVv5vwCNXOmTn5tz77WRNjV6A0Vn8O3BgX5lvaYE9wweECtY2T6t2sfeZOBG9S0dfiV4vqdagIFhV_4HFreGn19x9",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAhj_eAc7xAPnDSUSAAk0e1v5p-jNEvH1CBxCK2c2ezRE--2Blw6IN1twtbSB7YQ9emGTUEYsdeJVLyVX0NOsFWgnQp2b3XCW4evWQOBnt5khFtlJTV-eK4QiAQyDXfJ7cHxnOPyItvPZJEpZiYnSxc9KpYYsZLcq31yVuektOjI2rIvOfID4LvWEAyCgXEVCI_a3UrIqqPx4vdEIPukLrd5XcHd4MXZ6NGjG7jJGTOEI6DuOdbazX2-Yj4Ip382u7rfTCDwABrwA8B",
    ],
    memberOverflowLabel: "+1",
    channels: [{ platform: "instagram", label: "@pixel_perfection" }],
    channelPlaceholder: "Only 1 channel connected",
  },
];
