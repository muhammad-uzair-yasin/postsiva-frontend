import { adPlatform } from "./adPlatform";
import { auth } from "./auth";
import { postScheduler } from "./postScheduler";
import { aiPipeline, aiWatcher } from "./aiWatcher";
import { cloudSave } from "./cloudSave";
import { cloudStorage } from "./cloudStorage";
import { designing } from "./designing";
import { common } from "./common";
import { composer, dashboard } from "./dashboard";
import { content, inbox } from "./inbox";
import { feedback } from "./feedback";
import { nav } from "./nav";
import { trends } from "./trends";
import { personas } from "./personas";
import { notifications, preferences, themes } from "./preferences";
import { shell } from "./shell";
import { settings } from "./settings";
import { billing, workspaces } from "./workspaces";

/** Workspace catalog — marketing strings live in `publicCatalog` only. */
export const enMessages = {
  nav,
  shell,
  trends,
  common,
  cloudSave,
  cloudStorage,
  designing,
  themes,
  preferences,
  notifications,
  settings,
  dashboard,
  composer,
  inbox,
  content,
  aiWatcher,
  aiPipeline,
  workspaces,
  billing,
  postScheduler,
  personas,
  feedback,
  adPlatform,
  auth,
} as const;
