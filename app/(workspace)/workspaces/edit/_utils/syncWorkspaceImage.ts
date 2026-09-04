import {
  patchWorkspaceImageUrl,
  uploadWorkspaceImage,
} from "@/lib/workspaces/workspaceApi";

export async function syncWorkspaceImage(
  accessToken: string,
  workspaceId: string,
  input:
    | { kind: "file"; file: File }
    | { kind: "url"; url: string | null },
): Promise<{ image_url: string | null }> {
  if (input.kind === "file") {
    return uploadWorkspaceImage(accessToken, workspaceId, input.file);
  }
  return patchWorkspaceImageUrl(accessToken, workspaceId, input.url);
}
