import { cn } from "@/lib/cn";
import Image from "next/image";

export const POSTSIVA_LOGO_PATH = "/postsiva-logo.jpeg";

interface PostsivaLogoMarkProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

/** App-style mark — used on marketing nav, footer, hero, and matches `metadata.icons`. */
export function PostsivaLogoMark({
  size = 40,
  className,
  priority = false,
}: PostsivaLogoMarkProps): React.ReactElement {
  return (
    <Image
      src={POSTSIVA_LOGO_PATH}
      alt="Postsiva"
      width={size}
      height={size}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
