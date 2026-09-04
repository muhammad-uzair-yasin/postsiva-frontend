"use client";

import { useCallback, useState } from "react";
import { PenLine } from "lucide-react";

import { adminSend } from "@/lib/admin/adminFetch";
import {
  buildMainWriterPlaygroundBody,
  formatMainWriterPlaygroundResult,
  MAIN_WRITER_PLAYGROUND_PATH,
  type MainWriterPlaygroundResponse,
  type MainWriterPlaygroundViewModel,
} from "@/lib/admin/mainWriterPlaygroundApi";

import { FieldLabel, inputClass, ProbeButton } from "../../ai-providers/_components/FormControls";
import {
  BRAND_PERSONA_PRESETS,
  USER_IDEA_PRESETS,
  USER_REQUIREMENTS_PRESETS,
} from "../_data/presets";
import { MAIN_WRITER_PLATFORM_OPTIONS } from "../_data/platforms";
import { PlatformMultiSelect } from "./PlatformMultiSelect";
import { PresetChips } from "./PresetChips";
import { MainWriterResultPanel } from "./MainWriterResultPanel";
import { MainWriterSettingsPanel } from "./MainWriterSettingsPanel";

const textareaClass = `${inputClass} min-h-[96px] resize-y`;

export function MainWriterPlaygroundScreen() {
  const [userIdea, setUserIdea] = useState("");
  const [brandPersona, setBrandPersona] = useState("");
  const [userRequirements, setUserRequirements] = useState("");
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<MainWriterPlaygroundViewModel | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const runPlayground = useCallback(async () => {
    const idea = userIdea.trim();
    if (!idea) {
      setStatusText("Validation error");
      setIsError(true);
      setErrorText("user_idea is required.");
      setView(null);
      return;
    }

    setBusy(true);
    setView(null);
    setErrorText(null);
    setStatusText("Running main writer…");
    setIsError(false);

    try {
      const body = buildMainWriterPlaygroundBody({
        userIdea,
        brandPersona,
        userRequirements,
        targetPlatforms,
      });
      const response = await adminSend<MainWriterPlaygroundResponse>(
        "POST",
        MAIN_WRITER_PLAYGROUND_PATH,
        body,
      );
      const formatted = formatMainWriterPlaygroundResult(response);
      setStatusText(formatted.statusText);
      setIsError(formatted.isError);
      setView(formatted.view);
      setErrorText(formatted.isError ? formatted.view.error : null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setView(null);
      setStatusText("Request failed");
      setIsError(true);
      setErrorText(message);
    } finally {
      setBusy(false);
    }
  }, [brandPersona, targetPlatforms, userIdea, userRequirements]);

  return (
    <div className="w-full min-w-0 space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-on-surface">
          <PenLine className="h-5 w-5 text-primary" />
          Main Writer Playground
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Configure the main writer prompt and model, then send test inputs and preview the
          formatted post. Changes to prompt and provider persist for all all-mode generation.
        </p>
      </div>

      <MainWriterSettingsPanel />

      <div className="space-y-5 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
        <h2 className="text-sm font-bold text-on-surface">Test inputs</h2>
        <div className="space-y-2">
          <FieldLabel htmlFor="mw-user-idea">User idea (required)</FieldLabel>
          <PresetChips
            presets={USER_IDEA_PRESETS}
            disabled={busy}
            onSelect={setUserIdea}
          />
          <textarea
            id="mw-user-idea"
            value={userIdea}
            onChange={(event) => setUserIdea(event.target.value)}
            disabled={busy}
            placeholder="What should the post be about?"
            className={textareaClass}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="mw-brand-persona">Brand persona (optional)</FieldLabel>
          <PresetChips
            presets={BRAND_PERSONA_PRESETS}
            disabled={busy}
            onSelect={setBrandPersona}
          />
          <textarea
            id="mw-brand-persona"
            value={brandPersona}
            onChange={(event) => setBrandPersona(event.target.value)}
            disabled={busy}
            placeholder="Voice, audience, tone…"
            className={textareaClass}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="mw-user-requirements">User requirements (optional)</FieldLabel>
          <PresetChips
            presets={USER_REQUIREMENTS_PRESETS}
            disabled={busy}
            onSelect={setUserRequirements}
          />
          <textarea
            id="mw-user-requirements"
            value={userRequirements}
            onChange={(event) => setUserRequirements(event.target.value)}
            disabled={busy}
            placeholder="Length, CTA, format constraints…"
            className={textareaClass}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="mw-target-platforms">Target platforms (optional)</FieldLabel>
          <PlatformMultiSelect
            id="mw-target-platforms"
            options={MAIN_WRITER_PLATFORM_OPTIONS}
            value={targetPlatforms}
            onChange={setTargetPlatforms}
            disabled={busy}
          />
          <p className="text-xs text-on-surface-variant">
            Multi-select. Leave empty to let the writer choose broadly; select platforms to
            request platform-specific titles (YouTube, Pinterest, TikTok).
          </p>
        </div>

        <ProbeButton busy={busy} disabled={!userIdea.trim()} icon={PenLine} onClick={() => void runPlayground()}>
          Run main writer
        </ProbeButton>
      </div>

      <MainWriterResultPanel
        view={view}
        pending={busy}
        errorText={errorText}
        statusText={statusText}
        isError={isError}
        targetPlatforms={targetPlatforms}
      />
    </div>
  );
}
