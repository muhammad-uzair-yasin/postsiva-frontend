import type { ReactElement } from "react";

/**
 * Material Symbols Outlined stylesheet for `material-symbols-outlined` ligatures.
 */
export function MaterialSymbolsLink(): ReactElement {
  return (
    // eslint-disable-next-line @next/next/no-page-custom-font -- scoped icon font for app shells
    <link
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
      rel="stylesheet"
    />
  );
}
