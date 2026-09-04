import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export type ApiFeedbackType = "bug" | "feature_request";

export interface CreateFeedbackItemResult {
  success: boolean;
  error?: string;
  itemId?: number;
}

export async function createFeedbackItem(
  accessToken: string,
  input: {
    type: ApiFeedbackType;
    title: string;
    description: string;
  },
): Promise<CreateFeedbackItemResult> {
  const base = getApiBaseUrl();
  let res: Response;
  try {
    res = await fetchWithAccessTokenRetry(
      `${base}/feedback`,
      accessToken,
      (t) => ({
        Authorization: `Bearer ${t}`,
        "Content-Type": "application/json",
      }),
      {
        method: "POST",
        body: JSON.stringify({
          type: input.type,
          title: input.title,
          description: input.description,
        }),
      },
    );
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Feedback request failed",
    };
  }
  const data = (await res.json()) as {
    success?: boolean;
    item?: { id?: number };
    message?: string;
  };
  if (data.success === false) {
    return {
      success: false,
      error: typeof data.message === "string" ? data.message : "Feedback request failed",
    };
  }
  const id = data.item?.id;
  return {
    success: true,
    itemId: typeof id === "number" ? id : undefined,
  };
}
