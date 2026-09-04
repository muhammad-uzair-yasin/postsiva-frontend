export type WorkspaceSettingsHubRow = {
  href: string;
  labelKey: string;
  descriptionKey: string;
  icon: string;
};

export const WORKSPACE_SETTINGS_HUB_ROWS: readonly WorkspaceSettingsHubRow[] = [
  {
    href: "/settings/general",
    labelKey: "shell.settingsGeneral",
    descriptionKey: "shell.settingsGeneralHint",
    icon: "tune",
  },
  {
    href: "/settings/ai",
    labelKey: "shell.aiSettings",
    descriptionKey: "shell.settingsAiHint",
    icon: "auto_awesome",
  },
  {
    href: "/settings/comment-categories",
    labelKey: "shell.commentCategories",
    descriptionKey: "shell.settingsCommentCategoriesHint",
    icon: "label",
  },
  {
    href: "/settings/preferences",
    labelKey: "shell.language",
    descriptionKey: "shell.settingsLanguageHint",
    icon: "language",
  },
  {
    href: "/settings/notifications",
    labelKey: "shell.notifications",
    descriptionKey: "shell.settingsNotificationsHint",
    icon: "notifications",
  },
];
