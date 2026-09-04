"use client";

import Link from "next/link";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { WorkspacePageScaffold } from "../../../../_components/WorkspacePageScaffold";
import { useDraftEditorActions } from "../_hooks/useDraftEditorActions";
import { useDraftEditorLoad } from "../_hooks/useDraftEditorLoad";
import { useDraftEditorScheduleAndImage } from "../_hooks/useDraftEditorScheduleAndImage";
import { DraftEditorLoaded } from "./DraftEditorLoaded";

interface DraftEditorScreenProps {
  draftId: string;
}

export function DraftEditorScreen({
  draftId,
}: DraftEditorScreenProps): React.ReactElement {
  const { t } = useTranslations();
  const { draft, caption, setCaption, loadError, isLoading, setDraft } =
    useDraftEditorLoad(draftId);
  const { isSaving, actionError, save, publish, remove, changeAccount } =
    useDraftEditorActions(
      draftId,
      caption,
      draft?.platform,
      setDraft,
      setCaption,
      undefined,
    );
  const {
    mediaBusy,
    mediaError,
    scheduleBusy,
    scheduleError,
    scheduleDraft,
    changeMediaFromFile,
    changeMediaFromUrl,
  } = useDraftEditorScheduleAndImage(draftId, setDraft);

  return (
    <WorkspacePageScaffold>
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 md:pt-12">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/drafts"
            className="rounded-xl border border-outline-variant/15 bg-surface-container-low px-3 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
          >
            {t("content.draftBack")}
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">
            {t("content.draftEditTitle")}
          </h1>
        </div>

        {isLoading ? (
          <p className="text-on-surface-variant">{t("content.draftLoading")}</p>
        ) : null}
        {loadError ? (
          <p className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {loadError}
          </p>
        ) : null}

        {!isLoading && draft && !loadError ? (
          <DraftEditorLoaded
            draft={draft}
            caption={caption}
            onCaptionChange={setCaption}
            actionError={actionError}
            isSaving={isSaving}
            mediaBusy={mediaBusy}
            mediaError={mediaError}
            scheduleBusy={scheduleBusy}
            scheduleError={scheduleError}
            onPickMedia={(file, kind) => {
              void changeMediaFromFile(file, kind);
            }}
            onPickLibraryMedia={(url, mediaId, kind) => {
              void changeMediaFromUrl(url, mediaId, kind);
            }}
            onSchedule={(isoUtc) => {
              void scheduleDraft(isoUtc);
            }}
            onSave={(extra) => save(extra)}
            onPublish={() => {
              void publish();
            }}
            onRemove={() => {
              void remove();
            }}
            onChangeAccount={changeAccount}
          />
        ) : null}
      </div>
    </WorkspacePageScaffold>
  );
}
