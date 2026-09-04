import type { ContentManagerPost } from "../_types/contentManagerTypes";

/** API platform query param for GET /unified/posts/{id} (LinkedIn org + personal → `linkedin`). */
export function platformFromContentManagerPost(post: ContentManagerPost): string {
  const root = post.channel.split(":")[0]?.trim().toLowerCase() ?? "";
  if (root === "linkedin" || post.channel.startsWith("linkedin:")) {
    return "linkedin";
  }
  if (root === "facebook" || post.channel.startsWith("facebook:")) {
    return "facebook";
  }
  return root;
}
