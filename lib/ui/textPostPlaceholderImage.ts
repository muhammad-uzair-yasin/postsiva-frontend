import textPostPlaceholderImage from "@/assets/images/placholder.png";

/** Shown when a text-only post has no attached image/video. */
export const TEXT_POST_PLACEHOLDER_IMAGE_SRC: string =
  typeof textPostPlaceholderImage === "string"
    ? textPostPlaceholderImage
    : textPostPlaceholderImage.src;
