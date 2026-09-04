"use client";

import { useState } from "react";

import {
  HELP_FACEBOOK_COMMUNITY_URL,
  HELP_SUPPORT_EMAIL,
  HELP_SUPPORT_MAILTO,
} from "@/lib/help/helpSupportLinks";

/** Client-only article feedback (no backend required). */
export function HelpArticleFeedback(): React.ReactElement {
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);

  return (
    <div className="mt-12 rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
      <p className="text-sm font-semibold text-[#111827]">Was this article helpful?</p>
      {choice ? (
        <p className="mt-3 text-sm text-[#4B5563]">
          {choice === "yes" ? (
            "Thanks — glad it helped."
          ) : (
            <>
              Thanks for the feedback. Email{" "}
              <a href={HELP_SUPPORT_MAILTO} className="font-semibold text-[#0058bc] hover:underline">
                {HELP_SUPPORT_EMAIL}
              </a>{" "}
              if you are still stuck, or{" "}
              <a
                href={HELP_FACEBOOK_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#0058bc] hover:underline"
              >
                ask the Facebook community
              </a>
              .
            </>
          )}
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setChoice("yes")}
            className="inline-flex items-center rounded-full border border-[#BFDBFE] bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition-colors hover:border-[#0058bc]/40 hover:text-[#0058bc]"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setChoice("no")}
            className="inline-flex items-center rounded-full border border-[#BFDBFE] bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition-colors hover:border-[#0058bc]/40 hover:text-[#0058bc]"
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}
