import { cn } from "@/lib/cn";
import type { StaticImageData } from "next/image";
import Image from "next/image";

interface LightScreenshotFrameProps {
  readonly src: StaticImageData;
  readonly alt: string;
  readonly className?: string;
  readonly imageClassName?: string;
  readonly priority?: boolean;
  readonly sizes?: string;
}

/** Full product screenshot — no object-cover crop; dark frame like legacy marketing. */
export function LightScreenshotFrame({
  src,
  alt,
  className,
  imageClassName,
  priority = false,
  sizes = "100vw",
}: LightScreenshotFrameProps): React.ReactElement {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-[#0c0e14] p-1 shadow-inner ring-1 ring-black/10 sm:rounded-3xl sm:p-1.5",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={src.width}
        height={src.height}
        priority={priority}
        placeholder="blur"
        className={cn("block h-auto w-full rounded-lg sm:rounded-xl", imageClassName)}
        sizes={sizes}
      />
    </div>
  );
}

/** Tailwind class strings for Postsiva accent on light landing (not Lumio coral). */
export const lightAccentText = "text-primary";
export const lightAccentBar = "bg-primary";
export const lightAccentHover = "hover:text-primary hover:border-primary";
